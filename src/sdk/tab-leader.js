/**
 * Multi-tab SIP leader (experiment): one REGISTER per origin+extension.
 * Bus: BroadcastChannel. Election: navigator.locks (fallback: claim if no peer state).
 *
 * Leader owns PhoneCore SIP/WebRTC. Followers mirror UI events and proxy commands
 * (answer/hangup/…) without focusing the leader tab.
 *
 * Opt-out: config.EnableMultiTabLeader = false
 * Opt-in force: config.EnableMultiTabLeader = true
 * Default: enabled in browser, disabled when window.VPhoneDesktop is present.
 */

const DEFAULT_CHANNEL_PREFIX = "vphone-tab";
const LOCK_PREFIX = "vphone-sip-leader";
const PROTOCOL = 1;

const PROXY_METHODS = [
  "register",
  "unregister",
  "toggleRegistration",
  "reconnect",
  "call",
  "answer",
  "reject",
  "hangup",
  "mute",
  "unmute",
  "toggleMute",
  "hold",
  "resume",
  "sendDTMF",
  "transfer",
  "conference",
  "warmMedia"
];

const MIRROR_EVENTS = [
  "registration-changed",
  "incoming-call",
  "outgoing-call",
  "call-connected",
  "call-ended",
  "mute-changed",
  "hold-changed",
  "dtmf-sent"
];

function makeTabId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function accountKey(config = {}) {
  const user = String(config.Username || "").trim().toLowerCase();
  const domain = String(config.Domain || "").trim().toLowerCase();
  return `${domain || "default"}:${user || "anon"}`;
}

function isExplicitFalse(value) {
  return value === false || value === 0 || value === "0" || value === "false";
}

function isExplicitTrue(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function shouldEnableTabLeader(config = {}) {
  if (isExplicitFalse(config.EnableMultiTabLeader)) return false;
  if (typeof window === "undefined") return false;
  if (window.VPhoneDesktop) return false;
  if (isExplicitTrue(config.EnableMultiTabLeader)) return true;
  return typeof BroadcastChannel !== "undefined";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clonePayload(payload) {
  if (payload == null) return payload;
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    return typeof payload === "object" ? { ...payload } : payload;
  }
}

/**
 * @param {object} sdk PhoneSDK instance
 * @param {{ config?: object, channelName?: string, lockName?: string, followerWaitMs?: number }} [options]
 */
export function installTabLeader(sdk, options = {}) {
  if (!sdk || sdk._tabLeaderInstalled) return sdk._tabLeaderController || null;
  if (typeof BroadcastChannel === "undefined") return null;

  const config = options.config || sdk.core?.config || {};
  const key = accountKey(config);
  const channelName = options.channelName || `${DEFAULT_CHANNEL_PREFIX}:${key}`;
  const lockName = options.lockName || `${LOCK_PREFIX}:${key}`;
  const followerWaitMs = Number(options.followerWaitMs) > 0 ? Number(options.followerWaitMs) : 2500;

  const tabId = makeTabId();
  const originals = {};
  const pending = new Map();
  const eventUnsubs = [];

  // Start as follower until this tab acquires the exclusive lock.
  let role = "follower";
  let stopped = false;
  let wantRegistered = false;
  let mirroredReg = { online: false, user: "", error: undefined };
  let releaseLeadership = null;
  let channel = null;
  let sawPeerLeader = false;

  const controller = {
    tabId,
    channelName,
    lockName,
    getRole: () => role,
    isLeader: () => role === "leader",
    getMirroredRegistration: () => ({ ...mirroredReg }),
    destroy
  };

  function post(msg) {
    try {
      channel?.postMessage({ v: PROTOCOL, from: tabId, ts: Date.now(), ...msg });
    } catch {
      // ignore
    }
  }

  function setRole(next) {
    if (role === next) return;
    role = next;
    try {
      sdk.core?.emit?.("tab-role-changed", { role, tabId, channelName });
    } catch {
      // ignore
    }
  }

  function applyMirroredRegistration(state = {}) {
    mirroredReg = {
      online: !!state.online,
      user: state.user || mirroredReg.user || "",
      error: state.error,
      status: state.status || (state.online ? "online" : (state.reason === "unregistered" ? "offline" : "register-failed")),
      reason: state.reason
    };
    // Never fake core.isRegistered on followers — that skips real SIP REGISTER
    // when this tab later becomes leader (no UserAgent → no inbound calls).
    if (role === "leader" && sdk.core?.userAgent) {
      sdk.core.isRegistered = !!mirroredReg.online;
      sdk.core._lastRegisterError = mirroredReg.online
        ? ""
        : String(mirroredReg.error || sdk.core._lastRegisterError || "");
      if (typeof sdk.core._intentionallyUnregistered === "boolean") {
        sdk.core._intentionallyUnregistered = mirroredReg.status === "offline";
      }
    }
  }

  function hasLiveSipRegistration() {
    return !!(sdk.core?.userAgent && sdk.core?.registerer && sdk.core?.isRegistered);
  }

  function broadcastEvent(name, payload) {
    if (role !== "leader") return;
    if (name === "local-stream" || name === "remote-stream" || name === "local-stream-stopped") return;
    post({ type: "event", name, payload: clonePayload(payload) });
  }

  function readLocalRegistration() {
    if (originals.getRegistrationState) return originals.getRegistrationState.call(sdk);
    return sdk.core?.getRegistrationState?.() || mirroredReg;
  }

  function broadcastState() {
    if (role !== "leader") return;
    const state = readLocalRegistration();
    applyMirroredRegistration(state);
    post({
      type: "state",
      role: "leader",
      state,
      call: {
        muted: !!sdk.core?.isMuted,
        onHold: !!sdk.core?.isOnHold,
        hasSession: !!sdk.core?.session
      }
    });
  }

  async function unlockLeaderAudio() {
    if (role !== "leader" || typeof window === "undefined") return;
    try {
      await originals.warmMedia?.call(sdk, { audio: true, video: false });
    } catch {
      // optional
    }
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      if (ctx.state === "suspended") await ctx.resume();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      setTimeout(() => {
        try { ctx.close(); } catch { /* ignore */ }
      }, 100);
    } catch {
      // may still need a gesture on the leader tab
    }
  }

  async function ensureLeaderRegistered() {
    if (role !== "leader" || !wantRegistered) return readLocalRegistration();
    if (hasLiveSipRegistration()) {
      const current = readLocalRegistration();
      applyMirroredRegistration(current);
      broadcastState();
      return current;
    }
    // Clear stale mirrored "online" so PhoneCore.register() does not early-return.
    if (sdk.core) {
      sdk.core.isRegistered = false;
    }
    const state = await originals.register.call(sdk);
    applyMirroredRegistration(state || { online: true });
    await unlockLeaderAudio();
    broadcastState();
    return state || mirroredReg;
  }

  function wireCoreEvents() {
    for (const name of MIRROR_EVENTS) {
      const handler = (payload) => {
        if (name === "registration-changed") applyMirroredRegistration(payload || {});
        broadcastEvent(name, payload);
      };
      sdk.core?.on?.(name, handler);
      eventUnsubs.push(() => sdk.core?.off?.(name, handler));
    }
  }

  function handleCommand(msg) {
    if (role !== "leader") return;
    const { name, args, requestId, from } = msg;
    if (!name || typeof originals[name] !== "function") {
      post({ type: "cmd-result", requestId, to: from, ok: false, error: `Unknown command: ${name}` });
      return;
    }
    Promise.resolve()
      .then(async () => {
        if (name !== "register" && name !== "unregister" && wantRegistered) {
          const reg = readLocalRegistration();
          if (!reg?.online && name !== "toggleRegistration") {
            await ensureLeaderRegistered();
          }
        }
        return originals[name].apply(sdk, Array.isArray(args) ? args : []);
      })
      .then((result) => {
        post({ type: "cmd-result", requestId, to: from, ok: true, result: clonePayload(result) });
        broadcastState();
      })
      .catch((err) => {
        post({
          type: "cmd-result",
          requestId,
          to: from,
          ok: false,
          error: String(err?.message || err)
        });
      });
  }

  function onMessage(event) {
    const msg = event?.data;
    if (!msg || msg.v !== PROTOCOL || msg.from === tabId) return;

    if (msg.type === "hello" || msg.type === "request-state") {
      if (role === "leader") broadcastState();
      return;
    }

    if (msg.type === "state") {
      sawPeerLeader = true;
      if (role !== "leader") {
        applyMirroredRegistration(msg.state || {});
        sdk.core?.emit?.("registration-changed", { ...mirroredReg });
      }
      return;
    }

    if (msg.type === "event" && role !== "leader") {
      if (msg.name === "registration-changed") applyMirroredRegistration(msg.payload || {});
      try {
        sdk.core?.emit?.(msg.name, msg.payload);
      } catch {
        // ignore
      }
      return;
    }

    if (msg.type === "cmd" && role === "leader") {
      handleCommand(msg);
      return;
    }

    if (msg.type === "cmd-result" && msg.to === tabId) {
      const entry = pending.get(msg.requestId);
      if (!entry) return;
      pending.delete(msg.requestId);
      clearTimeout(entry.timer);
      if (msg.ok) entry.resolve(msg.result);
      else entry.reject(new Error(msg.error || "Tab leader command failed"));
      return;
    }

    if (msg.type === "leader-left" && role !== "leader") {
      sawPeerLeader = false;
      applyMirroredRegistration({ ...mirroredReg, online: false, error: "Leader tab closed" });
      sdk.core?.emit?.("registration-changed", { ...mirroredReg });
    }
  }

  function sendCommand(name, args) {
    if (role === "leader") return Promise.resolve(originals[name].apply(sdk, args));
    const requestId = `${tabId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`Tab leader did not respond to "${name}"`));
      }, followerWaitMs);
      pending.set(requestId, { resolve, reject, timer });
      post({ type: "cmd", name, args: args || [], requestId });
    });
  }

  async function waitUntilReady() {
    const start = Date.now();
    while (!stopped && Date.now() - start < followerWaitMs) {
      if (role === "leader") {
        try {
          return await ensureLeaderRegistered();
        } catch (err) {
          const error = String(err?.message || err);
          applyMirroredRegistration({ online: false, user: mirroredReg.user, error });
          broadcastState();
          throw err;
        }
      }
      if (mirroredReg.online) return { ...mirroredReg, role: "follower" };
      // Peer already announced itself; keep waiting for state/events.
      if (sawPeerLeader) {
        await sleep(40);
        continue;
      }
      await sleep(40);
    }
    if (role === "leader") return ensureLeaderRegistered();
    if (mirroredReg.online) return { ...mirroredReg, role: "follower" };
    return {
      ...mirroredReg,
      online: !!mirroredReg.online,
      role: role === "leader" ? "leader" : "follower",
      error: mirroredReg.error || (sawPeerLeader ? "Leader offline" : "Waiting for leader tab")
    };
  }

  async function onAcquiredLeadership() {
    setRole("leader");
    // Previous leader may have died without unregister; always (re)bind SIP here.
    if (wantRegistered) {
      try {
        await ensureLeaderRegistered();
      } catch {
        // Keep lock; UI can retry register/toggle.
        applyMirroredRegistration({
          online: false,
          user: mirroredReg.user,
          error: mirroredReg.error || "Register failed"
        });
        broadcastState();
      }
    } else {
      post({ type: "state", role: "leader", state: readLocalRegistration(), call: { hasSession: false } });
    }
  }

  function resignLeader() {
    if (role === "leader") {
      post({ type: "leader-left" });
    }
    setRole("follower");
  }

  async function runLeadershipLoop() {
    if (typeof navigator === "undefined" || !navigator.locks?.request) {
      await sleep(150);
      if (stopped) return;
      if (!sawPeerLeader && role !== "leader") {
        const hold = new Promise((resolve) => {
          releaseLeadership = resolve;
        });
        await onAcquiredLeadership();
        await hold;
        resignLeader();
      }
      return;
    }

    while (!stopped) {
      await navigator.locks.request(lockName, async () => {
        if (stopped) return;
        const hold = new Promise((resolve) => {
          releaseLeadership = resolve;
        });
        await onAcquiredLeadership();
        await hold;
        resignLeader();
        releaseLeadership = null;
      });
      if (!stopped) await sleep(40);
    }
  }

  function wrapMethods() {
    for (const name of PROXY_METHODS) {
      if (typeof sdk[name] !== "function") continue;
      originals[name] = sdk[name].bind(sdk);

      if (name === "register") {
        sdk.register = async () => {
          wantRegistered = true;
          post({ type: "hello" });
          post({ type: "request-state" });
          const result = await waitUntilReady();
          if (role !== "leader") {
            sdk.core?.emit?.("registration-changed", { ...mirroredReg });
          }
          return result;
        };
        continue;
      }

      if (name === "unregister") {
        sdk.unregister = async (...args) => {
          wantRegistered = false;
          if (role === "leader") {
            const out = await originals.unregister(...args);
            broadcastState();
            return out;
          }
          return sendCommand("unregister", args);
        };
        continue;
      }

      sdk[name] = (...args) => {
        if (role === "leader") return originals[name](...args);
        return sendCommand(name, args);
      };
    }

    originals.getRegistrationState = sdk.getRegistrationState?.bind(sdk);
    sdk.getRegistrationState = () => {
      if (role === "leader" && originals.getRegistrationState) return originals.getRegistrationState();
      return { ...mirroredReg };
    };
  }

  function onUserGesture() {
    if (role === "leader") unlockLeaderAudio();
  }

  function destroy() {
    stopped = true;
    wantRegistered = false;
    try {
      document.removeEventListener("pointerdown", onUserGesture, true);
      document.removeEventListener("keydown", onUserGesture, true);
    } catch {
      // ignore
    }
    for (const unsub of eventUnsubs) {
      try { unsub(); } catch { /* ignore */ }
    }
    eventUnsubs.length = 0;
    for (const [, entry] of pending) {
      clearTimeout(entry.timer);
      entry.reject(new Error("Tab leader destroyed"));
    }
    pending.clear();
    if (typeof releaseLeadership === "function") {
      try { releaseLeadership(); } catch { /* ignore */ }
    }
    if (role === "leader") {
      try { originals.unregister?.call(sdk); } catch { /* ignore */ }
      try { post({ type: "leader-left" }); } catch { /* ignore */ }
    }
    try { channel?.close(); } catch { /* ignore */ }
    channel = null;
    for (const name of Object.keys(originals)) {
      sdk[name] = originals[name];
    }
    sdk._tabLeaderInstalled = false;
    sdk._tabLeaderController = null;
    role = "follower";
  }

  channel = new BroadcastChannel(channelName);
  channel.onmessage = onMessage;
  wrapMethods();
  wireCoreEvents();

  try {
    document.addEventListener("pointerdown", onUserGesture, true);
    document.addEventListener("keydown", onUserGesture, true);
  } catch {
    // non-DOM
  }

  runLeadershipLoop();
  post({ type: "hello" });

  sdk._tabLeaderInstalled = true;
  sdk._tabLeaderController = controller;
  return controller;
}
