var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// ../../src/sdk/sip-auth.js
function isMd5Hex32(value) {
  return /^[a-f0-9]{32}$/i.test(String(value || "").trim());
}
function md5cycle(x, k) {
  let [a, b, c, d] = x;
  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);
  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);
  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);
  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);
  x[0] = a + x[0] | 0;
  x[1] = b + x[1] | 0;
  x[2] = c + x[2] | 0;
  x[3] = d + x[3] | 0;
}
function cmn(q, a, b, x, s, t) {
  a = a + q + x + t | 0;
  return (a << s | a >>> 32 - s) + b | 0;
}
function ff(a, b, c, d, x, s, t) {
  return cmn(b & c | ~b & d, a, b, x, s, t);
}
function gg(a, b, c, d, x, s, t) {
  return cmn(b & d | c & ~d, a, b, x, s, t);
}
function hh(a, b, c, d, x, s, t) {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}
function ii(a, b, c, d, x, s, t) {
  return cmn(c ^ (b | ~d), a, b, x, s, t);
}
function md51(s) {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  }
  s = s.substring(i - 64);
  const tail = new Array(16).fill(0);
  for (i = 0; i < s.length; i += 1) {
    tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
  }
  tail[i >> 2] |= 128 << (i % 4 << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (let j = 0; j < 16; j += 1) tail[j] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return state;
}
function md5blk(s) {
  const md5blks = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}
function rhex(n) {
  const hex = "0123456789abcdef";
  let s = "";
  for (let j = 0; j < 4; j += 1) {
    s += hex.charAt(n >> j * 8 + 4 & 15) + hex.charAt(n >> j * 8 & 15);
  }
  return s;
}
function md5Hex(input) {
  const str = unescape(encodeURIComponent(String(input ?? "")));
  return md51(str).map(rhex).join("");
}
function computeHa1(username, realm, password) {
  return md5Hex(`${String(username || "")}:${String(realm || "")}:${String(password || "")}`);
}
function normalizeSipPasswordAndType(rawPassword, rawType) {
  let password = String(rawPassword || "").trim();
  const type = String(rawType || "").toLowerCase().trim();
  const prefixed = password.match(/^(?:md5|ha1)\s*[:=]\s*([a-f0-9]{32})$/i);
  if (prefixed) {
    return { password: prefixed[1].toLowerCase(), type: "ha1" };
  }
  if (type === "ha1") {
    if (isMd5Hex32(password)) return { password: password.toLowerCase(), type: "ha1" };
    return { password, type: "plain" };
  }
  return { password, type: "plain" };
}
function prepareSipPasswordForStorage(rawPassword, {
  username = "",
  realm = "",
  passwordType = ""
} = {}) {
  const normalized = normalizeSipPasswordAndType(rawPassword, passwordType);
  if (!normalized.password) return { password: "", type: "ha1" };
  if (normalized.type === "ha1") return normalized;
  if (!username || !realm) {
    return { password: normalized.password, type: "plain" };
  }
  return {
    password: computeHa1(username, realm, normalized.password),
    type: "ha1"
  };
}
function sipAuthorizationOptions(rawPassword, rawType) {
  const auth = normalizeSipPasswordAndType(rawPassword, rawType);
  if (auth.type === "ha1") {
    return { authorizationHa1: auth.password, authorizationPassword: void 0 };
  }
  return { authorizationPassword: auth.password, authorizationHa1: void 0 };
}

// ../../src/core/phone-core.js
function buildWsUrl(config) {
  const host = config.Server || "";
  const port = config.Port || "443";
  const path = config.ServerPath || "/ws";
  if (!host || !port) return "";
  const useTls = config.Wss !== false && config.Wss !== 0 && config.Wss !== "0" && config.Wss !== "false";
  return `${useTls ? "wss" : "ws"}://${host}:${port}${path}`;
}
function resolveSipDomain(config = {}) {
  const explicit = String(config.Domain || "").trim();
  if (explicit) return explicit;
  return String(config.Server || "").trim();
}
var SIPJS_FILENAME = "sip-0.21.2.min.js";
function resolveBundledSipJsUrl() {
  try {
    const base = typeof import.meta !== "undefined" && import.meta && import.meta.url;
    if (typeof base !== "string" || !/^(https?:|file:|blob:|chrome-extension:|app:)/i.test(base)) {
      return "";
    }
    return new URL(`../vendor/${SIPJS_FILENAME}`, base).href;
  } catch {
    return "";
  }
}
var sipJsLoadPromise = null;
function loadScript(src) {
  if (typeof document === "undefined") return Promise.reject(new Error("SIP.js not loaded"));
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-vphone-runtime="sipjs"][src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      if (globalThis.SIP) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-vphone-runtime", "sipjs");
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}
var EventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, /* @__PURE__ */ new Set());
    this.listeners.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }
  off(eventName, handler) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.listeners.delete(eventName);
  }
  emit(eventName, payload) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    for (const handler of set) handler(payload);
  }
};
var _MediaManager_instances, replaceTrack_fn;
var MediaManager = class extends EventEmitter {
  constructor({ mediaDevices = navigator.mediaDevices } = {}) {
    super();
    __privateAdd(this, _MediaManager_instances);
    this.mediaDevices = mediaDevices;
    this.localStream = null;
    this.currentConstraints = { audio: true, video: false };
    this.preferredDeviceIds = {
      audioinput: "",
      videoinput: "",
      audiooutput: ""
    };
    this.audioProcessing = {
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true
    };
  }
  setAudioProcessing(partial = {}) {
    this.audioProcessing = {
      ...this.audioProcessing,
      ...partial
    };
    return this.audioProcessing;
  }
  getAudioConstraints() {
    const audio = {
      noiseSuppression: this.audioProcessing.noiseSuppression !== false,
      echoCancellation: this.audioProcessing.echoCancellation !== false,
      autoGainControl: this.audioProcessing.autoGainControl !== false
    };
    const micId = this.preferredDeviceIds.audioinput;
    if (micId) audio.deviceId = { ideal: micId };
    return audio;
  }
  async getLocalStream(constraints) {
    const normalized = constraints && typeof constraints === "object" ? {
      audio: constraints.audio === void 0 ? this.getAudioConstraints() : constraints.audio === true ? this.getAudioConstraints() : constraints.audio,
      video: constraints.video ?? false
    } : { audio: this.getAudioConstraints(), video: false };
    this.currentConstraints = normalized;
    const wantAudio = !!normalized.audio;
    const wantVideo = !!normalized.video;
    const liveTracks = this.localStream?.getTracks?.().filter((track) => track.readyState === "live") || [];
    const hasLiveAudio = liveTracks.some((track) => track.kind === "audio");
    const hasLiveVideo = liveTracks.some((track) => track.kind === "video");
    if (this.localStream && (!wantAudio || hasLiveAudio) && (!wantVideo || hasLiveVideo)) {
      this.emit("local-stream", this.localStream);
      return this.localStream;
    }
    this.localStream = await this.mediaDevices.getUserMedia(normalized);
    this.emit("local-stream", this.localStream);
    return this.localStream;
  }
  async listDevices() {
    if (!this.mediaDevices || typeof this.mediaDevices.enumerateDevices !== "function") {
      return [];
    }
    return this.mediaDevices.enumerateDevices();
  }
  stopLocalStream() {
    if (!this.localStream) return;
    for (const track of this.localStream.getTracks()) track.stop();
    this.emit("local-stream-stopped", this.localStream);
    this.localStream = null;
  }
  async switchDevice(kind, deviceId) {
    if (!kind || !deviceId) throw new Error("kind and deviceId are required");
    const normalizedKind = String(kind).toLowerCase();
    const mediaKind = normalizedKind === "audio" ? "audioinput" : normalizedKind === "video" ? "videoinput" : normalizedKind;
    if (mediaKind !== "audioinput" && mediaKind !== "videoinput" && mediaKind !== "audiooutput") {
      throw new Error(`Unsupported device kind: ${kind}`);
    }
    this.preferredDeviceIds[mediaKind] = deviceId;
    if (!this.localStream || mediaKind === "audiooutput") {
      this.emit("device-switch-requested", { kind: mediaKind, deviceId });
      return { kind: mediaKind, deviceId, stream: this.localStream };
    }
    const existingAudio = this.localStream.getAudioTracks();
    const existingVideo = this.localStream.getVideoTracks();
    const constraints = {
      audio: mediaKind === "audioinput" ? { deviceId: { exact: deviceId } } : existingAudio.length > 0,
      video: mediaKind === "videoinput" ? { deviceId: { exact: deviceId } } : existingVideo.length > 0
    };
    const nextStream = await this.mediaDevices.getUserMedia(constraints);
    if (mediaKind === "audioinput") {
      const [nextAudio] = nextStream.getAudioTracks();
      if (nextAudio) __privateMethod(this, _MediaManager_instances, replaceTrack_fn).call(this, existingAudio, nextAudio);
      for (const track of nextStream.getVideoTracks()) track.stop();
    }
    if (mediaKind === "videoinput") {
      const [nextVideo] = nextStream.getVideoTracks();
      if (nextVideo) __privateMethod(this, _MediaManager_instances, replaceTrack_fn).call(this, existingVideo, nextVideo);
      for (const track of nextStream.getAudioTracks()) track.stop();
    }
    this.emit("device-switch-requested", { kind, deviceId });
    this.emit("local-stream", this.localStream);
    return { kind: mediaKind, deviceId, stream: this.localStream };
  }
};
_MediaManager_instances = new WeakSet();
replaceTrack_fn = function(existingTracks, nextTrack) {
  for (const track of existingTracks) {
    this.localStream.removeTrack(track);
    track.stop();
  }
  this.localStream.addTrack(nextTrack);
};
var PhoneCore = class extends EventEmitter {
  constructor(config = {}, deps = {}) {
    super();
    this.config = config;
    this.media = deps.mediaManager || new MediaManager(deps);
    this.SIP = deps.SIP || globalThis.SIP;
    this.userAgent = null;
    this.registerer = null;
    this.session = null;
    this.lastOutgoingTarget = null;
    this.isMuted = false;
    this.isOnHold = false;
    this.isRegistered = false;
    this._holdInProgress = false;
    this._lastRegisterError = "";
    this._registererWired = false;
    this._boundRemoteEl = null;
    this._boundLocalEl = null;
    this._bindMedia();
  }
  configure(config = {}) {
    const before = this.config || {};
    const sipKeys = [
      "Server",
      "Port",
      "ServerPath",
      "Username",
      "Password",
      "Domain",
      "PasswordType"
    ];
    const changedSipConfig = sipKeys.some((key) => config[key] !== void 0 && config[key] !== before[key]);
    this.config = { ...before, ...config || {} };
    this.config.EnableRingtone = true;
    if (changedSipConfig && this.userAgent && !this.isRegistered) {
      try {
        this.userAgent.stop?.();
      } catch {
      }
      this.userAgent = null;
      this.registerer = null;
    }
    return this.config;
  }
  /**
   * Match legacy Phone/phone.js: only set iceServers when IceStunServerJson is
   * non-empty. Blank/missing omits iceServers (browser defaults). "[]" disables.
   */
  _parseIceServers() {
    const raw = String(this.config.IceStunServerJson || "").trim();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  }
  _iceGatheringTimeoutMs() {
    const raw = Number(this.config.IceStunCheckTimeout);
    if (Number.isFinite(raw) && raw > 0) return raw;
    return 500;
  }
  _buildPeerConnectionConfiguration() {
    const config = {
      bundlePolicy: this.config.BundlePolicy || "balanced"
    };
    const iceServers = this._parseIceServers();
    if (iceServers) config.iceServers = iceServers;
    return config;
  }
  _buildSessionDescriptionHandlerFactoryOptions() {
    return {
      peerConnectionConfiguration: this._buildPeerConnectionConfiguration(),
      iceGatheringTimeout: this._iceGatheringTimeoutMs()
    };
  }
  /** Drop link-local / APIPA ICE candidates that commonly spam STUN timeouts on Windows. */
  _filterNoisyIceCandidates(description) {
    if (!description || typeof description.sdp !== "string") {
      return Promise.resolve(description);
    }
    const lines = description.sdp.split(/\r?\n/);
    const next = lines.filter((line) => {
      if (!line.startsWith("a=candidate:")) return true;
      const parts = line.split(/\s+/);
      const ip = parts[4] || "";
      if (/^169\.254\./.test(ip)) return false;
      if (/^fe80:/i.test(ip)) return false;
      return true;
    });
    return Promise.resolve({
      type: description.type,
      sdp: next.join("\r\n")
    });
  }
  _bindMedia() {
    this.media.on("local-stream", (stream) => this.emit("local-stream", stream));
  }
  bindAudioElements({ remoteEl, localEl } = {}) {
    this._boundRemoteEl = remoteEl || null;
    this._boundLocalEl = localEl || null;
  }
  async register() {
    await this._ensureSip();
    if (this.userAgent && this.isRegistered) {
      return { online: true, user: this.config.Username };
    }
    const wsUrl = buildWsUrl(this.config);
    const username = this.config.Username;
    const password = this.config.Password;
    const domain = resolveSipDomain(this.config);
    if (domain && !String(this.config.Domain || "").trim()) {
      this.config.Domain = domain;
    }
    if (!wsUrl || !username || !password || !domain) {
      const error = "Missing SIP configuration";
      this.isRegistered = false;
      this._lastRegisterError = error;
      this.emit("registration-changed", { online: false, user: username || "", error });
      throw new Error(error);
    }
    const uri = this.SIP.UserAgent.makeURI(`sip:${username}@${domain}`);
    const traceSip = this.config.TraceSip === true || this.config.TraceSip === "1" || this.config.TraceSip === 1;
    const transportOptions = {
      server: wsUrl,
      traceSip: !!traceSip
    };
    if (!this.userAgent) {
      const auth = sipAuthorizationOptions(
        password,
        this.config.PasswordType || "plain"
      );
      const displayName = String(this.config.profileName || "").trim();
      const uaOptions = {
        uri,
        authorizationUsername: username,
        ...auth,
        transportOptions,
        // Keep console quiet unless TraceSip is explicitly enabled (dev).
        logLevel: traceSip ? "debug" : "error",
        logBuiltinEnabled: !!traceSip,
        logConfiguration: false
      };
      if (displayName) uaOptions.displayName = displayName;
      if (auth.authorizationPassword === void 0) delete uaOptions.authorizationPassword;
      if (auth.authorizationHa1 === void 0) delete uaOptions.authorizationHa1;
      uaOptions.sessionDescriptionHandlerFactoryOptions = this._buildSessionDescriptionHandlerFactoryOptions();
      this.userAgent = new this.SIP.UserAgent(uaOptions);
      this.registerer = new this.SIP.Registerer(this.userAgent);
      this._wireRegisterer(username);
      this.userAgent.delegate = {
        onInvite: (invitation) => {
          this.session = invitation;
          this._wireSession(invitation, "incoming");
          this.emit("incoming-call", {
            from: String(invitation.remoteIdentity?.uri || ""),
            displayName: String(invitation.remoteIdentity?.displayName || "")
          });
        }
      };
      await this.userAgent.start();
    } else if (this.registerer && !this._registererWired) {
      this._wireRegisterer(username);
    }
    try {
      await this._registerWithRetry();
      const registered = this.registerer?.state === this.SIP.RegistererState.Registered;
      this.isRegistered = !!registered;
      this._lastRegisterError = registered ? "" : this._lastRegisterError;
      const state = registered ? { online: true, user: username } : { online: false, user: username, error: this._lastRegisterError || "Register failed" };
      this.emit("registration-changed", state);
      if (!registered) throw new Error(state.error);
      return state;
    } catch (err) {
      this.isRegistered = false;
      const error = this._formatRegisterError(err);
      this._lastRegisterError = error;
      this.emit("registration-changed", { online: false, user: username, error });
      throw err instanceof Error ? err : new Error(error);
    }
  }
  _wireRegisterer(username) {
    if (!this.registerer || this._registererWired) return;
    this._registererWired = true;
    const emitFromState = (state) => {
      const Registered = this.SIP.RegistererState.Registered;
      const online = state === Registered;
      this.isRegistered = online;
      if (online) this._lastRegisterError = "";
      this.emit("registration-changed", {
        online,
        user: username || this.config.Username || "",
        error: online ? void 0 : this._lastRegisterError || void 0
      });
    };
    if (this.registerer.stateChange?.addListener) {
      this.registerer.stateChange.addListener(emitFromState);
    }
  }
  _formatRegisterError(err) {
    const response = err?.response || err?.incomingResponse || err?.cause?.response;
    const statusCode = response?.statusCode || response?.status_code || err?.statusCode;
    const reason = response?.reasonPhrase || response?.reason_phrase || "";
    if (statusCode) {
      return reason ? `${statusCode} ${reason}` : String(statusCode);
    }
    const message = String(err?.message || err || "").trim();
    const matched = message.match(/\b([4-5]\d{2})\b(?:\s+[-=]?>?\s*|\s+)?([A-Za-z][A-Za-z0-9 ._-]*)?/);
    if (matched) {
      const code = matched[1];
      const text = String(matched[2] || "").replace(/[.\s]+$/g, "").trim();
      return text ? `${code} ${text}` : code;
    }
    return message || "Register failed";
  }
  async _registerWithRetry() {
    try {
      await this.registerer.register();
    } catch (err) {
      const message = String(err?.message || err);
      if (!/REGISTER request already in progress/i.test(message)) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      await this.registerer.register();
    }
  }
  async _ensureSip() {
    if (this.SIP) return this.SIP;
    if (globalThis.SIP) {
      this.SIP = globalThis.SIP;
      return this.SIP;
    }
    const urls = [
      this.config.SipJsUrl || this.config.SIPJS_URL,
      resolveBundledSipJsUrl()
    ].filter((url, index, list) => url && list.indexOf(url) === index);
    let lastError = null;
    for (const url of urls) {
      try {
        sipJsLoadPromise = loadScript(url);
        await sipJsLoadPromise;
        this.SIP = globalThis.SIP;
        if (this.SIP) return this.SIP;
      } catch (err) {
        sipJsLoadPromise = null;
        lastError = err;
      }
    }
    if (!this.SIP) {
      throw lastError || new Error("SIP.js not loaded (bundle missing under vendor/sip-0.21.2.min.js)");
    }
    return this.SIP;
  }
  async unregister() {
    if (!this.userAgent || !this.registerer) return;
    try {
      await this.registerer.unregister();
    } finally {
      this.isRegistered = false;
      this.media.stopLocalStream();
      const state = { online: false };
      this.emit("registration-changed", state);
      return state;
    }
  }
  async warmMedia(constraints = { audio: true, video: false }) {
    try {
      await this.media.getLocalStream(constraints);
    } catch {
    }
  }
  async toggleRegistration() {
    if (this.isRegistered) {
      await this.unregister();
      return { online: false };
    }
    await this.register();
    return { online: true };
  }
  getRegistrationState() {
    return {
      online: !!this.isRegistered,
      user: this.config.Username || "",
      error: this.isRegistered ? void 0 : this._lastRegisterError || void 0
    };
  }
  async call(target, options = {}) {
    await this.register();
    this.lastOutgoingTarget = target;
    const domain = resolveSipDomain(this.config);
    const targetUri = this.SIP.UserAgent.makeURI(`sip:${target}@${domain}`);
    const constraints = options.constraints || { audio: this.media.getAudioConstraints(), video: !!options.video };
    const extraHeaders = Array.isArray(options.extraHeaders) ? options.extraHeaders.map((h) => String(h || "").trim()).filter(Boolean) : [];
    const mediaPromise = this.media.getLocalStream(constraints);
    const inviterOptions = extraHeaders.length ? { extraHeaders } : void 0;
    const inviter = new this.SIP.Inviter(this.userAgent, targetUri, inviterOptions);
    this.session = inviter;
    this._wireSession(inviter, "outgoing");
    this.emit("outgoing-call", { target, extraHeaders });
    const localStream = await mediaPromise;
    this._attachLocal(localStream);
    const iceFilter = (description) => this._filterNoisyIceCandidates(description);
    const pcOpts = {
      sessionDescriptionHandlerOptions: {
        constraints,
        localMediaStream: localStream,
        offerOptions: { iceRestart: false },
        iceGatheringTimeout: this._iceGatheringTimeoutMs()
      },
      sessionDescriptionHandlerModifiers: [iceFilter]
    };
    if (extraHeaders.length) {
      pcOpts.requestOptions = { extraHeaders };
    }
    await inviter.invite(pcOpts);
  }
  async reconnect(options = {}) {
    if (!this.lastOutgoingTarget) throw new Error("No previous outgoing call to reconnect");
    const target = this.lastOutgoingTarget;
    this.hangup();
    await this.call(target, options);
    return { target };
  }
  async answer(options = {}) {
    if (!this.session || typeof this.session.accept !== "function") throw new Error("No incoming call");
    const constraints = options.constraints || { audio: this.media.getAudioConstraints(), video: !!options.video };
    const localStream = await this.media.getLocalStream(constraints);
    this._attachLocal(localStream);
    const iceFilter = (description) => this._filterNoisyIceCandidates(description);
    await this.session.accept({
      sessionDescriptionHandlerOptions: {
        constraints,
        localMediaStream: localStream,
        offerOptions: { iceRestart: false },
        iceGatheringTimeout: this._iceGatheringTimeoutMs()
      },
      sessionDescriptionHandlerModifiers: [iceFilter]
    });
  }
  async reject(options = {}) {
    if (!this.session) return;
    const session = this.session;
    if (typeof session.reject === "function") {
      await session.reject(options);
    } else if (typeof session.cancel === "function") {
      await session.cancel();
    } else if (typeof session.bye === "function") {
      await session.bye();
    }
    this.session = null;
    this.isMuted = false;
    this.isOnHold = false;
    this._holdInProgress = false;
    this._resetLocalAudioEnabled(true);
    this.emit("call-ended");
  }
  hangup() {
    if (this.session) {
      if (typeof this.session.bye === "function") this.session.bye();
      else if (typeof this.session.cancel === "function") this.session.cancel();
      else if (typeof this.session.reject === "function") this.session.reject();
    }
    this.session = null;
    this.isMuted = false;
    this.isOnHold = false;
    this._holdInProgress = false;
    this._resetLocalAudioEnabled(true);
    this.emit("call-ended");
  }
  _resetLocalAudioEnabled(enabled) {
    if (!this.media.localStream) return;
    for (const track of this.media.localStream.getAudioTracks()) track.enabled = !!enabled;
  }
  mute(forceMuted) {
    if (!this.media.localStream) return false;
    this.isMuted = typeof forceMuted === "boolean" ? forceMuted : !this.isMuted;
    this._applyLocalHoldState(this.isOnHold);
    this.emit("mute-changed", { muted: this.isMuted });
    return this.isMuted;
  }
  unmute() {
    if (!this.media.localStream) return false;
    this.isMuted = false;
    this._applyLocalHoldState(this.isOnHold);
    this.emit("mute-changed", { muted: false });
    return false;
  }
  toggleMute() {
    return this.isMuted ? this.unmute() : this.mute();
  }
  async hold() {
    return this._setHold(true);
  }
  async resume() {
    return this._setHold(false);
  }
  _applyLocalHoldState(onHold) {
    const pc = this.session?.sessionDescriptionHandler?.peerConnection;
    if (pc) {
      for (const receiver of pc.getReceivers()) {
        if (receiver.track) receiver.track.enabled = !onHold;
      }
      for (const sender of pc.getSenders()) {
        if (!sender.track) continue;
        if (sender.track.kind === "audio") {
          sender.track.enabled = !onHold && !this.isMuted;
        } else {
          sender.track.enabled = !onHold;
        }
      }
    }
    if (this.media.localStream) {
      for (const track of this.media.localStream.getAudioTracks()) {
        track.enabled = !onHold && !this.isMuted;
      }
    }
  }
  _holdMode() {
    const mode = String(this.config.HoldMode || "sip").toLowerCase();
    return mode === "local" || mode === "media" ? "local" : "sip";
  }
  _holdIceRestartEnabled() {
    const raw = this.config.HoldIceRestart;
    return raw === true || raw === "1" || raw === 1 || raw === "true";
  }
  async _setHold(onHold) {
    if (!this.session) {
      throw new Error("No active session to hold");
    }
    const Established = this.SIP?.SessionState?.Established;
    if (Established && this.session.state !== Established) {
      throw new Error("Call is not established");
    }
    if (this._holdInProgress) {
      throw new Error("Hold request already in progress");
    }
    if (this.isOnHold === !!onHold) {
      this.emit("hold-changed", { onHold: !!onHold });
      return this.isOnHold;
    }
    if (this._holdMode() === "local") {
      this.isOnHold = !!onHold;
      this._applyLocalHoldState(!!onHold);
      this.emit("hold-changed", { onHold: this.isOnHold });
      return this.isOnHold;
    }
    if (typeof this.session.invite !== "function") {
      throw new Error("No active session to hold");
    }
    const previous = this.isOnHold;
    this._holdInProgress = true;
    const reInviteOptions = this.session.sessionDescriptionHandlerOptionsReInvite || {};
    reInviteOptions.hold = !!onHold;
    delete reInviteOptions.constraints;
    delete reInviteOptions.iceGatheringTimeout;
    if (this._holdIceRestartEnabled()) {
      reInviteOptions.offerOptions = { iceRestart: true };
    } else {
      delete reInviteOptions.offerOptions;
    }
    this.session.sessionDescriptionHandlerOptionsReInvite = reInviteOptions;
    try {
      await new Promise((resolve, reject) => {
        this.session.invite({
          requestDelegate: {
            onAccept: () => {
              this.isOnHold = !!onHold;
              this._applyLocalHoldState(!!onHold);
              try {
                this._attachRemoteFromSession(this.session);
              } catch {
              }
              this.emit("hold-changed", { onHold: this.isOnHold });
              resolve(this.isOnHold);
            },
            onReject: (response) => {
              this.isOnHold = previous;
              this._applyLocalHoldState(previous);
              this.emit("hold-changed", { onHold: this.isOnHold });
              const code = response?.message?.statusCode || response?.statusCode;
              reject(new Error(code ? `Hold request rejected: ${code}` : "Hold request rejected"));
            }
          }
        }).catch(reject);
      });
    } catch (err) {
      this.isOnHold = previous;
      this._applyLocalHoldState(previous);
      this.emit("hold-changed", { onHold: this.isOnHold });
      const message = String(err?.message || err || "");
      if (/already in progress|RequestPending/i.test(message)) {
        throw new Error("Hold request already in progress");
      }
      throw err instanceof Error ? err : new Error(message || "Hold failed");
    } finally {
      this._holdInProgress = false;
    }
    return this.isOnHold;
  }
  switchDevice(kind, deviceId) {
    return this.media.switchDevice(kind, deviceId);
  }
  listDevices() {
    return this.media.listDevices();
  }
  async sendDTMF(digits, options = {}) {
    if (!this.session) throw new Error("No active session");
    const payload = String(digits || "").trim();
    if (!payload) return;
    const duration = Number(options.duration || 160);
    if (typeof this.session.info === "function") {
      await this.session.info({
        contentType: "application/dtmf-relay",
        body: `Signal=${payload}\r
Duration=${duration}`
      });
      this.emit("dtmf-sent", { digits: payload, duration });
      return;
    }
    throw new Error("DTMF is not supported by current SIP session");
  }
  async transfer(target) {
    if (!this.session || typeof this.session.refer !== "function") throw new Error("Transfer is not supported for this call");
    const domain = resolveSipDomain(this.config);
    const transferTarget = String(target || "").trim();
    if (!transferTarget) throw new Error("Transfer target is required");
    const targetUri = this.SIP.UserAgent.makeURI(`sip:${transferTarget}@${domain}`);
    await this.session.refer(targetUri);
    this.emit("transfer-requested", { target: transferTarget });
  }
  async conference(target) {
    await this.transfer(target);
    this.emit("conference-requested", { target });
  }
  _wireSession(session, direction) {
    const stateChanged = () => {
      const st = session.state;
      if (st === this.SIP.SessionState.Established) {
        this._attachRemoteFromSession(session);
        this.emit("call-connected", { direction });
      }
      if (st === this.SIP.SessionState.Terminated) {
        this.isOnHold = false;
        this._holdInProgress = false;
        this.emit("call-ended");
      }
    };
    if (session.stateChange && typeof session.stateChange.addListener === "function") {
      session.stateChange.addListener(stateChanged);
    }
  }
  _attachLocal(stream) {
    if (this._boundLocalEl) {
      this._boundLocalEl.srcObject = stream;
    }
  }
  _attachRemoteFromSession(session) {
    const pc = session.sessionDescriptionHandler?.peerConnection;
    if (!pc) return;
    const remote = new MediaStream();
    for (const receiver of pc.getReceivers()) {
      if (receiver.track) remote.addTrack(receiver.track);
    }
    this.emit("remote-stream", remote);
    if (this._boundRemoteEl) this._boundRemoteEl.srcObject = remote;
  }
};

// ../../src/sdk/tab-leader.js
var DEFAULT_CHANNEL_PREFIX = "vphone-tab";
var LOCK_PREFIX = "vphone-sip-leader";
var PROTOCOL = 1;
var PROXY_METHODS = [
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
var MIRROR_EVENTS = [
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
function shouldEnableTabLeader(config = {}) {
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
function installTabLeader(sdk, options = {}) {
  if (!sdk || sdk._tabLeaderInstalled) return sdk._tabLeaderController || null;
  if (typeof BroadcastChannel === "undefined") return null;
  const config = options.config || sdk.core?.config || {};
  const key = accountKey(config);
  const channelName = options.channelName || `${DEFAULT_CHANNEL_PREFIX}:${key}`;
  const lockName = options.lockName || `${LOCK_PREFIX}:${key}`;
  const followerWaitMs = Number(options.followerWaitMs) > 0 ? Number(options.followerWaitMs) : 2500;
  const tabId = makeTabId();
  const originals = {};
  const pending = /* @__PURE__ */ new Map();
  const eventUnsubs = [];
  let role = "follower";
  let stopped = false;
  let wantRegistered = false;
  let mirroredReg = { online: false, user: "", error: void 0 };
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
    }
  }
  function setRole(next) {
    if (role === next) return;
    role = next;
    try {
      sdk.core?.emit?.("tab-role-changed", { role, tabId, channelName });
    } catch {
    }
  }
  function applyMirroredRegistration(state = {}) {
    mirroredReg = {
      online: !!state.online,
      user: state.user || mirroredReg.user || "",
      error: state.error
    };
    if (role === "leader" && sdk.core?.userAgent) {
      sdk.core.isRegistered = !!mirroredReg.online;
      sdk.core._lastRegisterError = mirroredReg.online ? "" : String(mirroredReg.error || sdk.core._lastRegisterError || "");
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
        try {
          ctx.close();
        } catch {
        }
      }, 100);
    } catch {
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
    Promise.resolve().then(async () => {
      if (name !== "register" && name !== "unregister" && wantRegistered) {
        const reg = readLocalRegistration();
        if (!reg?.online && name !== "toggleRegistration") {
          await ensureLeaderRegistered();
        }
      }
      return originals[name].apply(sdk, Array.isArray(args) ? args : []);
    }).then((result) => {
      post({ type: "cmd-result", requestId, to: from, ok: true, result: clonePayload(result) });
      broadcastState();
    }).catch((err) => {
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
    if (wantRegistered) {
      try {
        await ensureLeaderRegistered();
      } catch {
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
    }
    for (const unsub of eventUnsubs) {
      try {
        unsub();
      } catch {
      }
    }
    eventUnsubs.length = 0;
    for (const [, entry] of pending) {
      clearTimeout(entry.timer);
      entry.reject(new Error("Tab leader destroyed"));
    }
    pending.clear();
    if (typeof releaseLeadership === "function") {
      try {
        releaseLeadership();
      } catch {
      }
    }
    if (role === "leader") {
      try {
        originals.unregister?.call(sdk);
      } catch {
      }
      try {
        post({ type: "leader-left" });
      } catch {
      }
    }
    try {
      channel?.close();
    } catch {
    }
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
  }
  runLeadershipLoop();
  post({ type: "hello" });
  sdk._tabLeaderInstalled = true;
  sdk._tabLeaderController = controller;
  return controller;
}

// ../../src/sdk/phone-config.js
var PHONE_CONFIG_DEFAULTS = Object.freeze({
  Language: "vi",
  EnableSettings: false,
  EnableNotifications: false,
  EnableRingtone: true,
  EnableVideoCalling: false,
  EnableTransfer: true,
  EnableConference: false,
  EnableRecordAllCalls: false,
  EnableFreeDial: true,
  EnableBuddies: true,
  EnableMultiTabLeader: true,
  ServerPath: "/ws",
  MaxDidLength: 24,
  HoldMode: "sip"
});
var PHONE_UI_FRAME_SIZE = Object.freeze({
  width: "250px",
  height: "457px"
});
var STORAGE_KEYS = Object.freeze([
  "Server",
  "Port",
  "Domain",
  "Username",
  "Password",
  "PasswordType",
  "ServerPath",
  "profileName"
]);
var REMOVED_KEYS = Object.freeze([
  "wssServer",
  "WSSSERVER",
  "WebSocketPort",
  "webSocketPort",
  "WSSPORT",
  "SipDomain",
  "sipDomain",
  "DOMAIN",
  "SipUsername",
  "username",
  "SIPUSER",
  "SipPassword",
  "password",
  "sipPassword",
  "SIPPASSWORD",
  "SipPasswordType",
  "SIPPASSWORDTYPE",
  "NotificationsActive",
  "SettingsButton",
  "HideRecordAllCallsButton",
  "DisableFreeDial",
  "DisableBuddies",
  "multiTabLeader",
  "serverPath",
  "WSSPATH"
]);
function normalizePhoneConfig(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  let out = { ...source };
  if (source.phone && typeof source.phone === "object") {
    out = { ...out, ...source.phone };
  }
  if (source.sip && typeof source.sip === "object") {
    out = { ...out, ...source.sip };
  }
  delete out.phone;
  delete out.sip;
  for (const key of REMOVED_KEYS) {
    delete out[key];
  }
  out.EnableRingtone = true;
  return out;
}
function readStorageValue(key) {
  if (typeof window === "undefined" || !window.localStorage) return "";
  const value = window.localStorage.getItem(key);
  return value !== null && value !== "" ? value : "";
}
function writeStorageValue(key, value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (value === void 0 || value === null || value === "") {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, String(value));
}

// ../../src/sdk/phone-sdk.js
var SECRET_STORAGE_PREFIX = "vphone:safe:";
function desktopSecretApi() {
  if (typeof window === "undefined") return null;
  const api = window.VPhoneDesktop;
  if (!api || typeof api.encryptSecret !== "function" || typeof api.decryptSecret !== "function") {
    return null;
  }
  return api;
}
function isEncryptedSecret(value) {
  return typeof value === "string" && value.startsWith(SECRET_STORAGE_PREFIX);
}
async function isSecretStorageAvailable() {
  const api = desktopSecretApi();
  if (!api) return false;
  try {
    if (typeof api.isSecretStorageAvailable === "function") {
      return !!await api.isSecretStorageAvailable();
    }
    return true;
  } catch {
    return false;
  }
}
async function resolveStoredSipPassword(raw) {
  if (raw == null) return "";
  const value = String(raw);
  if (!value) return "";
  if (!isEncryptedSecret(value)) {
    if (await isSecretStorageAvailable()) {
      try {
        await persistSipPassword(value);
      } catch {
      }
    }
    return value;
  }
  const api = desktopSecretApi();
  if (!api) return "";
  try {
    return String(await api.decryptSecret(value.slice(SECRET_STORAGE_PREFIX.length)) ?? "");
  } catch {
    return "";
  }
}
async function persistSipPassword(plain) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const value = String(plain ?? "");
  if (!value) {
    writeStorageValue("Password", "");
    return true;
  }
  if (!await isSecretStorageAvailable()) {
    writeStorageValue("Password", value);
    return false;
  }
  const api = desktopSecretApi();
  const cipher = await api.encryptSecret(value);
  writeStorageValue("Password", `${SECRET_STORAGE_PREFIX}${cipher}`);
  return true;
}
function configFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  const config = {};
  for (const key of STORAGE_KEYS) {
    const value = readStorageValue(key);
    if (!value) continue;
    if (key === "Password" && isEncryptedSecret(value)) continue;
    config[key] = value;
  }
  return config;
}
var PhoneSDK = class {
  constructor(config = {}, deps = {}) {
    const mergedConfig = normalizePhoneConfig({ ...configFromStorage(), ...config || {} });
    if (isEncryptedSecret(mergedConfig.Password)) delete mergedConfig.Password;
    this.core = deps.core || new PhoneCore(mergedConfig, deps);
    this._tabLeaderController = null;
    if (deps.tabLeader !== false && shouldEnableTabLeader(mergedConfig)) {
      this._tabLeaderController = installTabLeader(this, {
        config: mergedConfig,
        ...deps.tabLeaderOptions || {}
      });
    }
  }
  /** @returns {{ tabId: string, getRole: Function, isLeader: Function, destroy: Function } | null} */
  getTabLeader() {
    return this._tabLeaderController || null;
  }
  /**
   * Load Password from encrypted localStorage (or migrate plaintext),
   * then apply it to the live SIP config before register().
   */
  async hydrateSecrets() {
    const raw = readStorageValue("Password") || null;
    const storageValue = raw ? await resolveStoredSipPassword(raw) : "";
    const configValue = this.core?.config?.Password;
    const configPassword = configValue && !isEncryptedSecret(configValue) ? String(configValue) : "";
    const storedType = readStorageValue("PasswordType") || null;
    const fromConfig = !!configPassword;
    const password = configPassword || storageValue || "";
    const type = fromConfig ? this.core?.config?.PasswordType || "" : storedType || this.core?.config?.PasswordType || "";
    const auth = normalizeSipPasswordAndType(password, type);
    if (auth.password) {
      this.configure({ Password: auth.password, PasswordType: auth.type });
      const needsPersist = !raw || !isEncryptedSecret(raw) || !!configPassword && configPassword !== storageValue;
      if (needsPersist && await isSecretStorageAvailable()) {
        try {
          await persistSipPassword(auth.password);
        } catch {
        }
      }
    }
    return auth.password;
  }
  on(eventName, handler) {
    return this.core.on(eventName, handler);
  }
  off(eventName, handler) {
    return this.core.off(eventName, handler);
  }
  configure(config = {}) {
    return this.core.configure?.(config);
  }
  bindAudioElements(elements) {
    return this.core.bindAudioElements?.(elements);
  }
  emitRegistrationChanged(state) {
    return this.core.emit?.("registration-changed", state);
  }
  register() {
    return this.core.register();
  }
  unregister() {
    return this.core.unregister();
  }
  call(number, options) {
    return this.core.call(number, options);
  }
  answer(options) {
    return this.core.answer(options);
  }
  reject(options) {
    return this.core.reject(options);
  }
  hangup() {
    return this.core.hangup();
  }
  mute() {
    return this.core.mute();
  }
  unmute() {
    return this.core.unmute();
  }
  toggleMute() {
    return this.core.toggleMute();
  }
  isOnHold() {
    return !!this.core.isOnHold;
  }
  hold() {
    return this.core.hold();
  }
  resume() {
    return this.core.resume();
  }
  warmMedia(constraints) {
    return this.core.warmMedia?.(constraints);
  }
  sendDTMF(digits, options) {
    return this.core.sendDTMF(digits, options);
  }
  switchDevice(kind, deviceId) {
    return this.core.switchDevice(kind, deviceId);
  }
  toggleRegistration() {
    return this.core.toggleRegistration();
  }
  getRegistrationState() {
    return this.core.getRegistrationState();
  }
  listDevices() {
    return this.core.listDevices();
  }
  reconnect(options) {
    return this.core.reconnect(options);
  }
  transfer(target) {
    return this.core.transfer(target);
  }
  conference(target) {
    return this.core.conference(target);
  }
};

// ../../src/ui/phone-widget.js
function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
function normalizeText(value) {
  if (value === null || value === void 0) return "";
  return String(value).trim();
}
function normalizeNumber(value) {
  return normalizeText(value).replace(/[^\d*#+]/g, "");
}
function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}
function recentDirectionSvg(statusClass) {
  const kind = statusClass === "callOut" ? "out" : statusClass === "callMissed" ? "missed" : "in";
  const paths = {
    out: "M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z",
    in: "M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z",
    missed: "M19.59 7L12 14.59 6.41 9H11V7H3v8h2v-4.59l7 7 9-9z"
  };
  return `<svg class="recentCallSvg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="${paths[kind]}"/></svg>`;
}
var FALLBACK_TEXT = {
  en: {
    refreshRegistration: "Refresh Registration",
    configureExtension: "Configure Extension",
    settings: "Settings",
    language: "Language",
    audioVideo: "Audio / Video",
    speaker: "Speaker:",
    ringDevice: "Ring Device:",
    microphone: "Microphone:",
    camera: "Camera:",
    save: "Save",
    cancel: "Cancel",
    clearExtensionConfig: "Reset",
    resetSettings: "Reset",
    confirm: "Confirm",
    delete: "Delete",
    audioCall: "Audio Call",
    videoCall: "Video Call",
    autoAnswer: "Auto Answer",
    doNotDisturb: "Do Not Disturb",
    callWaiting: "Call Waiting",
    recordAllCalls: "Record All Calls",
    extensionConfigSaved: "Extension config saved",
    settingsSaved: "Settings saved",
    extensionConfigCleared: "Extension config cleared",
    settingsReset: "Settings reset",
    confirmClearExtension: "Clear saved extension configuration?",
    confirmResetSettings: "Reset saved settings?",
    confirmDeleteRecent: "Delete this recent call?",
    confirmDeleteRecentGroup: "Delete these call logs?",
    confirmClearRecents: "Delete all recent call history?",
    confirmClearContacts: "Delete all contacts?",
    recentsCleared: "Recents cleared",
    contactsCleared: "Contacts cleared",
    recentDeleted: "Recent deleted",
    noContacts: "No contacts yet",
    noRecentCalls: "No call history yet",
    addContactCta: "Add new contact",
    addContactAction: "Add",
    deleteCallLog: "Delete this log",
    extensionShort: "Ext",
    copyNumber: "Copy",
    numberCopied: "Number copied",
    edit: "Edit",
    confirmDeleteContact: "Delete this contact?",
    contactMenu: "Contact menu",
    saveContact: "Save",
    searchPlaceholder: "Search",
    onlineShort: "Online",
    offlineShort: "Offline",
    answered: "Answered",
    missed: "Missed",
    outgoing: "Outgoing",
    incoming: "Incoming",
    call_busy: "Busy",
    call_cancelled: "Call Cancelled",
    call_rejected: "Call Rejected",
    call_noanswer: "No Answer",
    you_missed_a_call: "You missed a call",
    secondsShort: "s",
    registerFailed: "Register failed",
    registering: "Registering",
    online: "Online",
    offline: "Offline",
    connected: "Connected",
    ended: "Ended",
    muted: "Muted",
    unmuted: "Unmuted",
    onHold: "On hold",
    resumed: "Resumed",
    fullName: "Full name",
    contactNumber1: "Phone number",
    allowCallsOnDnd: "Allow calls when Do Not Disturb is on",
    asteriskServer: "Server",
    websocketPort: "Port",
    websocketPath: "Path",
    sipDomain: "Domain",
    sipUsername: "Username",
    sipPassword: "Password",
    autoGainControl: "Auto Gain Control",
    echoCancellation: "Echo Cancellation",
    noiseSuppression: "Noise Suppression",
    optional: "optional",
    add: "Add",
    dialpad: "Dialpad",
    recents: "Recents",
    contacts: "Contacts",
    more: "More",
    registration: "Registration",
    answerCall: "Answer",
    rejectCall: "Reject",
    mute: "Mute",
    unmute: "Unmute",
    transferCall: "Transfer Call",
    cancelTransfer: "Cancel Transfer",
    conferenceCall: "Conference Call",
    cancelConference: "Cancel Conference",
    holdCall: "Hold Call",
    resumeCall: "Resume Call",
    endCall: "End Call",
    connecting: "Connecting...",
    speakerphone: "Speaker",
    callAction: "Call",
    cancelAction: "Cancel",
    keypad: "Keypad",
    transferShort: "Transfer",
    holdShort: "Hold",
    conferenceShort: "Conference",
    today: "Today",
    yesterday: "Yesterday",
    addContactTitle: "Add contact",
    namePlaceholder: "e.g. John Smith",
    numberPlaceholder: "e.g. 0901234567",
    blindTransfer: "Direct transfer",
    attendedTransfer: "Ask first",
    completeTransfer: "Complete Transfer",
    call: "Call",
    cancelCall: "Cancel Call",
    joinConferenceCall: "Join Conference Call",
    deviceSettings: "Device Settings",
    sendDtmf: "Send DTMF",
    close: "Close",
    transferSearchPlaceholder: "Enter number or name...",
    dtmfPlaceholder: "Enter digits..."
  },
  vi: {
    refreshRegistration: "L\xE0m m\u1EDBi \u0111\u0103ng k\xFD",
    configureExtension: "C\u1EA5u h\xECnh m\xE1y nh\xE1nh",
    settings: "C\xE0i \u0111\u1EB7t",
    language: "Ng\xF4n ng\u1EEF",
    audioVideo: "\xC2m thanh / Video",
    speaker: "Loa:",
    ringDevice: "Thi\u1EBFt b\u1ECB chu\xF4ng:",
    microphone: "Micro:",
    camera: "Camera:",
    save: "L\u01B0u",
    cancel: "H\u1EE7y",
    clearExtensionConfig: "Reset",
    resetSettings: "Reset",
    confirm: "X\xE1c nh\u1EADn",
    delete: "X\xF3a",
    audioCall: "G\u1ECDi \xE2m thanh",
    videoCall: "G\u1ECDi video",
    autoAnswer: "T\u1EF1 \u0111\u1ED9ng tr\u1EA3 l\u1EDDi",
    doNotDisturb: "Kh\xF4ng l\xE0m phi\u1EC1n",
    callWaiting: "Cu\u1ED9c g\u1ECDi ch\u1EDD",
    recordAllCalls: "Ghi \xE2m t\u1EA5t c\u1EA3 cu\u1ED9c g\u1ECDi",
    extensionConfigSaved: "\u0110\xE3 l\u01B0u c\u1EA5u h\xECnh m\xE1y nh\xE1nh",
    settingsSaved: "\u0110\xE3 l\u01B0u c\xE0i \u0111\u1EB7t",
    extensionConfigCleared: "\u0110\xE3 x\xF3a c\u1EA5u h\xECnh m\xE1y nh\xE1nh",
    settingsReset: "\u0110\xE3 \u0111\u1EB7t l\u1EA1i c\xE0i \u0111\u1EB7t",
    confirmClearExtension: "X\xF3a c\u1EA5u h\xECnh m\xE1y nh\xE1nh \u0111\xE3 l\u01B0u?",
    confirmResetSettings: "\u0110\u1EB7t l\u1EA1i c\xE0i \u0111\u1EB7t \u0111\xE3 l\u01B0u?",
    confirmDeleteRecent: "X\xF3a cu\u1ED9c g\u1ECDi g\u1EA7n \u0111\xE2y n\xE0y?",
    confirmDeleteRecentGroup: "X\xF3a c\xE1c cu\u1ED9c g\u1ECDi n\xE0y?",
    confirmClearRecents: "X\xF3a to\xE0n b\u1ED9 l\u1ECBch s\u1EED cu\u1ED9c g\u1ECDi g\u1EA7n \u0111\xE2y?",
    confirmClearContacts: "X\xF3a to\xE0n b\u1ED9 danh b\u1EA1?",
    recentsCleared: "\u0110\xE3 x\xF3a cu\u1ED9c g\u1ECDi g\u1EA7n \u0111\xE2y",
    contactsCleared: "\u0110\xE3 x\xF3a danh b\u1EA1",
    recentDeleted: "\u0110\xE3 x\xF3a cu\u1ED9c g\u1ECDi g\u1EA7n \u0111\xE2y",
    noContacts: "Ch\u01B0a c\xF3 li\xEAn h\u1EC7",
    noRecentCalls: "Ch\u01B0a c\xF3 l\u1ECBch s\u1EED cu\u1ED9c g\u1ECDi",
    addContactCta: "Th\xEAm li\xEAn h\u1EC7 m\u1EDBi",
    addContactAction: "Th\xEAm",
    deleteCallLog: "X\xF3a log n\xE0y",
    extensionShort: "M\xE1y nh\xE1nh",
    copyNumber: "Sao ch\xE9p",
    numberCopied: "\u0110\xE3 sao ch\xE9p s\u1ED1",
    edit: "S\u1EEDa",
    confirmDeleteContact: "X\xF3a li\xEAn h\u1EC7 n\xE0y?",
    contactMenu: "Menu danh b\u1EA1",
    saveContact: "L\u01B0u",
    searchPlaceholder: "T\xECm ki\u1EBFm",
    onlineShort: "Tr\u1EF1c tuy\u1EBFn",
    offlineShort: "Ngo\u1EA1i tuy\u1EBFn",
    answered: "\u0110\xE3 tr\u1EA3 l\u1EDDi",
    missed: "Nh\u1EE1",
    outgoing: "G\u1ECDi \u0111i",
    incoming: "G\u1ECDi \u0111\u1EBFn",
    call_busy: "B\u1EADn",
    call_cancelled: "Cu\u1ED9c g\u1ECDi \u0111\xE3 h\u1EE7y",
    call_rejected: "Cu\u1ED9c g\u1ECDi b\u1ECB t\u1EEB ch\u1ED1i",
    call_noanswer: "Kh\xF4ng tr\u1EA3 l\u1EDDi",
    you_missed_a_call: "Cu\u1ED9c g\u1ECDi nh\u1EE1",
    secondsShort: "gi\xE2y",
    registerFailed: "\u0110\u0103ng k\xFD th\u1EA5t b\u1EA1i",
    registering: "\u0110ang \u0111\u0103ng k\xFD",
    online: "Tr\u1EF1c tuy\u1EBFn",
    offline: "Ngo\u1EA1i tuy\u1EBFn",
    connected: "\u0110\xE3 k\u1EBFt n\u1ED1i",
    ended: "\u0110\xE3 k\u1EBFt th\xFAc",
    muted: "\u0110\xE3 t\u1EAFt ti\u1EBFng",
    unmuted: "\u0110\xE3 b\u1EADt ti\u1EBFng",
    onHold: "\u0110ang gi\u1EEF",
    resumed: "\u0110\xE3 ti\u1EBFp t\u1EE5c",
    fullName: "H\u1ECD v\xE0 t\xEAn",
    contactNumber1: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i",
    allowCallsOnDnd: "Cho ph\xE9p g\u1ECDi khi b\u1EADt Kh\xF4ng l\xE0m phi\u1EC1n",
    asteriskServer: "M\xE1y ch\u1EE7",
    websocketPort: "C\u1ED5ng",
    websocketPath: "\u0110\u01B0\u1EDDng d\u1EABn",
    sipDomain: "T\xEAn mi\u1EC1n",
    sipUsername: "T\xEAn ng\u01B0\u1EDDi d\xF9ng",
    sipPassword: "M\u1EADt kh\u1EA9u",
    autoGainControl: "T\u1EF1 \u0111\u1ED9ng t\u0103ng \xE2m",
    echoCancellation: "Kh\u1EED ti\u1EBFng vang",
    noiseSuppression: "Gi\u1EA3m nhi\u1EC5u",
    optional: "kh\xF4ng b\u1EAFt bu\u1ED9c",
    add: "Th\xEAm",
    dialpad: "B\xE0n ph\xEDm",
    recents: "G\u1EA7n \u0111\xE2y",
    contacts: "Danh b\u1EA1",
    more: "Th\xEAm",
    registration: "\u0110\u0103ng k\xFD",
    answerCall: "Tr\u1EA3 l\u1EDDi",
    rejectCall: "T\u1EEB ch\u1ED1i",
    mute: "T\u1EAFt ti\u1EBFng",
    unmute: "B\u1EADt ti\u1EBFng",
    transferCall: "Chuy\u1EC3n cu\u1ED9c g\u1ECDi",
    cancelTransfer: "H\u1EE7y chuy\u1EC3n",
    conferenceCall: "H\u1ED9i ngh\u1ECB",
    cancelConference: "H\u1EE7y h\u1ED9i ngh\u1ECB",
    holdCall: "Gi\u1EEF cu\u1ED9c g\u1ECDi",
    resumeCall: "Ti\u1EBFp t\u1EE5c",
    endCall: "K\u1EBFt th\xFAc",
    connecting: "\u0110ang k\u1EBFt n\u1ED1i...",
    speakerphone: "Loa ngo\xE0i",
    callAction: "G\u1ECDi",
    cancelAction: "H\u1EE7y",
    keypad: "B\xE0n ph\xEDm",
    transferShort: "Chuy\u1EC3n ti\u1EBFp",
    holdShort: "Gi\u1EEF cu\u1ED9c g\u1ECDi",
    conferenceShort: "H\u1ED9i ngh\u1ECB",
    today: "H\xF4m nay",
    yesterday: "H\xF4m qua",
    addContactTitle: "Th\xEAm danh b\u1EA1",
    namePlaceholder: "vd: Nguy\u1EC5n V\u0103n A",
    numberPlaceholder: "vd: 0901234567",
    blindTransfer: "Chuy\u1EC3n tr\u1EF1c ti\u1EBFp",
    attendedTransfer: "Chuy\u1EC3n c\xF3 trao \u0111\u1ED5i",
    completeTransfer: "Ho\xE0n t\u1EA5t chuy\u1EC3n",
    transferSearchPlaceholder: "Nh\u1EADp s\u1ED1 ho\u1EB7c t\xEAn...",
    call: "G\u1ECDi",
    cancelCall: "H\u1EE7y g\u1ECDi",
    joinConferenceCall: "Tham gia h\u1ED9i ngh\u1ECB",
    deviceSettings: "C\xE0i \u0111\u1EB7t thi\u1EBFt b\u1ECB",
    sendDtmf: "G\u1EEDi DTMF",
    close: "\u0110\xF3ng",
    dtmfPlaceholder: "Nh\u1EADp ph\xEDm..."
  }
};
var LEGACY_LANG_KEYS = {
  refreshRegistration: "refresh_registration",
  configureExtension: "configure_extension",
  settings: "settings",
  language: "language",
  audioVideo: "audio_video",
  speaker: "speaker",
  ringDevice: "ring_device",
  microphone: "microphone",
  camera: "camera",
  save: "save",
  cancel: "cancel",
  audioCall: "audio_call",
  videoCall: "video_call",
  autoAnswer: "auto_answer",
  doNotDisturb: "do_no_disturb",
  callWaiting: "call_waiting",
  recordAllCalls: "record_all_calls",
  noContacts: "no_contacts",
  noRecentCalls: "mobile_no_recents",
  missed: "missed",
  outgoing: "outgoing",
  incoming: "incoming",
  addContactAction: "add_contact_action",
  deleteCallLog: "delete_call_log",
  extensionShort: "extension_short",
  confirmDeleteRecentGroup: "confirm_delete_recent_group",
  confirmDeleteRecent: "confirm_delete_recent",
  copyNumber: "copy_number",
  numberCopied: "number_copied",
  edit: "edit",
  confirmDeleteContact: "confirm_delete_contact",
  contactMenu: "contact_menu",
  saveContact: "save",
  fullName: "full_name",
  contactNumber1: "contact_number_1",
  allowCallsOnDnd: "allow_calls_on_dnd",
  asteriskServer: "asterisk_server_address",
  websocketPort: "websocket_port",
  websocketPath: "websocket_path",
  sipDomain: "sip_domain",
  sipUsername: "sip_username",
  sipPassword: "sip_password",
  autoGainControl: "auto_gain_control",
  echoCancellation: "echo_cancellation",
  noiseSuppression: "noise_suppression",
  optional: "optional",
  add: "add",
  dialpad: "mobile_tab_dialpad",
  recents: "mobile_tab_recents",
  contacts: "mobile_tab_contacts",
  mute: "mute",
  unmute: "unmute",
  transferCall: "transfer_call",
  cancelTransfer: "cancel_transfer",
  conferenceCall: "conference_call",
  cancelConference: "cancel_conference",
  holdCall: "hold_call",
  resumeCall: "resume_call",
  endCall: "end_call",
  completeTransfer: "complete_transfer",
  call: "call",
  cancelCall: "cancel_call",
  joinConferenceCall: "join_conference_call",
  deviceSettings: "device_settings",
  sendDtmf: "send_dtmf",
  close: "close"
};
var _UINotifications_instances, focusBrowserWindow_fn;
var UINotifications = class {
  constructor({ enabled = true, onClick = null } = {}) {
    __privateAdd(this, _UINotifications_instances);
    this.enabled = enabled;
    this.onClick = typeof onClick === "function" ? onClick : null;
    this.active = null;
  }
  async ensurePermission() {
    if (!this.enabled) return false;
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    try {
      const result = await Notification.requestPermission();
      return result === "granted";
    } catch {
      return false;
    }
  }
  notifyIncomingCall(from) {
    if (!this.enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      if (this.active) {
        try {
          this.active.close();
        } catch {
        }
      }
      const notification = new Notification("Incoming call", {
        body: from ? `From ${from}` : "Incoming call",
        tag: "vphone-incoming",
        renotify: true,
        requireInteraction: true
      });
      this.active = notification;
      notification.onclick = (event) => {
        try {
          event?.preventDefault?.();
        } catch {
        }
        __privateMethod(this, _UINotifications_instances, focusBrowserWindow_fn).call(this);
        if (this.onClick) {
          try {
            this.onClick({ from: from || "" });
          } catch {
          }
        }
        try {
          notification.close();
        } catch {
        }
      };
      notification.onclose = () => {
        if (this.active === notification) this.active = null;
      };
    } catch (err) {
      console.warn("VPhone notification failed", err);
    }
  }
  clear() {
    if (!this.active) return;
    try {
      this.active.close();
    } catch {
    }
    this.active = null;
  }
};
_UINotifications_instances = new WeakSet();
focusBrowserWindow_fn = function() {
  if (typeof window === "undefined") return;
  try {
    const topWin = window.top || window;
    topWin.focus();
  } catch {
    try {
      window.focus();
    } catch {
    }
  }
};
function bindControls(root, handlers) {
  const idMap = {
    BtnFilter: handlers.onFilter,
    SettingsMenu: handlers.onSettings,
    dialAudio: handlers.onCallAudio || handlers.onCall,
    dialVideo: handlers.onCallVideo || handlers.onCall,
    dialDeleteKey: handlers.onDialDelete,
    "dialpad-toggle-auto": () => handlers.onDialpadToggle?.({ key: "auto" }),
    "dialpad-toggle-cw": () => handlers.onDialpadToggle?.({ key: "cw" }),
    "dialpad-toggle-dnd": () => handlers.onDialpadToggle?.({ key: "dnd" }),
    "dialpad-toggle-rec": () => handlers.onDialpadToggle?.({ key: "rec" })
  };
  const map = {
    call: handlers.onCall,
    answer: handlers.onAnswer,
    hangup: handlers.onHangup,
    mute: handlers.onMute,
    hold: handlers.onHold,
    reconnect: handlers.onReconnect,
    transfer: handlers.onTransfer,
    conference: handlers.onConference,
    search: handlers.onSearch,
    filter: handlers.onFilter,
    settings: handlers.onSettings,
    "add-contact": handlers.onAddContact,
    "clear-tab": handlers.onClearTab,
    "focus-search": handlers.onFocusSearch,
    more: handlers.onMore,
    reg: handlers.onRegisterToggle
  };
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest("[data-action]");
    if (btn && root.contains(btn)) {
      const action = btn.getAttribute("data-action") || "";
      const fn = map[action];
      if (typeof fn === "function") {
        const tab = btn.getAttribute("data-tab") || "";
        fn({ tab, action, element: btn });
        return;
      }
    }
    const idBtn = target.closest("[id]");
    if (!idBtn || !root.contains(idBtn)) return;
    const id = idBtn.getAttribute("id") || "";
    const idHandler = idMap[id];
    if (typeof idHandler === "function") idHandler({ element: idBtn, id });
  });
}
var _DomRenderer_instances, ensureLegacyPhoneJsLayout_fn;
var DomRenderer = class {
  constructor(root) {
    __privateAdd(this, _DomRenderer_instances);
    if (!root) throw new Error("DomRenderer requires root");
    this.root = root;
    this.lastRegistrationError = "";
    __privateMethod(this, _DomRenderer_instances, ensureLegacyPhoneJsLayout_fn).call(this);
    this.refs = {
      status: root.querySelector("[data-role='status']"),
      numberInput: root.querySelector("#dialText") || root.querySelector("#txtFindBuddy"),
      remoteMedia: root.querySelector("[data-role='remote-media']"),
      localMedia: root.querySelector("[data-role='local-media']"),
      searchArea: root.querySelector("#searchArea"),
      mobileTopBar: root.querySelector("#mobileTopBar"),
      contactsTabHeader: root.querySelector("#contactsTabHeader"),
      myContacts: root.querySelector("#myContacts"),
      actionArea: root.querySelector("#actionArea"),
      rightContent: root.querySelector("#rightContent"),
      tabDialpad: root.querySelector("#tab-dialpad"),
      tabRecents: root.querySelector("#tab-recents"),
      tabContacts: root.querySelector("#tab-contacts")
    };
    this.showTab("dialpad");
  }
  getTargetNumber() {
    const dialText = this.root.querySelector("#dialText");
    const findBuddy = this.root.querySelector("#txtFindBuddy");
    return (dialText?.value || findBuddy?.value || "").trim();
  }
  setStatus(text) {
    if (this.refs.status) this.refs.status.textContent = text;
  }
  setRegistrationState({ online, user, error } = {}) {
    const regText = this.root.querySelector("#mobileRegText");
    const regDot = this.root.querySelector("#mobileRegDot");
    const regLink = this.root.querySelector("#reglink");
    const deregLink = this.root.querySelector("#dereglink");
    const userCallId = this.root.querySelector("#UserCallID");
    if (online) this.lastRegistrationError = "";
    else if (error !== void 0 && error !== null && String(error).trim()) {
      this.lastRegistrationError = String(error).trim();
    }
    const errorText = this.lastRegistrationError || "";
    const statusLabel = online ? this.dndActive ? this.statusDndLabel || this.statusOnlineLabel || "Do Not Disturb" : this.statusOnlineLabel || "Online" : errorText || this.statusOfflineLabel || "Offline";
    const identity = String(user || "").trim();
    if (regText) {
      regText.textContent = identity ? `${identity} \u2022 ${statusLabel}` : statusLabel;
      regText.title = regText.textContent;
    }
    if (regDot) {
      regDot.className = online ? this.dndActive ? "dotOnline dotDnd" : "dotOnline" : "dotOffline";
    }
    if (regLink) regLink.className = online ? "dotOnline" : "dotOffline";
    if (deregLink) deregLink.style.display = online ? "" : "none";
    if (userCallId && identity) userCallId.textContent = identity;
  }
  attachMedia(name, stream) {
    const el = name === "local" ? this.refs.localMedia : this.refs.remoteMedia;
    if (!el) return;
    try {
      el.srcObject = stream;
    } catch {
      el._vphoneDebugStream = stream;
    }
  }
  showTab(tabName) {
    const t = String(tabName || "dialpad");
    const isDialpad = t === "dialpad";
    const isContacts = t === "contacts";
    const isRecents = t === "recents";
    if (this.refs.contactsTabHeader) this.refs.contactsTabHeader.style.display = "none";
    if (this.refs.myContacts) this.refs.myContacts.style.display = isContacts ? "" : "none";
    if (this.refs.actionArea) this.refs.actionArea.style.display = isContacts ? "none" : "";
    if (this.refs.searchArea) {
      this.refs.searchArea.style.display = "none";
      this.refs.searchArea.classList.remove("phoneSearchVisible");
    }
    this.renderMobileTopBar(t);
    if (this.refs.tabDialpad) this.refs.tabDialpad.classList.toggle("activeTab", isDialpad);
    if (this.refs.tabRecents) this.refs.tabRecents.classList.toggle("activeTab", isRecents);
    if (this.refs.tabContacts) this.refs.tabContacts.classList.toggle("activeTab", isContacts);
    if (typeof this.onTabRendered === "function") this.onTabRendered(t);
  }
  showSearch(show) {
    if (!this.refs.searchArea) return;
    this.refs.searchArea.style.display = show ? "" : "none";
  }
  renderMobileTopBar(tabName) {
    if (!this.refs.mobileTopBar) return;
    const regLink = '<button type="button" class="mobileTopBtn mobileRegBtn" data-action="reg" title="Registration"><span class="mobileRegStatus"><span id="mobileRegDot" class="dotOffline"></span><span id="mobileRegText">Offline</span></span></button>';
    let actions = "";
    if (tabName === "recents") {
      actions += '<button type="button" class="mobileTopBtn" data-action="clear-tab" data-tab="recents" title="Delete"><i class="fa fa-trash-o"></i></button>';
    } else if (tabName === "contacts") {
      actions += '<button type="button" class="mobileTopBtn" data-action="add-contact" title="Add"><i class="fa fa-plus"></i></button>';
      actions += '<button type="button" class="mobileTopBtn" data-action="clear-tab" data-tab="contacts" title="Delete"><i class="fa fa-trash-o"></i></button>';
    }
    if (this.showSettingsButton !== false) {
      actions += '<button type="button" class="mobileTopBtn" data-action="more" title="More"><i class="fa fa-ellipsis-v"></i></button>';
    }
    this.refs.mobileTopBar.innerHTML = '<div class="mobileTopBarInner"><div class="mobileTopBarTitle">' + regLink + '</div><div class="mobileTopBarActions">' + actions + "</div></div>";
  }
};
_DomRenderer_instances = new WeakSet();
ensureLegacyPhoneJsLayout_fn = function() {
  if (this.root.querySelector("[data-role='number-input']")) return;
  const shellClass = this.root.getAttribute("data-phone-shell") === "embedded" ? "phoneEmbedded" : "phoneStandalone";
  this.root.innerHTML = `
      <div id="Phone" class="pageContainer ${shellClass} phoneFrame250 phoneApp">
        <header class="phoneHeaderBar">
          <div class="contact" id="UserProfile">
            <span id="TxtVoiceMessages" class="voiceMessageNotifyer">0</span>
            <div id="UserProfilePic" class="buddyIcon"></div>
            <span class="settingsMenu">
              <button class="roundButtons" id="BtnFreeDial" data-action="call" title="Call"><i class="fa fa-phone"></i></button>
              <button class="roundButtons" id="SettingsMenu" title="Settings" style="display:none"><i class="fa fa-cogs"></i></button>
            </span>
            <div class="contactNameText">
              <span id="dereglink" class="dotOnline" style="display:none"></span>
              <span id="reglink" class="dotOffline"></span>
              <span id="UserCallID"></span>
            </div>
            <div class="presenceText">
              <span id="regStatus" data-role="status">&nbsp;</span>
              <span id="dndStatus"></span>
            </div>
          </div>
        </header>
        <div id="searchArea" class="phoneSearch" style="display:none;">
          <span id="divFindBuddy" class="searchClean phoneSearchField">
            <i class="fa fa-search phoneSearchIcon" aria-hidden="true"></i>
            <input id="txtFindBuddy" type="text" autocomplete="off" placeholder="Search">
          </span>
        </div>
        <div id="mobileTopBar" class="mobileTopBar"></div>
        <div id="contactsTabHeader" class="contactsTabHeader" style="display:none;">
          <span style="flex:1;">Contacts</span>
          <button type="button" id="BtnCreateGroup" class="roundButtons" title="Create Group"><i class="fa fa-users"></i></button>
        </div>
        <div id="myContacts" class="contactArea cleanScroller phoneBodyList" style="display:none;"></div>
        <div id="actionArea" class="contactArea cleanScroller dialpadMode phoneBodyList"></div>
        <div id="bottomTabBar" class="mainTabBar">
          <button type="button" id="tab-dialpad" class="mainTab activeTab" data-label="Dialpad"><i class="fa fa-th mainTabIcon"></i></button>
          <button type="button" id="tab-recents" class="mainTab" data-label="Recents"><i class="fa fa-history mainTabIcon"></i></button>
          <button type="button" id="tab-contacts" class="mainTab" data-label="Contacts"><i class="fa fa-address-book mainTabIcon"></i></button>
        </div>
        <div id="rightContent" class="rightContent" style="display:none;"></div>
      </div>
    `;
};
function buildCallerDisplay(number, contactName, callerIdName) {
  const normalizedNumber = normalizeText(number);
  const normalizedContact = normalizeText(contactName);
  let normalizedCallerId = normalizeText(callerIdName);
  const invalidNames = ["anonymous", "unknown", "private", "restricted", "unavailable", "null", "none", "wireless caller"];
  if (invalidNames.includes(normalizedCallerId.toLowerCase())) normalizedCallerId = "";
  let primary = normalizedContact || normalizedCallerId || normalizedNumber || "Unknown";
  let secondary = "";
  if (normalizedNumber && primary !== normalizedNumber) secondary = normalizedNumber;
  return { primary, secondary, number: normalizedNumber, name: primary };
}
var _PhoneUI_instances, openProfileMenu_fn, profileMenuItem_fn, popupHost_fn, closeProfileMenu_fn, confirmInPanel_fn, closePanelConfirm_fn, handleProfileMenuAction_fn, getDevices_fn, openSettings_fn, renderConfigExtension_fn, bindConfigPanel_fn, saveConfigPanel_fn, switchSelectedDevice_fn, reconnectLastCall_fn, transferCall_fn, startConference_fn, setBottomTabsVisible_fn, showActionPanel_fn, callPeerHtml_fn, resolveCallPeer_fn, renderIncomingCall_fn, renderCallProgress_fn, renderActiveCall_fn, startCallTimer_fn, stopCallTimer_fn, tickCallTimer_fn, callLabel_fn, bindCallSurfaceControls_fn, isPanelVisible_fn, syncInCallOverlayState_fn, showTransferPanel_fn, hideTransferPanel_fn, submitTransferFromPanel_fn, showConferencePanel_fn, hideConferencePanel_fn, submitConferenceFromPanel_fn, showDtmfPanel_fn, hideDtmfPanel_fn, openInCallDeviceMenu_fn, openPresentMenu_fn, selectPresentSource_fn, deleteDialDigit_fn, bindTabButtons_fn, switchTab_fn, restoreActiveTab_fn, toggleDialpadSetting_fn, bindDialpadInputState_fn, bindDialpadDigits_fn, syncDialDeleteKeyState_fn, hideLoadingOverlay_fn, bindSearchInputState_fn, renderTabContent_fn, renderDialpad_fn, maxDidLength_fn, maxContactNameLength_fn, clampDialValue_fn, renderContacts_fn, recentGroupKey_fn, groupRecents_fn, isNumberInContacts_fn, copyTextToClipboard_fn, showToast_fn, recentCallSideLabel_fn, renderRecents_fn, bindRecentExpandedActions_fn, closeAllContactMenus_fn, bindContactExpandedActions_fn, deleteContactById_fn, handleClearTab_fn, applySavedAudioPreferences_fn, resolveRingtoneUrl_fn, startFallbackRinger_fn, stopFallbackRinger_fn, startRingtone_fn, stopRingtoneAudioElement_fn, stopRingtone_fn, getDbItem_fn, normalizeLanguage_fn, loadLanguagePack_fn, t_fn, applyLanguageToStaticLabels_fn, applyFeatureVisibility_fn, registrationDisplayUser_fn, getBoolConfig_fn, buddyStorageKey_fn, loadBuddyCollection_fn, saveBuddyCollection_fn, loadContactsFromStorage_fn, buildContactLookup_fn, loadRecentsFromStorage_fn, getRecentCallStatus_fn, parseRecentDate_fn, formatRecentClock_fn, formatRecentDay_fn, formatRecentDayKey_fn, formatBillsec_fn, toEpoch_fn, saveRecentFromCurrentCall_fn, deleteRecentById_fn, deleteRecentGroup_fn, clearAllRecents_fn, addContact_fn, updateContact_fn, promptAddContact_fn, hideAddContactSheet_fn, showAddContactPanel_fn, saveAddContactForm_fn, clearAllContacts_fn, toggleRegistration_fn;
var PhoneUI = class {
  constructor({ root, sdk, config = {}, deps = {} } = {}) {
    __privateAdd(this, _PhoneUI_instances);
    if (!root) throw new Error("PhoneUI requires root");
    this.root = root;
    this.config = config || {};
    this.sdk = sdk || new PhoneSDK(config, deps);
    this.renderer = new DomRenderer(root);
    const notificationsEnabled = __privateMethod(this, _PhoneUI_instances, getBoolConfig_fn).call(this, "EnableNotifications", false);
    this.notifications = new UINotifications({
      enabled: notificationsEnabled,
      onClick: () => {
        try {
          const message = {
            type: "vphone-call",
            payload: { phase: "notification-click" }
          };
          if (typeof window === "undefined") return;
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, "*");
          }
          window.postMessage(message, "*");
        } catch {
        }
      }
    });
    if (notificationsEnabled) {
      void this.notifications.ensurePermission();
    }
    this.localDB = typeof window !== "undefined" ? window.localStorage : null;
    const configuredUser = String(this.config.Username || "").trim();
    const storedProfileId = String(__privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "profileUserID", "") || "").trim();
    this.profileUserID = configuredUser || storedProfileId || this.config.profileUserID || "default";
    this.profileName = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "profileName", this.config.profileName || "") || "";
    if (this.profileName) {
      this.config.profileName = this.profileName;
      try {
        this.sdk.configure?.({ profileName: this.profileName });
      } catch {
      }
    }
    this.enableVideoCalling = __privateMethod(this, _PhoneUI_instances, getBoolConfig_fn).call(this, "EnableVideoCalling", false);
    this.enableTransfer = __privateMethod(this, _PhoneUI_instances, getBoolConfig_fn).call(this, "EnableTransfer", true);
    this.enableConference = __privateMethod(this, _PhoneUI_instances, getBoolConfig_fn).call(this, "EnableConference", false);
    this.enableRecordAllCalls = __privateMethod(this, _PhoneUI_instances, getBoolConfig_fn).call(this, "EnableRecordAllCalls", false);
    this.enableFreeDial = __privateMethod(this, _PhoneUI_instances, getBoolConfig_fn).call(this, "EnableFreeDial", true);
    this.enableBuddies = __privateMethod(this, _PhoneUI_instances, getBoolConfig_fn).call(this, "EnableBuddies", true);
    this.settingsButtonVisible = __privateMethod(this, _PhoneUI_instances, getBoolConfig_fn).call(this, "EnableSettings", false);
    this.renderer.showSettingsButton = this.settingsButtonVisible;
    this._ringtoneAudio = null;
    this._ringtoneFallbackTimer = null;
    this.language = __privateMethod(this, _PhoneUI_instances, normalizeLanguage_fn).call(this, __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "Language", this.config.Language || "vi"));
    this.langPack = {};
    this.dialpadToggles = { auto: false, cw: true, dnd: false, rec: false };
    this.activeTab = "dialpad";
    this.tabSearch = { contacts: "", recents: "", dialpad: "" };
    this.callConnected = false;
    this.recentExpandedById = {};
    this.recentGroups = [];
    this.editingContactId = "";
    this.contacts = __privateMethod(this, _PhoneUI_instances, loadContactsFromStorage_fn).call(this);
    this.recents = __privateMethod(this, _PhoneUI_instances, loadRecentsFromStorage_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, applySavedAudioPreferences_fn).call(this);
    this.profileMenu = null;
    this.returnTab = "dialpad";
    this.activeCall = null;
    this.currentCallLog = null;
    this.callTimerStartedAt = null;
    this.callTimerInterval = null;
  }
  mount() {
    bindControls(this.root, {
      onCall: () => this.call(),
      onCallAudio: () => this.call({ video: false }),
      onCallVideo: () => this.call({ video: true }),
      onAnswer: () => {
        __privateMethod(this, _PhoneUI_instances, stopRingtone_fn).call(this);
        return this.sdk.answer();
      },
      onHangup: () => {
        __privateMethod(this, _PhoneUI_instances, stopRingtone_fn).call(this);
        return this.sdk.hangup();
      },
      onMute: () => this.sdk.mute(),
      onHold: () => this.toggleHold(),
      onReconnect: () => __privateMethod(this, _PhoneUI_instances, reconnectLastCall_fn).call(this),
      onTransfer: () => __privateMethod(this, _PhoneUI_instances, transferCall_fn).call(this),
      onConference: () => __privateMethod(this, _PhoneUI_instances, startConference_fn).call(this),
      onSearch: () => {
        this.renderer.showSearch(true);
        this.renderer.setStatus("Search");
      },
      onFilter: () => this.renderer.setStatus("Filter"),
      onSettings: () => __privateMethod(this, _PhoneUI_instances, openSettings_fn).call(this),
      onAddContact: () => __privateMethod(this, _PhoneUI_instances, promptAddContact_fn).call(this),
      onClearTab: ({ tab } = {}) => __privateMethod(this, _PhoneUI_instances, handleClearTab_fn).call(this, tab),
      onMore: ({ element } = {}) => __privateMethod(this, _PhoneUI_instances, openProfileMenu_fn).call(this, element),
      onRegisterToggle: () => __privateMethod(this, _PhoneUI_instances, toggleRegistration_fn).call(this),
      onDialDelete: () => __privateMethod(this, _PhoneUI_instances, deleteDialDigit_fn).call(this),
      onDialpadToggle: ({ key } = {}) => __privateMethod(this, _PhoneUI_instances, toggleDialpadSetting_fn).call(this, key),
      onFocusSearch: () => {
        this.renderer.showSearch(true);
        const search = this.root.querySelector("#txtFindBuddy");
        if (search) {
          search.focus();
          search.select?.();
        }
      }
    });
    __privateMethod(this, _PhoneUI_instances, bindTabButtons_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, bindDialpadInputState_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, bindDialpadDigits_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, bindSearchInputState_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, bindRecentExpandedActions_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, bindContactExpandedActions_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, bindCallSurfaceControls_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, hideLoadingOverlay_fn).call(this);
    this.sdk.on("incoming-call", (call) => {
      const caller = __privateMethod(this, _PhoneUI_instances, resolveCallPeer_fn).call(this, call?.from || call?.displayName || "", {
        displayName: call?.displayName || ""
      });
      this.activeCall = {
        direction: "incoming",
        from: call?.from || "",
        target: call?.from || "",
        number: caller.number || "",
        displayName: caller.name || caller.primary || ""
      };
      this.currentCallLog = {
        direction: "incoming",
        number: caller.number || caller.name,
        name: caller.name || caller.primary || caller.number,
        startedAt: /* @__PURE__ */ new Date(),
        answeredAt: null
      };
      if (this.dialpadToggles.dnd) {
        this.sdk.reject?.({ statusCode: 486, reasonPhrase: "Do Not Disturb" });
        this.renderer.setStatus(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "doNotDisturb"));
        return;
      }
      __privateMethod(this, _PhoneUI_instances, renderIncomingCall_fn).call(this, call);
      this.renderer.setStatus(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "incoming"));
      this.notifications.notifyIncomingCall(call?.from);
      __privateMethod(this, _PhoneUI_instances, startRingtone_fn).call(this);
      if (this.dialpadToggles.auto) {
        window.setTimeout(() => {
          this.sdk.answer?.().catch((err) => {
            this.renderer.setStatus(`Answer failed: ${String(err?.message || err)}`);
          });
        }, 0);
      }
    });
    this.sdk.on("outgoing-call", ({ target }) => {
      const caller = __privateMethod(this, _PhoneUI_instances, resolveCallPeer_fn).call(this, target || "", {});
      this.activeCall = {
        direction: "outgoing",
        target: target || "",
        number: caller.number || target || "",
        displayName: caller.name || caller.primary || ""
      };
      this.currentCallLog = {
        direction: "outgoing",
        number: caller.number || target || "",
        name: caller.name || caller.primary || target || "",
        startedAt: /* @__PURE__ */ new Date(),
        answeredAt: null
      };
      __privateMethod(this, _PhoneUI_instances, renderCallProgress_fn).call(this, target);
      this.renderer.setStatus(`Calling ${caller.name || target}`);
    });
    this.sdk.on("call-connected", (payload = {}) => {
      __privateMethod(this, _PhoneUI_instances, stopRingtone_fn).call(this);
      this.notifications.clear();
      this.callConnected = true;
      const peer = __privateMethod(this, _PhoneUI_instances, resolveCallPeer_fn).call(this, this.activeCall?.number || this.activeCall?.target || this.activeCall?.from || "", { displayName: this.activeCall?.displayName || "" });
      this.activeCall = {
        ...this.activeCall || {},
        direction: payload.direction || this.activeCall?.direction || "active",
        number: peer.number || this.activeCall?.number || "",
        displayName: peer.name || peer.primary || this.activeCall?.displayName || ""
      };
      if (this.currentCallLog) this.currentCallLog.answeredAt = /* @__PURE__ */ new Date();
      __privateMethod(this, _PhoneUI_instances, renderActiveCall_fn).call(this);
      __privateMethod(this, _PhoneUI_instances, startCallTimer_fn).call(this);
      this.renderer.setStatus(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "connected"));
    });
    this.sdk.on("call-ended", () => {
      __privateMethod(this, _PhoneUI_instances, stopRingtone_fn).call(this);
      __privateMethod(this, _PhoneUI_instances, stopCallTimer_fn).call(this);
      this.notifications.clear();
      __privateMethod(this, _PhoneUI_instances, saveRecentFromCurrentCall_fn).call(this);
      this.callConnected = false;
      this.activeCall = null;
      this.currentCallLog = null;
      __privateMethod(this, _PhoneUI_instances, setBottomTabsVisible_fn).call(this, true);
      this.renderer.showTab(this.activeTab || "dialpad");
      __privateMethod(this, _PhoneUI_instances, renderTabContent_fn).call(this, this.activeTab || "dialpad");
      const regState2 = this.sdk.getRegistrationState?.() || {};
      this.renderer.setRegistrationState({
        ...regState2,
        user: __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, regState2.user)
      });
      if (regState2.online) {
        this.renderer.setStatus(this.dialpadToggles.dnd ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "doNotDisturb") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "online"));
      } else {
        this.renderer.setStatus(regState2.error ? "Reg Error" : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "offline"));
      }
    });
    this.sdk.on("mute-changed", ({ muted }) => {
      this.renderer.setStatus(muted ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "muted") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "unmuted"));
      const mute = this.root.querySelector("#line-1-btn-Mute");
      const unmute = this.root.querySelector("#line-1-btn-Unmute");
      if (mute) mute.style.display = muted ? "none" : "";
      if (unmute) unmute.style.display = muted ? "" : "none";
    });
    this.sdk.on("hold-changed", ({ onHold }) => {
      this.renderer.setStatus(onHold ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "onHold") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "resumed"));
      const hold = this.root.querySelector("#line-1-btn-Hold");
      const resume = this.root.querySelector("#line-1-btn-Unhold");
      if (hold) hold.style.display = onHold ? "none" : "";
      if (resume) resume.style.display = onHold ? "" : "none";
    });
    this.sdk.on("local-stream", (stream) => this.renderer.attachMedia("local", stream));
    this.sdk.on("remote-stream", (stream) => this.renderer.attachMedia("remote", stream));
    this.sdk.on("registration-changed", ({ online, user, error } = {}) => {
      const displayUser = __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, user);
      if (displayUser && displayUser !== "default") this.profileUserID = displayUser;
      this.renderer.setRegistrationState({ online, user: displayUser, error });
      if (online) {
        this.renderer.setStatus(this.dialpadToggles.dnd ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "doNotDisturb") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "online"));
        void this.sdk.warmMedia?.({ audio: true, video: false });
      } else {
        const errText = String(error || this.renderer.lastRegistrationError || "").trim();
        this.renderer.setStatus(errText || __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "offline"));
      }
    });
    this.renderer.statusOnlineLabel = __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "onlineShort");
    this.renderer.statusOfflineLabel = __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "offlineShort");
    this.renderer.statusDndLabel = __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "doNotDisturb");
    this.renderer.dndActive = !!this.dialpadToggles.dnd;
    this.renderer.onTabRendered = () => {
      this.renderer.showSettingsButton = this.settingsButtonVisible;
      __privateMethod(this, _PhoneUI_instances, applyFeatureVisibility_fn).call(this);
      const regState2 = this.sdk.getRegistrationState?.() || {};
      this.renderer.setRegistrationState({
        ...regState2,
        user: __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, regState2.user),
        error: regState2.online ? void 0 : this.renderer.lastRegistrationError || void 0
      });
    };
    const regState = this.sdk.getRegistrationState?.();
    if (regState) {
      this.renderer.setRegistrationState({
        ...regState,
        user: __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, regState.user)
      });
    }
    this.renderer.setStatus(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "registering"));
    __privateMethod(this, _PhoneUI_instances, applyFeatureVisibility_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, applyLanguageToStaticLabels_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, loadLanguagePack_fn).call(this, this.language).then(() => {
      __privateMethod(this, _PhoneUI_instances, applyLanguageToStaticLabels_fn).call(this);
      __privateMethod(this, _PhoneUI_instances, renderTabContent_fn).call(this, this.activeTab || "dialpad");
    }).catch(() => {
    });
  }
  async call(options = {}) {
    const target = options.target || options.numberToDial || this.renderer.getTargetNumber();
    if (!target) {
      this.renderer.setStatus("Missing target number");
      return;
    }
    const dialTarget = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, String(target));
    const peer = __privateMethod(this, _PhoneUI_instances, resolveCallPeer_fn).call(this, dialTarget, { displayName: "" });
    this.activeCall = {
      direction: "outgoing",
      target: dialTarget,
      number: peer.number || dialTarget,
      displayName: peer.name || peer.primary || ""
    };
    this.currentCallLog = {
      direction: "outgoing",
      number: peer.number || dialTarget,
      name: peer.name || peer.primary || dialTarget,
      startedAt: /* @__PURE__ */ new Date(),
      answeredAt: null
    };
    __privateMethod(this, _PhoneUI_instances, renderCallProgress_fn).call(this, dialTarget);
    this.renderer.setStatus(`Calling ${peer.name || dialTarget}`);
    try {
      const callType = options.callType || (options.video ? "video" : "audio");
      const callOptions = {
        video: !!(options.video || callType === "video"),
        extraHeaders: Array.isArray(options.extraHeaders) ? options.extraHeaders : void 0,
        constraints: options.constraints
      };
      await this.sdk.call(dialTarget, callOptions);
    } catch (err) {
      this.renderer.setStatus(`Call failed: ${String(err?.message || err)}`);
      this.callConnected = false;
      this.activeCall = null;
      this.currentCallLog = null;
      this.renderer.showTab(this.activeTab || "dialpad");
      __privateMethod(this, _PhoneUI_instances, renderTabContent_fn).call(this, this.activeTab || "dialpad");
    }
  }
  /** Host click-to-call entry (postMessage / parent API). */
  async makeCallFromHost(payload = {}) {
    const numberToDial = payload.numberToDial || payload.target || payload.number || "";
    return this.call({
      target: numberToDial,
      callType: payload.callType || "audio",
      video: payload.callType === "video",
      extraHeaders: payload.extraHeaders
    });
  }
  async toggleHold() {
    if (this.sdk.isOnHold?.()) return this.sdk.resume();
    return this.sdk.hold();
  }
};
_PhoneUI_instances = new WeakSet();
openProfileMenu_fn = function(anchor) {
  if (this.profileMenu && this.profileMenu.getAttribute("data-role") === "profile-menu") {
    __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
    return;
  }
  __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  if (typeof document === "undefined") {
    this.renderer.setStatus("Menu unavailable");
    return;
  }
  const host = __privateMethod(this, _PhoneUI_instances, popupHost_fn).call(this);
  const menu = document.createElement("ul");
  menu.className = "ui-menu ui-widget ui-widget-content popupMenuList";
  menu.setAttribute("role", "menu");
  menu.setAttribute("data-role", "profile-menu");
  const menuItems = [
    __privateMethod(this, _PhoneUI_instances, profileMenuItem_fn).call(this, "configure", "fa fa-wrench", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "configureExtension"))
  ];
  if (this.settingsButtonVisible) {
    menuItems.push(__privateMethod(this, _PhoneUI_instances, profileMenuItem_fn).call(this, "settings", "fa fa-sliders", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "settings")));
  }
  menu.innerHTML = menuItems.join("");
  menu.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const item = target.closest("[data-menu-action]");
    if (!item || !menu.contains(item)) return;
    event.preventDefault();
    event.stopPropagation();
    const action = item.getAttribute("data-menu-action") || "";
    __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
    __privateMethod(this, _PhoneUI_instances, handleProfileMenuAction_fn).call(this, action);
  });
  host.appendChild(menu);
  this.profileMenu = menu;
  const anchorRect = anchor?.getBoundingClientRect?.();
  const hostRect = host.getBoundingClientRect?.() || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  const width = Math.max(200, menu.offsetWidth || 200);
  const height = menu.offsetHeight || 160;
  const topBase = anchorRect ? anchorRect.bottom - hostRect.top + 4 : 10;
  const leftBase = anchorRect ? anchorRect.right - hostRect.left - width : 10;
  const maxLeft = Math.max(10, hostRect.width - width - 10);
  const maxTop = Math.max(10, hostRect.height - height - 10);
  menu.style.left = `${Math.max(10, Math.min(leftBase, maxLeft))}px`;
  menu.style.top = `${Math.max(10, Math.min(topBase, maxTop))}px`;
  const outsideClick = (event) => {
    if (anchor && anchor.contains(event.target)) return;
    if (this.profileMenu && !this.profileMenu.contains(event.target)) __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  };
  const escapeKey = (event) => {
    if (event.key === "Escape") __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  };
  this.profileMenuCleanup = () => {
    document.removeEventListener("click", outsideClick, true);
    document.removeEventListener("keydown", escapeKey, true);
  };
  window.setTimeout(() => {
    document.addEventListener("click", outsideClick, true);
    document.addEventListener("keydown", escapeKey, true);
  }, 0);
};
profileMenuItem_fn = function(action, iconClass, text) {
  return `<li class="ui-menu-item" role="menuitem" data-menu-action="${escapeHtml(action)}"><div class="ui-menu-item-wrapper">${iconClass ? `<span class="ui-icon ${escapeHtml(iconClass)}"></span>` : ""}${escapeHtml(text)}</div></li>`;
};
popupHost_fn = function() {
  const phone = this.root.querySelector("#Phone") || this.root;
  if (phone && getComputedStyle(phone).position === "static") phone.style.position = "relative";
  return phone || document.body;
};
closeProfileMenu_fn = function() {
  if (typeof this.profileMenuCleanup === "function") this.profileMenuCleanup();
  this.profileMenuCleanup = null;
  if (this.profileMenu?.parentNode) this.profileMenu.parentNode.removeChild(this.profileMenu);
  this.profileMenu = null;
};
confirmInPanel_fn = function({ message, confirmText, cancelText, onConfirm } = {}) {
  __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  if (typeof document === "undefined") {
    if (typeof onConfirm === "function") void onConfirm();
    return;
  }
  __privateMethod(this, _PhoneUI_instances, closePanelConfirm_fn).call(this);
  const host = __privateMethod(this, _PhoneUI_instances, popupHost_fn).call(this);
  const overlay = document.createElement("div");
  overlay.className = "panelConfirmOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
      <div class="panelConfirmBox">
        <div class="panelConfirmMessage">${escapeHtml(message || __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirm"))}</div>
        <div class="panelConfirmActions">
          <button type="button" class="configSecondaryButton panelConfirmCancel">${escapeHtml(cancelText || __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "cancel"))}</button>
          <button type="button" class="configPrimaryButton panelConfirmOk">${escapeHtml(confirmText || __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirm"))}</button>
        </div>
      </div>`;
  const close = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener("keydown", escapeKey, true);
  };
  const escapeKey = (event) => {
    if (event.key === "Escape") close();
  };
  overlay.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target === overlay || target.closest(".panelConfirmCancel")) {
      close();
      return;
    }
    if (target.closest(".panelConfirmOk")) {
      close();
      if (typeof onConfirm === "function") void onConfirm();
    }
  });
  document.addEventListener("keydown", escapeKey, true);
  host.appendChild(overlay);
  overlay.querySelector(".panelConfirmOk")?.focus();
};
closePanelConfirm_fn = function() {
  this.root.querySelectorAll(".panelConfirmOverlay").forEach((node) => node.parentNode?.removeChild(node));
};
handleProfileMenuAction_fn = function(action) {
  if (action === "configure") {
    __privateMethod(this, _PhoneUI_instances, renderConfigExtension_fn).call(this, "extension");
    return;
  }
  if (action === "settings") {
    __privateMethod(this, _PhoneUI_instances, renderConfigExtension_fn).call(this, "settings");
    return;
  }
};
getDevices_fn = async function() {
  try {
    if (typeof this.sdk.listDevices !== "function") return [];
    return await this.sdk.listDevices();
  } catch (err) {
    this.renderer.setStatus(`Load devices failed: ${String(err?.message || err)}`);
    return [];
  }
};
openSettings_fn = async function() {
  __privateMethod(this, _PhoneUI_instances, renderConfigExtension_fn).call(this, "settings");
};
renderConfigExtension_fn = async function(mode = "extension") {
  this.returnTab = this.activeTab || "dialpad";
  const isSettings = mode === "settings";
  const isLanguage = mode === "language";
  const devices = await __privateMethod(this, _PhoneUI_instances, getDevices_fn).call(this);
  const mic = devices.filter((d) => d.kind === "audioinput");
  const cam = devices.filter((d) => d.kind === "videoinput");
  const spk = devices.filter((d) => d.kind === "audiooutput");
  const languageOptions = [
    ["en", "English"],
    ["vi", "Ti\u1EBFng Vi\u1EC7t"]
  ];
  const currentLanguage = __privateMethod(this, _PhoneUI_instances, normalizeLanguage_fn).call(this, __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "Language", this.config.Language || "vi"));
  const selectedSpeaker = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "AudioOutputId", "");
  const selectedMic = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "AudioSrcId", "");
  const selectedRing = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "RingOutputId", "");
  const selectedCam = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "VideoSrcId", "");
  const noiseOn = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "NoiseSuppression", "1") !== "0";
  const echoOn = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "EchoCancellation", "1") !== "0";
  const agcOn = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "AutoGainControl", "1") !== "0";
  const deviceOptions = (items, fallback, selectedId = "") => {
    const rows = items.length ? items : [{ deviceId: "", label: fallback }];
    return rows.map((d) => {
      const selected = selectedId && d.deviceId === selectedId ? " selected" : "";
      return `<option value="${escapeHtml(d.deviceId)}"${selected}>${escapeHtml(d.label || d.deviceId || fallback)}</option>`;
    }).join("");
  };
  const title = isLanguage ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "language") : isSettings ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "settings") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "configureExtension");
  const icon = isLanguage ? "fa-language" : isSettings ? "fa-sliders" : "fa-cogs";
  const requiredMark = `<span style="color:#dc2626; font-weight:700">*</span>`;
  const serverValue = this.config.Server || readStorageValue("Server") || "";
  const domainValue = this.config.Domain || readStorageValue("Domain") || serverValue;
  const accountHtml = isSettings || isLanguage ? "" : `
      <div id="Configure_Extension_Html">
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "asteriskServer"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Server" class="UiInputText" type="text" value="${escapeHtml(serverValue)}"></div>
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "websocketPort"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Port" class="UiInputText" type="text" value="${escapeHtml(String(this.config.Port || readStorageValue("Port") || ""))}"></div>
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "websocketPath"))}:</div>
        <div><input id="Configure_Account_ServerPath" class="UiInputText" type="text" value="${escapeHtml(this.config.ServerPath || readStorageValue("ServerPath") || "/ws")}"></div>
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "fullName"))} (${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "optional"))}):</div>
        <div><input id="Configure_Account_profileName" class="UiInputText" type="text" value="${escapeHtml(this.profileName)}"></div>
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "sipDomain"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Domain" class="UiInputText" type="text" value="${escapeHtml(domainValue)}" placeholder="${escapeHtml(serverValue)}"></div>
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "sipUsername"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Username" class="UiInputText" type="text" value="${escapeHtml(this.config.Username || readStorageValue("Username") || "")}"></div>
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "sipPassword"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Password" class="UiInputText" type="password" value="${escapeHtml(this.config.Password || "")}"></div>
      </div>`;
  const settingsHtml = isSettings ? `
      <div class="UiTextHeading"><i class="fa fa-video-camera UiTextHeadingIcon" style="background-color:#208e3c"></i> ${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "audioVideo"))}</div>
      <div id="Audio_Video_Html">
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "speaker"))}</div>
        <div><select id="playbackSrc" style="width:100%">${deviceOptions(spk, "(Default Speaker)", selectedSpeaker)}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_SpeakerOutput" class="Settings_VolumeOutput"></div></div>
        <div><button class="roundButtons" id="preview_output_play"><i class="fa fa-play"></i></button></div>
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "ringDevice"))}</div>
        <div><select id="ringDevice" style="width:100%">${deviceOptions(spk, "(Default Ring Device)", selectedRing)}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_RingerOutput" class="Settings_VolumeOutput"></div></div>
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "microphone"))}</div>
        <div><select id="microphoneSrc" style="width:100%">${deviceOptions(mic, "(Default Microphone)", selectedMic)}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_MicrophoneOutput" class="Settings_VolumeOutput"></div></div>
        <div><input type="checkbox" id="Settings_AutoGainControl"${agcOn ? " checked" : ""}><label for="Settings_AutoGainControl"> ${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "autoGainControl"))}</label></div>
        <div><input type="checkbox" id="Settings_EchoCancellation"${echoOn ? " checked" : ""}><label for="Settings_EchoCancellation"> ${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "echoCancellation"))}</label></div>
        <div><input type="checkbox" id="Settings_NoiseSuppression"${noiseOn ? " checked" : ""}><label for="Settings_NoiseSuppression"> ${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "noiseSuppression"))}</label></div>
        ${this.enableVideoCalling ? `<div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "camera"))}</div><div><select id="previewVideoSrc" style="width:100%">${deviceOptions(cam, "(Default Camera)", selectedCam)}</select></div>` : ""}
      </div>` : "";
  const languageHtml = isSettings || isLanguage ? `
      <div class="UiTextHeading"><i class="fa fa-language UiTextHeadingIcon" style="background-color:#6b7280"></i> ${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "language"))}</div>
      <div id="Language_Html">
        <div class="UiText">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "language"))}:</div>
        <div><select id="Settings_Language" class="UiInputText">${languageOptions.map(([value, label]) => `<option value="${escapeHtml(value)}"${value === currentLanguage ? " selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select></div>
      </div>` : "";
  __privateMethod(this, _PhoneUI_instances, showActionPanel_fn).call(this, `
      <div class="configExtensionScreen">
        <div class="configExtensionHeader"><div class="configExtensionTitle"><i class="fa ${icon}"></i> ${escapeHtml(title)}</div></div>
        <div class="configExtensionForm">${accountHtml}${settingsHtml}${languageHtml}</div>
        <div class="UiWindowButtonBar" id="ButtonBar">
          <button class="configPrimaryButton" id="Config_Save">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "save"))}</button>
          <button class="configSecondaryButton" id="Config_Cancel">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "cancel"))}</button>
          ${!isSettings && !isLanguage ? `<button class="configSecondaryButton" id="Config_Clear">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "clearExtensionConfig"))}</button>` : ""}
          ${isSettings ? `<button class="configSecondaryButton" id="Config_Reset">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "resetSettings"))}</button>` : ""}
        </div>
      </div>`, { coverTabs: true });
  __privateMethod(this, _PhoneUI_instances, bindConfigPanel_fn).call(this, mode);
  this.renderer.setStatus(title);
};
bindConfigPanel_fn = function(mode) {
  const save = this.root.querySelector("#Config_Save");
  const cancel = this.root.querySelector("#Config_Cancel");
  const clear = this.root.querySelector("#Config_Clear");
  const reset = this.root.querySelector("#Config_Reset");
  if (save) save.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, saveConfigPanel_fn).call(this, mode));
  if (cancel) cancel.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, switchTab_fn).call(this, this.returnTab || "dialpad"));
  if (clear) clear.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, confirmInPanel_fn).call(this, {
    message: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirmClearExtension"),
    confirmText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "clearExtensionConfig"),
    onConfirm: async () => {
      const keys = ["Server", "Port", "ServerPath", "profileName", "Domain", "Username", "Password", "PasswordType"];
      keys.forEach((key) => {
        writeStorageValue(key, "");
        this.config[key] = "";
      });
      this.localDB?.removeItem("profileUserID");
      this.profileName = "";
      this.profileUserID = "default";
      try {
        await persistSipPassword("");
      } catch {
      }
      try {
        await this.sdk.unregister?.();
      } catch {
      }
      try {
        this.sdk.configure?.(Object.fromEntries(keys.map((key) => [key, ""])));
      } catch {
      }
      this.renderer.setRegistrationState({
        online: false,
        user: "",
        error: "Missing SIP configuration"
      });
      this.renderer.setStatus("Missing SIP configuration");
      await __privateMethod(this, _PhoneUI_instances, renderConfigExtension_fn).call(this, "extension");
    }
  }));
  if (reset) reset.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, confirmInPanel_fn).call(this, {
    message: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirmResetSettings"),
    confirmText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "resetSettings"),
    onConfirm: async () => {
      ["AudioOutputId", "AudioSrcId", "RingOutputId", "VideoSrcId", "Language", "NoiseSuppression", "EchoCancellation", "AutoGainControl"].forEach((key) => this.localDB?.removeItem(key));
      this.language = __privateMethod(this, _PhoneUI_instances, normalizeLanguage_fn).call(this, this.config.Language || "vi");
      __privateMethod(this, _PhoneUI_instances, applySavedAudioPreferences_fn).call(this);
      await __privateMethod(this, _PhoneUI_instances, loadLanguagePack_fn).call(this, this.language);
      await __privateMethod(this, _PhoneUI_instances, renderConfigExtension_fn).call(this, "settings");
      this.renderer.setStatus(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "settingsReset"));
    }
  }));
};
saveConfigPanel_fn = async function(mode) {
  if (!this.localDB) return;
  const valueOf = (selector) => this.root.querySelector(selector)?.value || "";
  let savedStatus = mode === "extension" ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "extensionConfigSaved") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "settingsSaved");
  if (mode === "extension") {
    const server = valueOf("#Configure_Account_Server");
    let domain = valueOf("#Configure_Account_Domain");
    if (!domain && server) domain = server;
    const username = valueOf("#Configure_Account_Username");
    const rawPassword = valueOf("#Configure_Account_Password");
    const inputType = this.config.PasswordType || readStorageValue("PasswordType") || "";
    const storedAuth = prepareSipPasswordForStorage(rawPassword, {
      username,
      realm: domain,
      passwordType: inputType
    });
    const nextConfig = normalizePhoneConfig({
      Server: server,
      Port: valueOf("#Configure_Account_Port"),
      ServerPath: valueOf("#Configure_Account_ServerPath"),
      profileName: valueOf("#Configure_Account_profileName"),
      Domain: domain,
      Username: username,
      Password: storedAuth.password,
      PasswordType: storedAuth.type
    });
    Object.entries(nextConfig).forEach(([key, value]) => {
      if (key === "Password" || key === "EnableRingtone") return;
      if (["Server", "Port", "ServerPath", "profileName", "Domain", "Username", "PasswordType"].includes(key)) {
        writeStorageValue(key, value);
      }
    });
    await persistSipPassword(nextConfig.Password);
    writeStorageValue("PasswordType", nextConfig.PasswordType || "ha1");
    Object.assign(this.config, nextConfig);
    this.profileName = nextConfig.profileName || this.profileName;
    this.profileUserID = nextConfig.Username || this.profileUserID;
    try {
      this.localDB?.setItem("profileUserID", this.profileUserID);
    } catch {
    }
    try {
      await this.sdk.unregister?.();
      this.sdk.configure?.(nextConfig);
      const state = await this.sdk.register?.();
      const regState = state || this.sdk.getRegistrationState?.() || {};
      this.renderer.setRegistrationState({
        ...regState,
        user: __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, regState.user || nextConfig.Username)
      });
    } catch (err) {
      savedStatus = `Register failed: ${String(err?.message || err)}`;
      this.renderer.setRegistrationState({
        online: false,
        user: __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, nextConfig.Username),
        error: String(err?.message || err)
      });
    }
  }
  if (mode === "settings") {
    this.localDB.setItem("AudioOutputId", valueOf("#playbackSrc"));
    this.localDB.setItem("AudioSrcId", valueOf("#microphoneSrc"));
    this.localDB.setItem("RingOutputId", valueOf("#ringDevice"));
    this.localDB.setItem("VideoSrcId", valueOf("#previewVideoSrc"));
    const checked = (selector) => !!this.root.querySelector(selector)?.checked;
    this.localDB.setItem("NoiseSuppression", checked("#Settings_NoiseSuppression") ? "1" : "0");
    this.localDB.setItem("EchoCancellation", checked("#Settings_EchoCancellation") ? "1" : "0");
    this.localDB.setItem("AutoGainControl", checked("#Settings_AutoGainControl") ? "1" : "0");
    __privateMethod(this, _PhoneUI_instances, applySavedAudioPreferences_fn).call(this);
    try {
      await __privateMethod(this, _PhoneUI_instances, switchSelectedDevice_fn).call(this, "audiooutput", "#playbackSrc");
      await __privateMethod(this, _PhoneUI_instances, switchSelectedDevice_fn).call(this, "audioinput", "#microphoneSrc");
    } catch {
    }
  }
  if (mode === "settings" || mode === "language") {
    const selectedLanguage = valueOf("#Settings_Language") || "vi";
    this.localDB.setItem("Language", __privateMethod(this, _PhoneUI_instances, normalizeLanguage_fn).call(this, selectedLanguage));
    this.language = __privateMethod(this, _PhoneUI_instances, normalizeLanguage_fn).call(this, selectedLanguage);
    await __privateMethod(this, _PhoneUI_instances, loadLanguagePack_fn).call(this, this.language);
    __privateMethod(this, _PhoneUI_instances, applyLanguageToStaticLabels_fn).call(this);
    savedStatus = __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "settingsSaved");
  }
  __privateMethod(this, _PhoneUI_instances, switchTab_fn).call(this, this.returnTab || "dialpad");
  this.renderer.setStatus(savedStatus);
};
switchSelectedDevice_fn = async function(kind, selector) {
  const deviceId = this.root.querySelector(selector)?.value || "";
  if (!deviceId || typeof this.sdk.switchDevice !== "function") return;
  await this.sdk.switchDevice(kind, deviceId);
};
reconnectLastCall_fn = async function() {
  if (typeof this.sdk.reconnect !== "function") {
    this.renderer.setStatus("Reconnect not supported");
    return;
  }
  try {
    await this.sdk.reconnect();
    this.renderer.setStatus("Reconnect started");
  } catch (err) {
    this.renderer.setStatus(`Reconnect failed: ${String(err?.message || err)}`);
  }
};
transferCall_fn = async function() {
  if (typeof this.sdk.transfer !== "function") {
    this.renderer.setStatus("Transfer not supported");
    return;
  }
  const target = typeof window !== "undefined" && typeof window.prompt === "function" ? window.prompt("Transfer to number:", "") : "";
  if (!target) return;
  try {
    await this.sdk.transfer(target);
    this.renderer.setStatus(`Transfer requested to ${target}`);
  } catch (err) {
    this.renderer.setStatus(`Transfer failed: ${String(err?.message || err)}`);
  }
};
startConference_fn = async function() {
  if (typeof this.sdk.conference !== "function") {
    this.renderer.setStatus("Conference not supported");
    return;
  }
  const target = typeof window !== "undefined" && typeof window.prompt === "function" ? window.prompt("Conference with number:", "") : "";
  if (!target) return;
  try {
    await this.sdk.conference(target);
    this.renderer.setStatus(`Conference requested with ${target}`);
  } catch (err) {
    this.renderer.setStatus(`Conference failed: ${String(err?.message || err)}`);
  }
};
setBottomTabsVisible_fn = function(visible) {
  const phone = this.root.querySelector("#Phone") || this.root;
  phone.classList.toggle("phoneModalOpen", !visible);
  const tabBar = this.root.querySelector("#bottomTabBar");
  if (tabBar) tabBar.style.display = visible ? "" : "none";
};
showActionPanel_fn = function(html, { coverTabs = false } = {}) {
  const host = this.root.querySelector("#actionArea");
  if (!host) return;
  if (this.renderer.refs?.myContacts) this.renderer.refs.myContacts.style.display = "none";
  if (this.renderer.refs?.contactsTabHeader) this.renderer.refs.contactsTabHeader.style.display = "none";
  if (this.renderer.refs?.searchArea) this.renderer.refs.searchArea.style.display = "none";
  host.classList.remove("dialpadMode");
  host.classList.toggle("configOverlayPane", !!coverTabs);
  host.innerHTML = html;
  host.style.display = "";
  if (coverTabs) __privateMethod(this, _PhoneUI_instances, setBottomTabsVisible_fn).call(this, false);
};
callPeerHtml_fn = function(caller) {
  const primary = escapeHtml(caller.primary || caller.name || caller.number || "");
  const secondaryText = caller.secondary || (caller.number && caller.name && caller.name !== caller.number ? caller.number : "");
  const secondary = secondaryText ? `<div class="vphoneCallPeerSub">${escapeHtml(secondaryText)}</div>` : "";
  return `<div class="vphoneCallPeer">${primary}</div>${secondary}`;
};
resolveCallPeer_fn = function(value, { displayName = "" } = {}) {
  this.contacts = __privateMethod(this, _PhoneUI_instances, loadContactsFromStorage_fn).call(this);
  const parsed = __privateMethod(this, _PhoneUI_instances, callLabel_fn).call(this, value);
  const number = parsed.number || (!parsed.name || parsed.name === __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "incoming") ? "" : parsed.name);
  const contactLookup = __privateMethod(this, _PhoneUI_instances, buildContactLookup_fn).call(this);
  const contactName = contactLookup.get(normalizeNumber(number)) || "";
  const callerIdName = normalizeText(displayName) || (parsed.name !== number ? parsed.name : "");
  return buildCallerDisplay(number, contactName, callerIdName);
};
renderIncomingCall_fn = function(call = {}) {
  const caller = __privateMethod(this, _PhoneUI_instances, resolveCallPeer_fn).call(this, call?.from || call?.displayName || __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "incoming"), {
    displayName: call?.displayName || ""
  });
  __privateMethod(this, _PhoneUI_instances, showActionPanel_fn).call(this, `
      <div class="vphoneCallScreen" data-call-state="incoming">
        <div class="vphoneCallCard">
          ${__privateMethod(this, _PhoneUI_instances, callPeerHtml_fn).call(this, caller)}
          <div class="vphoneCallStatus">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "incoming"))}</div>
          <div class="vphoneCallActions">
            <button type="button" class="vphoneCallActionBtn vphoneCallActionAnswer callAnswerAudio" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "answerCall"))}">
              <span class="vphoneCallActionIcon"><i class="fa fa-phone"></i></span>
              <span class="vphoneCallActionLabel">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "answerCall"))}</span>
            </button>
            <button type="button" class="vphoneCallActionBtn vphoneCallActionReject callReject" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "rejectCall"))}">
              <span class="vphoneCallActionIcon"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></span>
              <span class="vphoneCallActionLabel">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "rejectCall"))}</span>
            </button>
          </div>
        </div>
      </div>`, { coverTabs: true });
};
renderCallProgress_fn = function(target) {
  const caller = __privateMethod(this, _PhoneUI_instances, resolveCallPeer_fn).call(this, target || "Calling", {
    displayName: this.activeCall?.displayName || ""
  });
  __privateMethod(this, _PhoneUI_instances, showActionPanel_fn).call(this, `
      <div class="vphoneCallScreen" data-call-state="progress">
        <div class="vphoneCallCard">
          ${__privateMethod(this, _PhoneUI_instances, callPeerHtml_fn).call(this, caller)}
          <div class="vphoneCallStatus">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "connecting"))}</div>
          <div class="vphoneCallActions vphoneCallActionsSingle">
            <button type="button" class="vphoneCallActionBtn vphoneCallActionReject callReject" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "cancelAction"))}">
              <span class="vphoneCallActionIcon"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></span>
              <span class="vphoneCallActionLabel">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "cancelAction"))}</span>
            </button>
          </div>
        </div>
      </div>`, { coverTabs: true });
};
renderActiveCall_fn = function() {
  const caller = __privateMethod(this, _PhoneUI_instances, resolveCallPeer_fn).call(this, this.activeCall?.number || this.activeCall?.target || this.activeCall?.from || "Connected", { displayName: this.activeCall?.displayName || "" });
  __privateMethod(this, _PhoneUI_instances, showActionPanel_fn).call(this, `
      <div class="vphoneCallScreen" data-call-state="active">
        <div class="vphoneCallCard vphoneCallCardActive">
          ${__privateMethod(this, _PhoneUI_instances, callPeerHtml_fn).call(this, caller)}
          <div id="callDuration" class="vphoneCallTimer">00:00</div>
          <div class="vphoneInCallPanel">
            <div class="vphoneInCallMain">
              <div class="vphoneInCallGrid">
                <button id="line-1-btn-Mute" type="button" class="vphoneInCallBtn callMute" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "mute"))}">
                  <i class="fa fa-microphone"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "mute"))}</span>
                </button>
                <button id="line-1-btn-Unmute" type="button" class="vphoneInCallBtn callUnmute isOn" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "unmute"))}" style="display:none">
                  <i class="fa fa-microphone-slash"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "unmute"))}</span>
                </button>
                <button id="line-1-btn-Hold" type="button" class="vphoneInCallBtn callHold" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "holdCall"))}">
                  <i class="fa fa-pause"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "holdShort"))}</span>
                </button>
                <button id="line-1-btn-Unhold" type="button" class="vphoneInCallBtn callResume isOn" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "resumeCall"))}" style="display:none">
                  <i class="fa fa-play"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "resumeCall"))}</span>
                </button>
                ${this.enableTransfer ? `<button id="line-1-btn-Transfer" type="button" class="vphoneInCallBtn callTransfer" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "transferCall"))}">
                  <i class="fa fa-exchange"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "transferShort"))}</span>
                </button>
                <button id="line-1-btn-CancelTransfer" type="button" class="vphoneInCallBtn callCancelTransfer isOn" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "cancelTransfer"))}" style="display:none">
                  <i class="fa fa-exchange"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "transferShort"))}</span>
                </button>` : `<span></span>`}
                <button id="line-1-btn-ShowNumpad" type="button" class="vphoneInCallBtn callDtmf" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "keypad"))}">
                  <i class="fa fa-th"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "keypad"))}</span>
                </button>
                ${this.enableConference ? `<button id="line-1-btn-Conference" type="button" class="vphoneInCallBtn callConference" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "conferenceCall"))}">
                  <i class="fa fa-users"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "conferenceShort"))}</span>
                </button>
                <button id="line-1-btn-CancelConference" type="button" class="vphoneInCallBtn callCancelConference isOn" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "cancelConference"))}" style="display:none">
                  <i class="fa fa-users"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "conferenceShort"))}</span>
                </button>` : `<span></span>`}
                <button id="line-1-btn-settings" type="button" class="vphoneInCallBtn callDeviceSettings" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "speakerphone"))}">
                  <i class="fa fa-volume-up"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "speakerphone"))}</span>
                </button>
              </div>
            </div>
            ${this.enableTransfer ? `<div id="line-1-Transfer" class="vphoneInCallOverlay transferPopupPanel" style="display:none">
              <div class="vphoneInCallOverlayCard transferPopupCard">
                <div class="vphoneInCallOverlayHeader transferPopupTitle">
                  <span class="vphoneInCallOverlayTitle"><i class="fa fa-exchange"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "transferCall"))}</span></span>
                  <button type="button" class="vphoneInCallOverlayClose callCloseOverlay" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "close"))}"><i class="fa fa-times"></i></button>
                </div>
                <span class="searchClean transferSearch"><input id="line-1-txt-FindTransferBuddy" type="text" autocomplete="none" placeholder="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "transferSearchPlaceholder"))}"></span>
                <div class="transferButtonRow">
                  <button id="line-1-btn-blind-transfer" class="transferActionButton callBlindTransfer"><i class="fa fa-reply" style="transform: rotateY(180deg)"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "blindTransfer"))}</span></button>
                </div>
                <div id="line-1-transfer-status" class="callStatus" style="margin-top:10px; display:none">...</div>
              </div>
            </div>` : ""}
            ${this.enableConference ? `<div id="line-1-Conference" class="vphoneInCallOverlay transferPopupPanel conferencePopupPanel" style="display:none">
              <div class="vphoneInCallOverlayCard transferPopupCard conferencePopupCard">
                <div class="vphoneInCallOverlayHeader transferPopupTitle">
                  <span class="vphoneInCallOverlayTitle"><i class="fa fa-users"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "conferenceCall"))}</span></span>
                  <button type="button" class="vphoneInCallOverlayClose callCloseOverlay" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "close"))}"><i class="fa fa-times"></i></button>
                </div>
                <span class="searchClean transferSearch"><input id="line-1-txt-FindConferenceBuddy" type="text" autocomplete="none" placeholder="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "transferSearchPlaceholder"))}"></span>
                <div class="transferButtonRow">
                  <button id="line-1-btn-conference-dial" class="transferActionButton callConferenceDial"><i class="fa fa-phone"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "call"))}</span></button>
                  <button id="line-1-btn-cancel-conference-dial" class="transferActionButton transferCancelButton callCancelConference" style="display:none"><i class="fa fa-phone" style="transform: rotate(135deg);"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "cancelCall"))}</span></button>
                  <button id="line-1-btn-join-conference-call" class="transferActionButton" style="display:none"><i class="fa fa-users"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "joinConferenceCall"))}</span></button>
                </div>
                <div id="line-1-conference-status" class="callStatus" style="margin-top:10px; display:none">...</div>
              </div>
            </div>` : ""}
            <div id="line-1-Dtmf" class="vphoneDtmfCard" style="display:none">
              <div class="vphoneDtmfHeader">
                <div class="vphoneDtmfTitle"><i class="fa fa-th"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "keypad"))}</span></div>
                <button type="button" class="vphoneDtmfClose callCloseOverlay callCloseDtmf" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "close"))}" aria-label="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "close"))}">&#x2715;</button>
              </div>
              <div class="vphoneDtmfDisplay">
                <input id="line-1-dtmf-input" type="text" readonly inputmode="none" autocomplete="off" placeholder="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "dtmfPlaceholder"))}">
                <button type="button" id="line-1-dtmf-delete" class="vphoneDtmfBackspace" aria-label="Backspace">&#x232B;</button>
              </div>
              <div class="vphoneDtmfGrid">
                ${["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => `<button type="button" class="vphoneDtmfKey callDtmfDigit" data-dtmf-digit="${escapeHtml(digit)}">${escapeHtml(digit)}</button>`).join("")}
              </div>
            </div>
            <div class="vphoneInCallHangupRow">
              <button id="line-1-btn-End" type="button" class="vphoneCallActionBtn vphoneCallActionReject hangupButton callHangup" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "endCall"))}">
                <span class="vphoneCallActionIcon"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></span>
              </button>
            </div>
          </div>
        </div>
      </div>`, { coverTabs: true });
};
startCallTimer_fn = function() {
  __privateMethod(this, _PhoneUI_instances, stopCallTimer_fn).call(this);
  this.callTimerStartedAt = Date.now();
  __privateMethod(this, _PhoneUI_instances, tickCallTimer_fn).call(this);
  this.callTimerInterval = window.setInterval(() => __privateMethod(this, _PhoneUI_instances, tickCallTimer_fn).call(this), 1e3);
};
stopCallTimer_fn = function() {
  if (this.callTimerInterval) {
    window.clearInterval(this.callTimerInterval);
    this.callTimerInterval = null;
  }
  this.callTimerStartedAt = null;
};
tickCallTimer_fn = function() {
  const el = this.root.querySelector("#callDuration");
  if (!el || !this.callTimerStartedAt) return;
  const total = Math.max(0, Math.floor((Date.now() - this.callTimerStartedAt) / 1e3));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  el.textContent = `${minutes}:${seconds}`;
};
callLabel_fn = function(value) {
  const text = normalizeText(value);
  const quoted = text.match(/"([^"]+)"/);
  const match = text.match(/sip:([^@>;]+)/i);
  let number = "";
  if (match) {
    number = normalizeText(match[1]);
  } else if (text && !/^sip:/i.test(text) && !/@/.test(text)) {
    number = normalizeText(text.replace(/^<|>$/g, ""));
  } else {
    number = normalizeText(text.replace(/^<|>$/g, "").replace(/^sip:/i, "").split("@")[0]);
  }
  const display = normalizeText(quoted?.[1] || "");
  const name = display || number || "Unknown";
  return { name, number };
};
bindCallSurfaceControls_fn = function() {
  this.root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".callAnswerAudio")) {
      this.sdk.answer();
      return;
    }
    if (target.closest(".callReject") || target.closest(".callHangup")) {
      this.sdk.hangup();
      return;
    }
    if (target.closest(".callMute")) {
      this.sdk.mute();
      const mute = this.root.querySelector("#line-1-btn-Mute");
      const unmute = this.root.querySelector("#line-1-btn-Unmute");
      if (mute) mute.style.display = "none";
      if (unmute) unmute.style.display = "";
      return;
    }
    if (target.closest(".callUnmute")) {
      this.sdk.unmute();
      const mute = this.root.querySelector("#line-1-btn-Mute");
      const unmute = this.root.querySelector("#line-1-btn-Unmute");
      if (mute) mute.style.display = "";
      if (unmute) unmute.style.display = "none";
      return;
    }
    if (target.closest(".callHold")) {
      void this.sdk.hold?.().catch((err) => {
        this.renderer.setStatus(`Hold failed: ${String(err?.message || err)}`);
      });
      return;
    }
    if (target.closest(".callResume")) {
      void this.sdk.resume?.().catch((err) => {
        this.renderer.setStatus(`Resume failed: ${String(err?.message || err)}`);
      });
      return;
    }
    if (target.closest(".callTransfer")) {
      const panel = this.root.querySelector("#line-1-Transfer");
      if (panel && panel.style.display !== "none") {
        __privateMethod(this, _PhoneUI_instances, hideTransferPanel_fn).call(this);
      } else {
        __privateMethod(this, _PhoneUI_instances, showTransferPanel_fn).call(this);
      }
      return;
    }
    if (target.closest(".callCancelTransfer")) {
      __privateMethod(this, _PhoneUI_instances, hideTransferPanel_fn).call(this);
      return;
    }
    if (target.closest(".callBlindTransfer") || target.closest(".callAttendedTransfer")) {
      __privateMethod(this, _PhoneUI_instances, submitTransferFromPanel_fn).call(this);
      return;
    }
    if (target.closest(".callConference")) {
      const panel = this.root.querySelector("#line-1-Conference");
      if (panel && panel.style.display !== "none") {
        __privateMethod(this, _PhoneUI_instances, hideConferencePanel_fn).call(this);
      } else {
        __privateMethod(this, _PhoneUI_instances, showConferencePanel_fn).call(this);
      }
      return;
    }
    if (target.closest(".callCancelConference")) {
      __privateMethod(this, _PhoneUI_instances, hideConferencePanel_fn).call(this);
      return;
    }
    if (target.closest(".callConferenceDial")) {
      __privateMethod(this, _PhoneUI_instances, submitConferenceFromPanel_fn).call(this);
      return;
    }
    if (target.closest(".callDtmf")) {
      __privateMethod(this, _PhoneUI_instances, showDtmfPanel_fn).call(this);
      return;
    }
    if (target.closest(".callCloseOverlay") || target.closest(".callCloseDtmf")) {
      __privateMethod(this, _PhoneUI_instances, hideTransferPanel_fn).call(this);
      __privateMethod(this, _PhoneUI_instances, hideConferencePanel_fn).call(this);
      __privateMethod(this, _PhoneUI_instances, hideDtmfPanel_fn).call(this);
      return;
    }
    const digitBtn = target.closest(".callDtmfDigit");
    if (digitBtn) {
      const digit = digitBtn.getAttribute("data-dtmf-digit") || "";
      const input = this.root.querySelector("#line-1-dtmf-input");
      if (input) input.value = `${input.value || ""}${digit}`;
      if (digit && typeof this.sdk.sendDTMF === "function") this.sdk.sendDTMF(digit).catch(() => {
      });
      return;
    }
    if (target.closest("#line-1-dtmf-delete")) {
      const input = this.root.querySelector("#line-1-dtmf-input");
      if (input) input.value = String(input.value || "").slice(0, -1);
      return;
    }
    if (target.closest(".callDeviceSettings")) {
      const anchor = target.closest(".callDeviceSettings");
      if (this.profileMenu && this.profileMenu.getAttribute("data-role") === "incall-device-menu") {
        __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
      } else {
        __privateMethod(this, _PhoneUI_instances, openInCallDeviceMenu_fn).call(this, anchor);
      }
      return;
    }
    if (target.closest(".callPresentSrc")) {
      const anchor = target.closest(".callPresentSrc");
      if (this.profileMenu && this.profileMenu.getAttribute("data-role") === "present-source-menu") {
        __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
      } else {
        __privateMethod(this, _PhoneUI_instances, openPresentMenu_fn).call(this, anchor);
      }
      return;
    }
  });
};
isPanelVisible_fn = function(el) {
  if (!el) return false;
  if (el.style.display === "none") return false;
  const computed = window.getComputedStyle?.(el);
  return !computed || computed.display !== "none";
};
syncInCallOverlayState_fn = function() {
  const transferOpen = __privateMethod(this, _PhoneUI_instances, isPanelVisible_fn).call(this, this.root.querySelector("#line-1-Transfer"));
  const conferenceOpen = __privateMethod(this, _PhoneUI_instances, isPanelVisible_fn).call(this, this.root.querySelector("#line-1-Conference"));
  const dtmfOpen = __privateMethod(this, _PhoneUI_instances, isPanelVisible_fn).call(this, this.root.querySelector("#line-1-Dtmf"));
  const fullOverlay = transferOpen || conferenceOpen;
  const host = this.root.querySelector(".vphoneInCallPanel");
  const card = this.root.querySelector(".vphoneCallCardActive");
  if (host) {
    host.classList.toggle("isOverlayOpen", fullOverlay);
    host.classList.toggle("isDtmfOpen", dtmfOpen);
  }
  if (card) {
    card.classList.toggle("isOverlayOpen", fullOverlay);
    card.classList.toggle("isDtmfOpen", dtmfOpen);
  }
};
showTransferPanel_fn = function() {
  __privateMethod(this, _PhoneUI_instances, hideConferencePanel_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, hideDtmfPanel_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  const panel = this.root.querySelector("#line-1-Transfer");
  const transfer = this.root.querySelector("#line-1-btn-Transfer");
  if (panel) panel.style.display = "flex";
  if (transfer) {
    transfer.style.display = "";
    transfer.classList.add("toggleOn");
  }
  const cancel = this.root.querySelector("#line-1-btn-CancelTransfer");
  if (cancel) cancel.style.display = "none";
  __privateMethod(this, _PhoneUI_instances, syncInCallOverlayState_fn).call(this);
  this.root.querySelector("#line-1-txt-FindTransferBuddy")?.focus();
};
hideTransferPanel_fn = function() {
  const panel = this.root.querySelector("#line-1-Transfer");
  const transfer = this.root.querySelector("#line-1-btn-Transfer");
  const cancel = this.root.querySelector("#line-1-btn-CancelTransfer");
  if (panel) panel.style.display = "none";
  if (transfer) {
    transfer.style.display = "";
    transfer.classList.remove("toggleOn");
  }
  if (cancel) cancel.style.display = "none";
  __privateMethod(this, _PhoneUI_instances, syncInCallOverlayState_fn).call(this);
};
submitTransferFromPanel_fn = function() {
  const target = normalizeNumber(this.root.querySelector("#line-1-txt-FindTransferBuddy")?.value || "");
  if (!target) return;
  this.sdk.transfer?.(target);
  const status = this.root.querySelector("#line-1-transfer-status");
  if (status) {
    status.textContent = `Transfer requested to ${target}`;
    status.style.display = "";
  }
};
showConferencePanel_fn = function() {
  __privateMethod(this, _PhoneUI_instances, hideTransferPanel_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, hideDtmfPanel_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  const panel = this.root.querySelector("#line-1-Conference");
  const conference = this.root.querySelector("#line-1-btn-Conference");
  if (panel) panel.style.display = "flex";
  if (conference) {
    conference.style.display = "";
    conference.classList.add("toggleOn");
  }
  const cancel = this.root.querySelector("#line-1-btn-CancelConference");
  if (cancel) cancel.style.display = "none";
  __privateMethod(this, _PhoneUI_instances, syncInCallOverlayState_fn).call(this);
  this.root.querySelector("#line-1-txt-FindConferenceBuddy")?.focus();
};
hideConferencePanel_fn = function() {
  const panel = this.root.querySelector("#line-1-Conference");
  const conference = this.root.querySelector("#line-1-btn-Conference");
  const cancel = this.root.querySelector("#line-1-btn-CancelConference");
  if (panel) panel.style.display = "none";
  if (conference) {
    conference.style.display = "";
    conference.classList.remove("toggleOn");
  }
  if (cancel) cancel.style.display = "none";
  __privateMethod(this, _PhoneUI_instances, syncInCallOverlayState_fn).call(this);
};
submitConferenceFromPanel_fn = function() {
  const target = normalizeNumber(this.root.querySelector("#line-1-txt-FindConferenceBuddy")?.value || "");
  if (!target) return;
  this.sdk.conference?.(target);
  const status = this.root.querySelector("#line-1-conference-status");
  if (status) {
    status.textContent = `Conference requested with ${target}`;
    status.style.display = "";
  }
};
showDtmfPanel_fn = function() {
  __privateMethod(this, _PhoneUI_instances, hideTransferPanel_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, hideConferencePanel_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  const panel = this.root.querySelector("#line-1-Dtmf");
  if (panel) panel.style.display = "flex";
  __privateMethod(this, _PhoneUI_instances, syncInCallOverlayState_fn).call(this);
  this.root.querySelector("#line-1-dtmf-input")?.focus();
};
hideDtmfPanel_fn = function() {
  const panel = this.root.querySelector("#line-1-Dtmf");
  if (panel) panel.style.display = "none";
  __privateMethod(this, _PhoneUI_instances, syncInCallOverlayState_fn).call(this);
};
openInCallDeviceMenu_fn = async function(anchor) {
  const devices = await __privateMethod(this, _PhoneUI_instances, getDevices_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  const host = __privateMethod(this, _PhoneUI_instances, popupHost_fn).call(this);
  const menu = document.createElement("ul");
  menu.className = "ui-menu ui-widget ui-widget-content popupMenuList inCallDeviceMenu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("data-role", "incall-device-menu");
  const byKind = [
    ["audioinput", "fa fa-microphone", "Microphone"],
    ["audiooutput", "fa fa-volume-up", "Speaker"],
    ["videoinput", "fa fa-video-camera", "Camera"]
  ];
  menu.innerHTML = byKind.map(([kind, icon, label]) => {
    const rows = devices.filter((d) => d.kind === kind);
    if (rows.length === 0) return __privateMethod(this, _PhoneUI_instances, profileMenuItem_fn).call(this, `noop-${kind}`, null, label);
    return `<li class="ui-widget-header">${escapeHtml(label)}</li>` + rows.map((d) => __privateMethod(this, _PhoneUI_instances, profileMenuItem_fn).call(this, `device:${kind}:${d.deviceId}`, icon, d.label || d.deviceId)).join("");
  }).join('<li class="ui-menu-divider" role="separator"></li>');
  menu.addEventListener("click", (event) => {
    const item = event.target instanceof Element ? event.target.closest("[data-menu-action]") : null;
    if (!item) return;
    const action = item.getAttribute("data-menu-action") || "";
    if (!action.startsWith("device:")) return;
    const [, kind, deviceId] = action.split(":");
    this.sdk.switchDevice?.(kind, deviceId);
    __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
    this.renderer.setStatus(`Switched ${kind}`);
  });
  host.appendChild(menu);
  this.profileMenu = menu;
  const anchorRect = anchor?.getBoundingClientRect?.();
  const hostRect = host.getBoundingClientRect?.() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  const width = Math.max(200, menu.offsetWidth || 200);
  const height = menu.offsetHeight || 180;
  const leftBase = anchorRect ? anchorRect.right - hostRect.left - width : 10;
  const topBase = anchorRect ? anchorRect.top - hostRect.top - height - 4 : 10;
  menu.style.left = `${Math.max(10, Math.min(leftBase, Math.max(10, hostRect.width - width - 10)))}px`;
  menu.style.top = `${Math.max(10, Math.min(topBase, Math.max(10, hostRect.height - height - 10)))}px`;
  const outsideClick = (event) => {
    if (anchor && anchor.contains(event.target)) return;
    if (this.profileMenu && !this.profileMenu.contains(event.target)) __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  };
  const escapeKey = (event) => {
    if (event.key === "Escape") __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  };
  this.profileMenuCleanup = () => {
    document.removeEventListener("click", outsideClick, true);
    document.removeEventListener("keydown", escapeKey, true);
  };
  window.setTimeout(() => {
    document.addEventListener("click", outsideClick, true);
    document.addEventListener("keydown", escapeKey, true);
  }, 0);
};
openPresentMenu_fn = function(anchor) {
  __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  const host = __privateMethod(this, _PhoneUI_instances, popupHost_fn).call(this);
  const menu = document.createElement("ul");
  menu.className = "ui-menu ui-widget ui-widget-content popupMenuList presentSourceMenu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("data-role", "present-source-menu");
  menu.innerHTML = [
    __privateMethod(this, _PhoneUI_instances, profileMenuItem_fn).call(this, "present:camera", "fa fa-video-camera", "Camera"),
    __privateMethod(this, _PhoneUI_instances, profileMenuItem_fn).call(this, "present:canvas", "fa fa-pencil-square", "Scratchpad"),
    __privateMethod(this, _PhoneUI_instances, profileMenuItem_fn).call(this, "present:desktop", "fa fa-desktop", "Screen")
  ].join("");
  menu.addEventListener("click", (event) => {
    const item = event.target instanceof Element ? event.target.closest("[data-menu-action]") : null;
    if (!item) return;
    const action = item.getAttribute("data-menu-action") || "";
    if (!action.startsWith("present:")) return;
    const source = action.slice("present:".length);
    __privateMethod(this, _PhoneUI_instances, selectPresentSource_fn).call(this, source);
    __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  });
  host.appendChild(menu);
  this.profileMenu = menu;
  const anchorRect = anchor?.getBoundingClientRect?.();
  const hostRect = host.getBoundingClientRect?.() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  const width = Math.max(180, menu.offsetWidth || 180);
  const height = menu.offsetHeight || 120;
  const leftBase = anchorRect ? anchorRect.right - hostRect.left - width : 10;
  const topBase = anchorRect ? anchorRect.top - hostRect.top - height - 4 : 10;
  menu.style.left = `${Math.max(10, Math.min(leftBase, Math.max(10, hostRect.width - width - 10)))}px`;
  menu.style.top = `${Math.max(10, Math.min(topBase, Math.max(10, hostRect.height - height - 10)))}px`;
  const outsideClick = (event) => {
    if (anchor && anchor.contains(event.target)) return;
    if (this.profileMenu && !this.profileMenu.contains(event.target)) __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  };
  const escapeKey = (event) => {
    if (event.key === "Escape") __privateMethod(this, _PhoneUI_instances, closeProfileMenu_fn).call(this);
  };
  this.profileMenuCleanup = () => {
    document.removeEventListener("click", outsideClick, true);
    document.removeEventListener("keydown", escapeKey, true);
  };
  window.setTimeout(() => {
    document.addEventListener("click", outsideClick, true);
    document.addEventListener("keydown", escapeKey, true);
  }, 0);
};
selectPresentSource_fn = function(source) {
  const video = this.root.querySelector("#line-1-VideoCall");
  const audio = this.root.querySelector("#line-1-AudioCall");
  const scratchpad = this.root.querySelector("#line-1-scratchpad-container");
  const share = this.root.querySelector("#line-1-sharevideo");
  if (video) video.style.display = "";
  if (audio) audio.style.display = "none";
  if (scratchpad) scratchpad.style.display = source === "canvas" ? "" : "none";
  if (share) share.style.display = source === "desktop" ? "" : "none";
  this.renderer.setStatus(source === "camera" ? "Camera selected" : source === "canvas" ? "Scratchpad selected" : "Screen selected");
};
deleteDialDigit_fn = function() {
  const dialText = this.root.querySelector("#dialText");
  if (!dialText) return;
  const value = String(dialText.value || "");
  dialText.value = value.slice(0, Math.max(0, value.length - 1));
  __privateMethod(this, _PhoneUI_instances, syncDialDeleteKeyState_fn).call(this);
  dialText.focus();
};
bindTabButtons_fn = function() {
  const dialpad = this.root.querySelector("#tab-dialpad");
  const recents = this.root.querySelector("#tab-recents");
  const contacts = this.root.querySelector("#tab-contacts");
  if (dialpad) dialpad.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, switchTab_fn).call(this, "dialpad"));
  if (recents) recents.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, switchTab_fn).call(this, "recents"));
  if (contacts) contacts.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, switchTab_fn).call(this, "contacts"));
  __privateMethod(this, _PhoneUI_instances, restoreActiveTab_fn).call(this);
};
switchTab_fn = function(tabName) {
  const safeTab = tabName === "recents" || tabName === "contacts" ? tabName : "dialpad";
  this.activeTab = safeTab;
  __privateMethod(this, _PhoneUI_instances, setBottomTabsVisible_fn).call(this, true);
  const host = this.root.querySelector("#actionArea");
  if (host) host.classList.remove("configOverlayPane");
  this.renderer.showTab(safeTab);
  const regState = this.sdk.getRegistrationState?.() || {};
  this.renderer.setRegistrationState({
    ...regState,
    user: __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, regState.user)
  });
  __privateMethod(this, _PhoneUI_instances, renderTabContent_fn).call(this, safeTab);
  __privateMethod(this, _PhoneUI_instances, applyLanguageToStaticLabels_fn).call(this);
  try {
    localStorage.setItem("ActiveTab", safeTab);
  } catch {
  }
};
restoreActiveTab_fn = function() {
  let tab = "dialpad";
  try {
    const saved = localStorage.getItem("ActiveTab");
    if (saved === "recents" || saved === "contacts" || saved === "dialpad") tab = saved;
  } catch {
  }
  __privateMethod(this, _PhoneUI_instances, switchTab_fn).call(this, tab);
};
toggleDialpadSetting_fn = function(key) {
  if (!key || !(key in this.dialpadToggles)) return;
  this.dialpadToggles[key] = !this.dialpadToggles[key];
  const btn = this.root.querySelector(`#dialpad-toggle-${key}`);
  if (btn) {
    btn.classList.toggle("toggleOn", this.dialpadToggles[key]);
    btn.classList.toggle("toggleOff", !this.dialpadToggles[key]);
  }
  if (key === "dnd") {
    this.renderer.dndActive = !!this.dialpadToggles.dnd;
    const regState = this.sdk.getRegistrationState?.() || {};
    this.renderer.setRegistrationState({
      ...regState,
      user: __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, regState.user)
    });
    this.renderer.setStatus(this.dialpadToggles.dnd ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "doNotDisturb") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "online"));
    return;
  }
  this.renderer.setStatus(`${key.toUpperCase()} ${this.dialpadToggles[key] ? "On" : "Off"}`);
};
bindDialpadInputState_fn = function() {
  const dialText = this.root.querySelector("#dialText");
  if (!dialText) return;
  dialText.setAttribute("maxlength", String(__privateMethod(this, _PhoneUI_instances, maxDidLength_fn).call(this)));
  if (dialText.dataset.vphoneInputBound === "1") {
    dialText.value = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, dialText.value);
    __privateMethod(this, _PhoneUI_instances, syncDialDeleteKeyState_fn).call(this);
    return;
  }
  dialText.dataset.vphoneInputBound = "1";
  dialText.addEventListener("input", () => {
    dialText.value = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, dialText.value);
    __privateMethod(this, _PhoneUI_instances, syncDialDeleteKeyState_fn).call(this);
  });
  dialText.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void this.call({ video: !!event.ctrlKey && this.enableVideoCalling });
  });
  dialText.value = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, dialText.value);
  __privateMethod(this, _PhoneUI_instances, syncDialDeleteKeyState_fn).call(this);
};
bindDialpadDigits_fn = function() {
  const buttons = this.root.querySelectorAll("[data-dial-digit]");
  if (!buttons || buttons.length === 0) return;
  for (const btn of buttons) {
    if (btn.dataset.vphoneDigitBound === "1") continue;
    btn.dataset.vphoneDigitBound = "1";
    btn.addEventListener("click", () => {
      const digit = btn.getAttribute("data-dial-digit") || "";
      if (!digit) return;
      const dialText = this.root.querySelector("#dialText");
      if (!dialText) return;
      if (String(dialText.value || "").length >= __privateMethod(this, _PhoneUI_instances, maxDidLength_fn).call(this)) return;
      dialText.value = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, `${dialText.value || ""}${digit}`);
      if (this.callConnected && typeof this.sdk.sendDTMF === "function") {
        this.sdk.sendDTMF(digit).catch(() => {
        });
      }
      __privateMethod(this, _PhoneUI_instances, syncDialDeleteKeyState_fn).call(this);
      dialText.focus();
    });
  }
};
syncDialDeleteKeyState_fn = function() {
  const dialText = this.root.querySelector("#dialText");
  const deleteKey = this.root.querySelector("#dialDeleteKey");
  if (!dialText || !deleteKey) return;
  const hasDigits = String(dialText.value || "").length > 0;
  deleteKey.classList.toggle("hasDigits", hasDigits);
};
hideLoadingOverlay_fn = function() {
  const loading = this.root.querySelector(".loading");
  if (!loading) return;
  loading.style.display = "none";
};
bindSearchInputState_fn = function() {
  const search = this.root.querySelector("#txtFindBuddy");
  if (!search) return;
  search.addEventListener("input", () => {
    this.tabSearch[this.activeTab] = String(search.value || "");
    if (this.activeTab === "contacts" || this.activeTab === "recents") {
      __privateMethod(this, _PhoneUI_instances, renderTabContent_fn).call(this, this.activeTab);
    }
  });
};
renderTabContent_fn = function(tabName) {
  if (tabName === "dialpad") {
    __privateMethod(this, _PhoneUI_instances, renderDialpad_fn).call(this);
    return;
  }
  if (tabName === "contacts") {
    const search = this.root.querySelector("#txtFindBuddy");
    if (search) search.value = this.tabSearch.contacts || "";
    __privateMethod(this, _PhoneUI_instances, renderContacts_fn).call(this);
    return;
  }
  if (tabName === "recents") {
    const search = this.root.querySelector("#txtFindBuddy");
    if (search) search.value = this.tabSearch.recents || "";
    __privateMethod(this, _PhoneUI_instances, renderRecents_fn).call(this);
    return;
  }
};
renderDialpad_fn = function() {
  const host = this.root.querySelector("#actionArea");
  if (!host) return;
  host.classList.add("dialpadMode");
  host.classList.remove("mobilePaneEmpty");
  host.innerHTML = `
      <div class="dialScreenMobile">
        <div class="dialInputRow">
          <span class="dialInputSpacer" aria-hidden="true"></span>
          <input id="dialText" class="dialTextInput" type="tel" inputmode="tel" autocomplete="off" value="" data-role="number-input" placeholder="" maxlength="${__privateMethod(this, _PhoneUI_instances, maxDidLength_fn).call(this)}">
          <button type="button" id="dialDeleteKey" class="roundButtons dialDeleteBtn" aria-label="Backspace"><i class="fa fa-long-arrow-left"></i></button>
        </div>
        <table class="dialPadGrid" cellspacing="8" cellpadding="0">
          <tr>
            <td><button type="button" class="dialButtons" data-dial-digit="1"><div>1</div><span>&nbsp;</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="2"><div>2</div><span>ABC</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="3"><div>3</div><span>DEF</span></button></td>
          </tr>
          <tr>
            <td><button type="button" class="dialButtons" data-dial-digit="4"><div>4</div><span>GHI</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="5"><div>5</div><span>JKL</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="6"><div>6</div><span>MNO</span></button></td>
          </tr>
          <tr>
            <td><button type="button" class="dialButtons" data-dial-digit="7"><div>7</div><span>PQRS</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="8"><div>8</div><span>TUV</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="9"><div>9</div><span>WXYZ</span></button></td>
          </tr>
          <tr>
            <td><button type="button" class="dialButtons" data-dial-digit="*"><div>*</div><span>&nbsp;</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="0"><div>0</div><span>+</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="#"><div>#</div><span>&nbsp;</span></button></td>
          </tr>
        </table>
        <div class="dialActionsRow">
          <button type="button" id="dialAudio" class="dialButtons dialButtonsDial" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "audioCall"))}"><i class="fa fa-phone"></i></button>
          ${this.enableVideoCalling ? `<button type="button" id="dialVideo" class="dialButtons dialButtonsDial" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "videoCall"))}"><i class="fa fa-video-camera"></i></button>` : ""}
        </div>
        <div id="dialpad-setting-toggles" class="dialpadSettingToggles">
          <button id="dialpad-toggle-auto" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "autoAnswer"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.auto ? "toggleOn" : "toggleOff"}"><i class="fa fa-phone"></i></button>
          <button id="dialpad-toggle-dnd" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "doNotDisturb"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.dnd ? "toggleOn" : "toggleOff"}"><i class="fa fa-ban"></i></button>
          <button id="dialpad-toggle-cw" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "callWaiting"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.cw ? "toggleOn" : "toggleOff"}"><i class="fa fa-volume-control-phone"></i></button>
          ${this.enableRecordAllCalls ? `<button id="dialpad-toggle-rec" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "recordAllCalls"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.rec ? "toggleOn" : "toggleOff"}"><i class="fa fa-dot-circle-o"></i></button>` : ""}
        </div>
      </div>
    `;
  __privateMethod(this, _PhoneUI_instances, bindDialpadInputState_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, bindDialpadDigits_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, applyFeatureVisibility_fn).call(this);
};
maxDidLength_fn = function() {
  const raw = Number(this.config.MaxDidLength ?? __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "MaxDidLength", 24));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 24;
};
maxContactNameLength_fn = function() {
  const raw = Number(this.config.MaxContactNameLength ?? __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "MaxContactNameLength", 64));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 64;
};
clampDialValue_fn = function(value) {
  return String(value || "").replace(/[^\d*#+]/g, "").slice(0, __privateMethod(this, _PhoneUI_instances, maxDidLength_fn).call(this));
};
renderContacts_fn = function() {
  const host = this.root.querySelector("#myContacts");
  if (!host) return;
  this.contacts = __privateMethod(this, _PhoneUI_instances, loadContactsFromStorage_fn).call(this);
  const filter = String(this.tabSearch.contacts || "").trim().toLowerCase();
  const rows = this.contacts.filter((c) => !filter || c.name.toLowerCase().includes(filter) || c.number.includes(filter));
  if (rows.length === 0) {
    host.classList.add("mobilePaneEmpty");
    host.innerHTML = `<div class="mobileEmptyState">
        <div class="mobileEmptyIcon" aria-hidden="true"><i class="fa fa-address-book-o"></i></div>
        <p class="mobileEmptyTitle">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "noContacts"))}</p>
        <button type="button" class="mobileEmptyCta" data-action="add-contact">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "addContactCta"))}</button>
      </div>`;
    return;
  }
  host.classList.remove("mobilePaneEmpty");
  host.innerHTML = rows.map((c) => `<div id="contact-${escapeHtml(c.id)}" class="buddy contactCompact enterpriseContactItem" data-contact-id="${escapeHtml(c.id)}" data-dial-number="${escapeHtml(c.number)}">
        <div class="contactCompactTop">
          <div class="contactCompactName" style="user-select:text">${escapeHtml(c.name)}</div>
          <div class="contactCompactActions">
            <button type="button" class="roundButtons contactActionCall" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "callAction"))}"${c.number ? "" : " disabled"}><i class="fa fa-phone"></i></button>
            <button type="button" class="roundButtons contactMenuBtn" title="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "contactMenu"))}" aria-haspopup="menu" aria-expanded="false"><i class="fa fa-ellipsis-v"></i></button>
          </div>
        </div>
        <div class="contactCompactNumber" style="user-select:text">${escapeHtml(c.number)}</div>
        <div class="contactOverflowMenu" hidden role="menu">
          <button type="button" class="contactMenuItem contactActionEdit" role="menuitem"><i class="fa fa-pencil"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "edit"))}</span></button>
          <button type="button" class="contactMenuItem contactActionDelete" role="menuitem"><i class="fa fa-trash"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "delete"))}</span></button>
        </div>
      </div>`).join("");
};
recentGroupKey_fn = function(row) {
  const numberKey = normalizeNumber(row?.number || "");
  if (numberKey) return `n:${numberKey}`;
  return `name:${String(row?.name || "").trim().toLowerCase()}`;
};
groupRecents_fn = function(rows) {
  const groups = [];
  for (const row of rows) {
    const groupKey = __privateMethod(this, _PhoneUI_instances, recentGroupKey_fn).call(this, row);
    const prev = groups[groups.length - 1];
    if (prev && prev.groupKey === groupKey && prev.dayKey === row.dayKey) {
      prev.calls.push(row);
      prev.count += 1;
      prev.totalBillsec = (prev.totalBillsec || 0) + (Number(row.billsec) || 0);
      prev.durationLabel = prev.totalBillsec > 0 ? __privateMethod(this, _PhoneUI_instances, formatBillsec_fn).call(this, prev.totalBillsec) : row.billsecLabel || prev.durationLabel || "00:00";
      continue;
    }
    const billsec = Number(row.billsec) || 0;
    groups.push({
      ...row,
      groupKey,
      calls: [row],
      count: 1,
      totalBillsec: billsec,
      durationLabel: billsec > 0 ? __privateMethod(this, _PhoneUI_instances, formatBillsec_fn).call(this, billsec) : row.billsecLabel || "00:00",
      expanded: !!this.recentExpandedById[row.id]
    });
  }
  return groups;
};
isNumberInContacts_fn = function(number) {
  const key = normalizeNumber(number);
  if (!key) return false;
  return __privateMethod(this, _PhoneUI_instances, buildContactLookup_fn).call(this).has(key);
};
copyTextToClipboard_fn = async function(text) {
  const value = normalizeText(text);
  if (!value) return false;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
  }
  try {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    input.remove();
    return !!ok;
  } catch {
    return false;
  }
};
showToast_fn = function(message, { tone = "success", durationMs = 1800 } = {}) {
  const text = normalizeText(message);
  if (!text) return;
  const phone = this.root.querySelector("#Phone") || this.root;
  if (!phone) return;
  let host = phone.querySelector("#vphoneToastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "vphoneToastHost";
    host.className = "vphoneToastHost";
    phone.appendChild(host);
  }
  host.querySelectorAll(".vphoneToast").forEach((el) => el.remove());
  const toast = document.createElement("div");
  toast.className = `vphoneToast ${tone === "error" ? "isError" : "isSuccess"}`;
  toast.setAttribute("role", "status");
  toast.textContent = text;
  host.appendChild(toast);
  window.requestAnimationFrame(() => toast.classList.add("isVisible"));
  window.setTimeout(() => {
    toast.classList.remove("isVisible");
    window.setTimeout(() => toast.remove(), 220);
  }, Math.max(800, Number(durationMs) || 1800));
};
/** Right-side duration/status for a single CDR (mobile dialer style). */
recentCallSideLabel_fn = function(call) {
  if (call?.billsecLabel) {
    return { text: call.billsecLabel, tone: "" };
  }
  if (call?.statusClass === "callMissed") {
    return {
      text: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "you_missed_a_call") || "You missed a call",
      tone: "isMissed"
    };
  }
  if (call?.statusClass === "callOut" && call?.statusText) {
    return { text: call.statusText, tone: "isStatus" };
  }
  return { text: "00:00", tone: "" };
};
renderRecents_fn = function() {
  const host = this.root.querySelector("#actionArea");
  if (!host) return;
  this.recents = __privateMethod(this, _PhoneUI_instances, loadRecentsFromStorage_fn).call(this);
  const filter = String(this.tabSearch.recents || "").trim().toLowerCase();
  const filtered = this.recents.filter((r) => !filter || r.name.toLowerCase().includes(filter) || r.number.includes(filter));
  const rows = __privateMethod(this, _PhoneUI_instances, groupRecents_fn).call(this, filtered);
  this.recentGroups = rows;
  if (rows.length === 0) {
    host.classList.add("mobilePaneEmpty");
    host.classList.remove("dialpadMode");
    host.innerHTML = `<div class="mobileEmptyState">
        <div class="mobileEmptyIcon" aria-hidden="true"><i class="fa fa-history"></i></div>
        <p class="mobileEmptyTitle">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "noRecentCalls"))}</p>
      </div>`;
    return;
  }
  host.classList.remove("mobilePaneEmpty");
  host.classList.remove("dialpadMode");
  host.innerHTML = `<div class="recentFlatList">${rows.map((r, index) => {
    const countLabel = r.count > 1 ? ` <span class="recentCallCount">(${r.count})</span>` : "";
    const showAddContact = !!r.number && !__privateMethod(this, _PhoneUI_instances, isNumberInContacts_fn).call(this, r.number);
    const summarySide = __privateMethod(this, _PhoneUI_instances, recentCallSideLabel_fn).call(this, r.calls?.[0] || r);
    const timeline = r.calls.map((call) => {
      const side = __privateMethod(this, _PhoneUI_instances, recentCallSideLabel_fn).call(this, call);
      return `
          <div class="recentTimelineItem">
            <span class="recentTimelineIcon recentDirectionIcon ${escapeHtml(call.statusClass)}" title="${escapeHtml(call.statusText)}">${recentDirectionSvg(call.statusClass)}</span>
            <span class="recentTimelineTime">${escapeHtml(call.timeLabel)}</span>
            <span class="recentTimelineDuration ${escapeHtml(side.tone)}">${escapeHtml(side.text)}</span>
          </div>`;
    }).join("");
    return `${index === 0 || rows[index - 1]?.dayKey !== r.dayKey ? `<div class="recentDayDivider">${escapeHtml(r.dayLabel)}</div>` : ""}<div class="recentCallItem enterpriseRecentItem${r.expanded ? " expanded" : ""}" data-recent-id="${escapeHtml(r.id)}" data-dial-number="${escapeHtml(r.number || "")}">
        <div class="recentCallSummary">
          <div class="recentCallAvatar recentDirectionAvatar ${escapeHtml(r.statusClass)}" title="${escapeHtml(r.statusText)}">${recentDirectionSvg(r.statusClass)}</div>
          <div class="recentCallInfo contactCompactMain">
            <div class="recentCallName contactCompactName" style="user-select:text">${escapeHtml(r.name)}${countLabel}</div>
          </div>
          <div class="recentSummaryDuration ${escapeHtml(summarySide.tone)}">${escapeHtml(summarySide.text)}</div>
        </div>
        <div class="recentCallExpanded" style="display:${r.expanded ? "block" : "none"}">
          ${r.number ? `<div class="recentExpandedNumber" style="user-select:text">${escapeHtml(r.number)}</div>` : ""}
          <div class="recentExpandedActions">
            <button type="button" class="recentTextAction recentActionCall"${r.number ? "" : " disabled"}><i class="fa fa-phone"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "callAction"))}</span></button>
            ${showAddContact ? `<button type="button" class="recentTextAction recentActionAdd"><i class="fa fa-user-plus"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "addContactAction"))}</span></button>` : ""}
            <button type="button" class="recentTextAction recentActionCopy"${r.number ? "" : " disabled"}><i class="fa fa-clone"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "copyNumber"))}</span></button>
            <button type="button" class="recentTextAction recentActionDelete"><i class="fa fa-trash"></i><span>${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "delete"))}</span></button>
          </div>
          <div class="recentTimeline">${timeline}</div>
        </div>
      </div>`;
  }).join("")}</div>`;
};
bindRecentExpandedActions_fn = function() {
  const host = this.root.querySelector("#actionArea");
  if (!host) return;
  host.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const row = target.closest(".enterpriseRecentItem");
    if (!row) return;
    const id = row.getAttribute("data-recent-id") || "";
    const item = (this.recentGroups || []).find((r) => r.id === id) || this.recents.find((r) => r.id === id);
    if (!item) return;
    if (target.closest(".recentActionDelete")) {
      event.stopPropagation();
      const groupCalls = Array.isArray(item.calls) && item.calls.length ? item.calls : [item];
      __privateMethod(this, _PhoneUI_instances, confirmInPanel_fn).call(this, {
        message: groupCalls.length > 1 ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirmDeleteRecentGroup") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirmDeleteRecent"),
        confirmText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "delete"),
        onConfirm: () => {
          __privateMethod(this, _PhoneUI_instances, deleteRecentGroup_fn).call(this, groupCalls);
          delete this.recentExpandedById[id];
          __privateMethod(this, _PhoneUI_instances, renderRecents_fn).call(this);
          this.renderer.setStatus(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "recentDeleted"));
        }
      });
      return;
    }
    if (target.closest(".recentActionAdd")) {
      event.stopPropagation();
      __privateMethod(this, _PhoneUI_instances, showAddContactPanel_fn).call(this, item.number, item.name);
      return;
    }
    if (target.closest(".recentActionCopy")) {
      event.stopPropagation();
      if (!item.number) return;
      const copyBtn = target.closest(".recentActionCopy");
      void __privateMethod(this, _PhoneUI_instances, copyTextToClipboard_fn).call(this, item.number).then((ok) => {
        if (!ok) {
          __privateMethod(this, _PhoneUI_instances, showToast_fn).call(this, __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "copyNumber"), { tone: "error" });
          return;
        }
        __privateMethod(this, _PhoneUI_instances, showToast_fn).call(this, __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "numberCopied"));
        if (copyBtn instanceof HTMLElement) {
          const label = copyBtn.querySelector("span");
          const prev = label?.textContent || __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "copyNumber");
          if (label) label.textContent = __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "numberCopied");
          copyBtn.classList.add("isCopied");
          window.setTimeout(() => {
            if (label) label.textContent = prev;
            copyBtn.classList.remove("isCopied");
          }, 1600);
        }
      });
      return;
    }
    if (target.closest(".recentActionCall")) {
      event.stopPropagation();
      if (!item.number) return;
      __privateMethod(this, _PhoneUI_instances, switchTab_fn).call(this, "dialpad");
      const dial = this.root.querySelector("#dialText");
      if (dial) dial.value = item.number;
      void this.call({ video: false });
      return;
    }
    const next = !item.expanded;
    this.recentExpandedById = {};
    item.expanded = next;
    if (next) this.recentExpandedById[id] = true;
    __privateMethod(this, _PhoneUI_instances, renderRecents_fn).call(this);
  });
};
closeAllContactMenus_fn = function(exceptRow = null) {
  const host = this.root.querySelector("#myContacts");
  if (!host) return;
  host.querySelectorAll(".enterpriseContactItem").forEach((item) => {
    if (exceptRow && item === exceptRow) return;
    item.classList.remove("menuOpen");
    const menu = item.querySelector(".contactOverflowMenu");
    if (menu) menu.hidden = true;
    const btn = item.querySelector(".contactMenuBtn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
};
bindContactExpandedActions_fn = function() {
  const host = this.root.querySelector("#myContacts");
  if (!host) return;
  if (host.dataset.vphoneContactsBound === "1") return;
  host.dataset.vphoneContactsBound = "1";
  host.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const row = target.closest(".enterpriseContactItem");
    if (!row) {
      __privateMethod(this, _PhoneUI_instances, closeAllContactMenus_fn).call(this);
      return;
    }
    const id = row.getAttribute("data-contact-id") || "";
    const number = row.getAttribute("data-dial-number") || "";
    if (target.closest(".contactActionCall")) {
      event.stopPropagation();
      __privateMethod(this, _PhoneUI_instances, closeAllContactMenus_fn).call(this);
      if (!number) return;
      __privateMethod(this, _PhoneUI_instances, switchTab_fn).call(this, "dialpad");
      const dial = this.root.querySelector("#dialText");
      if (dial) dial.value = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, number);
      void this.call({ video: false });
      return;
    }
    if (target.closest(".contactMenuBtn")) {
      event.stopPropagation();
      const menu = row.querySelector(".contactOverflowMenu");
      const btn = row.querySelector(".contactMenuBtn");
      const willOpen = !!(menu && menu.hidden);
      __privateMethod(this, _PhoneUI_instances, closeAllContactMenus_fn).call(this, willOpen ? row : null);
      if (!menu || !btn) return;
      menu.hidden = !willOpen;
      row.classList.toggle("menuOpen", willOpen);
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      return;
    }
    if (target.closest(".contactActionEdit")) {
      event.stopPropagation();
      __privateMethod(this, _PhoneUI_instances, closeAllContactMenus_fn).call(this);
      const item = this.contacts.find((contact) => contact.id === id);
      __privateMethod(this, _PhoneUI_instances, showAddContactPanel_fn).call(this, item?.number || number, item?.name || "", { contactId: id });
      return;
    }
    if (target.closest(".contactActionDelete")) {
      event.stopPropagation();
      __privateMethod(this, _PhoneUI_instances, closeAllContactMenus_fn).call(this);
      __privateMethod(this, _PhoneUI_instances, confirmInPanel_fn).call(this, {
        message: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirmDeleteContact"),
        confirmText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "delete"),
        onConfirm: () => {
          __privateMethod(this, _PhoneUI_instances, deleteContactById_fn).call(this, id);
          this.contacts = __privateMethod(this, _PhoneUI_instances, loadContactsFromStorage_fn).call(this);
          __privateMethod(this, _PhoneUI_instances, renderContacts_fn).call(this);
        }
      });
      return;
    }
    __privateMethod(this, _PhoneUI_instances, closeAllContactMenus_fn).call(this);
  });
  if (!this._contactMenuDocBound) {
    this._contactMenuDocBound = true;
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("#myContacts")) return;
      __privateMethod(this, _PhoneUI_instances, closeAllContactMenus_fn).call(this);
    });
  }
};
deleteContactById_fn = function(contactId) {
  if (!contactId) return;
  const collection = __privateMethod(this, _PhoneUI_instances, loadBuddyCollection_fn).call(this);
  collection.DataCollection = collection.DataCollection.filter((item) => normalizeText(item.cID || item.uID || item.gID) !== contactId);
  __privateMethod(this, _PhoneUI_instances, saveBuddyCollection_fn).call(this, collection);
};
handleClearTab_fn = function(tabName) {
  const tab = tabName || this.activeTab;
  if (tab !== "recents" && tab !== "contacts") {
    this.renderer.setStatus("Clear tab");
    return;
  }
  __privateMethod(this, _PhoneUI_instances, confirmInPanel_fn).call(this, {
    message: tab === "recents" ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirmClearRecents") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "confirmClearContacts"),
    confirmText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "delete"),
    onConfirm: () => {
      if (tab === "recents") {
        __privateMethod(this, _PhoneUI_instances, clearAllRecents_fn).call(this);
        this.recents = [];
        __privateMethod(this, _PhoneUI_instances, renderRecents_fn).call(this);
        this.renderer.setStatus(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "recentsCleared"));
        return;
      }
      __privateMethod(this, _PhoneUI_instances, clearAllContacts_fn).call(this);
      this.contacts = [];
      __privateMethod(this, _PhoneUI_instances, renderContacts_fn).call(this);
      this.renderer.setStatus(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "contactsCleared"));
    }
  });
};
applySavedAudioPreferences_fn = function() {
  const noise = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "NoiseSuppression", "1") !== "0";
  const echo = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "EchoCancellation", "1") !== "0";
  const agc = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "AutoGainControl", "1") !== "0";
  try {
    this.sdk?.core?.media?.setAudioProcessing?.({
      noiseSuppression: noise,
      echoCancellation: echo,
      autoGainControl: agc
    });
  } catch {
  }
  const micId = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "AudioSrcId", "");
  const spkId = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "AudioOutputId", "");
  if (micId) {
    try {
      this.sdk?.core?.media && (this.sdk.core.media.preferredDeviceIds.audioinput = micId);
    } catch {
    }
  }
  if (spkId) {
    try {
      this.sdk?.core?.media && (this.sdk.core.media.preferredDeviceIds.audiooutput = spkId);
    } catch {
    }
  }
};
resolveRingtoneUrl_fn = function() {
  const media = this.config.MediaConfig || {};
  if (media.ringtone) return String(media.ringtone);
  if (typeof window !== "undefined" && window.__VPhoneRingtoneUrl) {
    return String(window.__VPhoneRingtoneUrl);
  }
  try {
    if (typeof document !== "undefined") {
      return new URL("./media/Ringtone.mp3", document.baseURI || window.location.href).href;
    }
  } catch {
  }
  return "";
};
startFallbackRinger_fn = function() {
  __privateMethod(this, _PhoneUI_instances, stopFallbackRinger_fn).call(this);
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  let ctx;
  try {
    ctx = new Ctx();
  } catch {
    return;
  }
  const beep = () => {
    if (!this._ringtoneFallbackTimer) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
    }
  };
  beep();
  this._ringtoneFallbackTimer = window.setInterval(beep, 900);
  this._ringtoneFallbackCtx = ctx;
};
stopFallbackRinger_fn = function() {
  if (this._ringtoneFallbackTimer) {
    clearInterval(this._ringtoneFallbackTimer);
    this._ringtoneFallbackTimer = null;
  }
  if (this._ringtoneFallbackCtx) {
    try {
      this._ringtoneFallbackCtx.close();
    } catch {
    }
    this._ringtoneFallbackCtx = null;
  }
};
startRingtone_fn = function() {
  __privateMethod(this, _PhoneUI_instances, stopRingtone_fn).call(this);
  if (this.dialpadToggles?.dnd) return;
  const url = __privateMethod(this, _PhoneUI_instances, resolveRingtoneUrl_fn).call(this);
  if (!url || typeof Audio === "undefined") {
    __privateMethod(this, _PhoneUI_instances, startFallbackRinger_fn).call(this);
    return;
  }
  try {
    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = "auto";
    const ringId = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, "RingOutputId", "");
    if (ringId && typeof audio.setSinkId === "function") {
      audio.setSinkId(ringId).catch(() => {
      });
    }
    this._ringtoneAudio = audio;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        __privateMethod(this, _PhoneUI_instances, stopRingtoneAudioElement_fn).call(this);
        __privateMethod(this, _PhoneUI_instances, startFallbackRinger_fn).call(this);
      });
    }
  } catch {
    __privateMethod(this, _PhoneUI_instances, startFallbackRinger_fn).call(this);
  }
};
stopRingtoneAudioElement_fn = function() {
  if (!this._ringtoneAudio) return;
  try {
    this._ringtoneAudio.pause();
    this._ringtoneAudio.src = "";
  } catch {
  }
  this._ringtoneAudio = null;
};
stopRingtone_fn = function() {
  __privateMethod(this, _PhoneUI_instances, stopRingtoneAudioElement_fn).call(this);
  __privateMethod(this, _PhoneUI_instances, stopFallbackRinger_fn).call(this);
};
getDbItem_fn = function(itemIndex, defaultValue) {
  if (!this.localDB) return defaultValue;
  const value = this.localDB.getItem(itemIndex);
  return value === null ? defaultValue : value;
};
normalizeLanguage_fn = function(value) {
  const selected = normalizeText(value || "vi").toLowerCase();
  if (selected === "en" || selected === "english") return "en";
  return "vi";
};
loadLanguagePack_fn = async function(language) {
  const lang = __privateMethod(this, _PhoneUI_instances, normalizeLanguage_fn).call(this, language);
  if (this.loadedLanguage === lang && this.langPack) return this.langPack;
  const embeddedPacks = globalThis.__VPhoneLangPacks || globalThis.__VphoneLangPacks || null;
  const embedded = embeddedPacks && (embeddedPacks[lang] || embeddedPacks[String(lang || "").toLowerCase()]);
  if (embedded && typeof embedded === "object") {
    this.langPack = embedded;
    this.loadedLanguage = lang;
    return this.langPack;
  }
  try {
    const base = typeof import.meta !== "undefined" && import.meta && import.meta.url;
    if (typeof base !== "string" || !/^(https?:|file:|blob:|chrome-extension:|app:)/i.test(base)) {
      throw new Error("No module base URL");
    }
    const response = await fetch(new URL(`../assets/lang/${encodeURIComponent(lang)}.json`, base));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    this.langPack = await response.json();
    this.loadedLanguage = lang;
  } catch {
    this.langPack = {};
    this.loadedLanguage = lang;
  }
  return this.langPack;
};
t_fn = function(key) {
  const legacyKey = LEGACY_LANG_KEYS[key] || key;
  const fromJson = this.langPack && this.langPack[legacyKey];
  if (fromJson !== void 0 && fromJson !== null && String(fromJson) !== "") {
    const value = String(fromJson);
    if (key === "fullName" || key === "contactNumber1") return value.replace(/:\s*$/, "");
    return value;
  }
  const fallbackLang = this.language === "vi" ? "vi" : "en";
  return FALLBACK_TEXT[fallbackLang]?.[key] || FALLBACK_TEXT.en[key] || key;
};
applyLanguageToStaticLabels_fn = function() {
  const setTitle = (selector, key) => {
    const el = this.root.querySelector(selector);
    if (el) el.setAttribute("title", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, key));
  };
  const setDataLabel = (selector, key) => {
    const el = this.root.querySelector(selector);
    if (el) el.setAttribute("data-label", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, key));
  };
  this.renderer.statusOnlineLabel = __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "onlineShort");
  this.renderer.statusOfflineLabel = __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "offlineShort");
  this.renderer.statusDndLabel = __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "doNotDisturb");
  this.renderer.dndActive = !!this.dialpadToggles.dnd;
  setDataLabel("#tab-dialpad", "dialpad");
  setDataLabel("#tab-recents", "recents");
  setDataLabel("#tab-contacts", "contacts");
  setTitle("#dialAudio", "audioCall");
  setTitle("#dialVideo", "videoCall");
  setTitle("#dialpad-toggle-auto", "autoAnswer");
  setTitle("#dialpad-toggle-dnd", "doNotDisturb");
  setTitle("#dialpad-toggle-cw", "callWaiting");
  setTitle("#dialpad-toggle-rec", "recordAllCalls");
  const search = this.root.querySelector("#txtFindBuddy");
  if (search) search.setAttribute("placeholder", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "searchPlaceholder"));
  const settings = this.root.querySelector("#SettingsMenu");
  if (settings) settings.setAttribute("title", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "settings"));
  this.root.querySelectorAll("[data-action='more']").forEach((el) => el.setAttribute("title", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "more")));
  this.root.querySelectorAll("[data-action='reg']").forEach((el) => el.setAttribute("title", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "registration")));
  this.root.querySelectorAll("[data-action='clear-tab']").forEach((el) => el.setAttribute("title", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "delete")));
  this.root.querySelectorAll("[data-action='add-contact']").forEach((el) => el.setAttribute("title", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "add")));
  this.root.querySelectorAll("[data-action='focus-search']").forEach((el) => el.setAttribute("title", __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "searchPlaceholder")));
};
applyFeatureVisibility_fn = function() {
  const freeDial = this.root.querySelector("#BtnFreeDial");
  if (freeDial) {
    freeDial.style.display = this.enableFreeDial ? "" : "none";
    freeDial.disabled = !this.enableFreeDial;
  }
  const settingsBtn = this.root.querySelector("#SettingsMenu");
  if (settingsBtn) {
    if (this.settingsButtonVisible) {
      settingsBtn.style.removeProperty("display");
      settingsBtn.disabled = false;
    } else {
      settingsBtn.style.setProperty("display", "none", "important");
      settingsBtn.disabled = true;
    }
  }
  this.root.querySelectorAll('[data-action="more"]').forEach((el) => {
    if (this.settingsButtonVisible) {
      el.style.removeProperty("display");
      el.disabled = false;
    } else {
      el.style.setProperty("display", "none", "important");
      el.disabled = true;
    }
  });
};
registrationDisplayUser_fn = function(preferred) {
  const candidates = [
    this.config.Username,
    this.sdk?.getRegistrationState?.()?.user,
    preferred,
    this.profileUserID
  ];
  for (const value of candidates) {
    const text = String(value || "").trim();
    if (!text || text === "default") continue;
    return text;
  }
  return "";
};
getBoolConfig_fn = function(itemIndex, defaultValue) {
  if (this.config[itemIndex] !== void 0) {
    const configured = this.config[itemIndex];
    return configured === true || configured === 1 || configured === "1" || configured === "true";
  }
  const stored = __privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, itemIndex, defaultValue ? "1" : "0");
  return stored === true || stored === 1 || stored === "1" || stored === "true";
};
buddyStorageKey_fn = function() {
  return `${this.profileUserID}-Buddies`;
};
loadBuddyCollection_fn = function() {
  const json = safeJsonParse(__privateMethod(this, _PhoneUI_instances, getDbItem_fn).call(this, __privateMethod(this, _PhoneUI_instances, buddyStorageKey_fn).call(this), ""), null);
  if (json && Array.isArray(json.DataCollection)) return json;
  return { TotalRows: 0, DataCollection: [] };
};
saveBuddyCollection_fn = function(collection) {
  if (!this.localDB) return;
  const next = collection && Array.isArray(collection.DataCollection) ? { ...collection, TotalRows: collection.DataCollection.length } : { TotalRows: 0, DataCollection: [] };
  this.localDB.setItem(__privateMethod(this, _PhoneUI_instances, buddyStorageKey_fn).call(this), JSON.stringify(next));
};
loadContactsFromStorage_fn = function() {
  const json = __privateMethod(this, _PhoneUI_instances, loadBuddyCollection_fn).call(this);
  const rows = [];
  for (const item of json.DataCollection) {
    if (!item || item.Type !== "contact") continue;
    const id = normalizeText(item.cID || item.uID || item.gID || `c${Date.now()}`);
    const number = normalizeText(item.ContactNumber1 || item.MobileNumber || item.ContactNumber2 || item.ExtensionNumber || "");
    const name = normalizeText(item.DisplayName || number || "Unknown");
    rows.push({ id, name, number });
  }
  return rows;
};
buildContactLookup_fn = function() {
  const lookup = /* @__PURE__ */ new Map();
  for (const c of this.contacts) {
    const key = normalizeNumber(c.number);
    if (!key) continue;
    lookup.set(key, c.name);
  }
  return lookup;
};
loadRecentsFromStorage_fn = function() {
  if (!this.localDB) return [];
  this.contacts = __privateMethod(this, _PhoneUI_instances, loadContactsFromStorage_fn).call(this);
  const contactLookup = __privateMethod(this, _PhoneUI_instances, buildContactLookup_fn).call(this);
  const rows = [];
  for (let i = 0; i < this.localDB.length; i += 1) {
    const storageKey = this.localDB.key(i);
    if (!storageKey || !storageKey.endsWith("-stream")) continue;
    const identity = storageKey.slice(0, -7);
    const stream = safeJsonParse(this.localDB.getItem(storageKey), null);
    if (!stream || !Array.isArray(stream.DataCollection)) continue;
    for (const item of stream.DataCollection) {
      if (!item || item.ItemType !== "CDR") continue;
      const isOutbound = item.SrcUserId === this.profileUserID || item.CallDirection === "outbound";
      const number = normalizeText(isOutbound ? item.DstDid || item.Dst || "" : item.SrcDid || item.Src || "");
      const callerIdName = normalizeText(isOutbound ? item.Dst || "" : item.Src || "");
      const contactName = contactLookup.get(normalizeNumber(number)) || "";
      const display = buildCallerDisplay(number, contactName, callerIdName);
      const cdrId = normalizeText(item.CdrId || "");
      if (!cdrId) continue;
      const id = `${identity}:${cdrId}`;
      const recentStatus = __privateMethod(this, _PhoneUI_instances, getRecentCallStatus_fn).call(this, item);
      const billsec = Number(item.Billsec || item.billsec || 0) || 0;
      rows.push({
        id,
        identity,
        cdrId,
        name: display.primary,
        number: display.secondary || display.number || "",
        statusClass: recentStatus.statusClass,
        statusText: recentStatus.statusText,
        timeLabel: __privateMethod(this, _PhoneUI_instances, formatRecentClock_fn).call(this, item.ItemDate),
        dayKey: __privateMethod(this, _PhoneUI_instances, formatRecentDayKey_fn).call(this, item.ItemDate),
        dayLabel: __privateMethod(this, _PhoneUI_instances, formatRecentDay_fn).call(this, item.ItemDate),
        billsec,
        billsecLabel: billsec > 0 ? __privateMethod(this, _PhoneUI_instances, formatBillsec_fn).call(this, billsec) : "",
        timeStamp: __privateMethod(this, _PhoneUI_instances, toEpoch_fn).call(this, item.ItemDate),
        expanded: !!this.recentExpandedById[id]
      });
    }
  }
  rows.sort((a, b) => (a.timeStamp || 0) > (b.timeStamp || 0) ? -1 : 1);
  return rows;
};
getRecentCallStatus_fn = function(item) {
  const isOutbound = item.SrcUserId === this.profileUserID || item.CallDirection === "outbound";
  const billsec = Number(item.Billsec || item.billsec || 0) || 0;
  const reasonCode = Number(item.ReasonCode || item.reasonCode || 0) || 0;
  const reasonText = String(item.ReasonText || item.reasonText || "").toLowerCase();
  const terminate = String(item.Terminate || item.terminate || "");
  if (billsec > 0) {
    return {
      statusClass: isOutbound ? "callOut" : "callIn",
      statusText: isOutbound ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "outgoing") || "Outgoing" : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "answered") || "Answered"
    };
  }
  if (reasonCode === 486 || reasonText.indexOf("busy") > -1) {
    return {
      statusClass: isOutbound ? "callOut" : "callMissed",
      statusText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "call_busy") || "Busy"
    };
  }
  if (isOutbound) {
    if (terminate === "us" || reasonCode === 487 || reasonText.indexOf("cancel") > -1) {
      return {
        statusClass: "callOut",
        statusText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "call_cancelled") || "Call Cancelled"
      };
    }
    if (reasonCode === 486 || reasonCode === 603 || reasonText.indexOf("reject") > -1 || reasonText.indexOf("decline") > -1) {
      return {
        statusClass: "callOut",
        statusText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "call_rejected") || "Call Rejected"
      };
    }
    return {
      statusClass: "callOut",
      statusText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "call_noanswer") || "No Answer"
    };
  }
  if (terminate === "them" && reasonCode === 0) {
    return {
      statusClass: "callMissed",
      statusText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "you_missed_a_call") || "You missed a call"
    };
  }
  return {
    statusClass: "callMissed",
    statusText: __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "you_missed_a_call") || "You missed a call"
  };
};
parseRecentDate_fn = function(itemDate) {
  const text = normalizeText(itemDate);
  if (!text) return null;
  const direct = new Date(text);
  if (!Number.isNaN(direct.getTime())) return direct;
  const cleaned = text.replace(/\s+UTC$/i, "").trim();
  const isoLike = cleaned.includes("T") ? cleaned : cleaned.replace(" ", "T");
  const withZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(isoLike) ? isoLike : `${isoLike}Z`;
  const parsed = new Date(withZone);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
};
formatRecentClock_fn = function(itemDate) {
  const parsed = __privateMethod(this, _PhoneUI_instances, parseRecentDate_fn).call(this, itemDate);
  if (!parsed) return "";
  const locale = this.language === "vi" ? "vi-VN" : void 0;
  return parsed.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
};
formatRecentDay_fn = function(itemDate) {
  const parsed = __privateMethod(this, _PhoneUI_instances, parseRecentDate_fn).call(this, itemDate);
  if (!parsed) return "";
  const today = /* @__PURE__ */ new Date();
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOf(today) - startOf(parsed)) / 864e5);
  if (dayDiff === 0) return __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "today");
  if (dayDiff === 1) return __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "yesterday");
  const locale = this.language === "vi" ? "vi-VN" : void 0;
  return parsed.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
};
formatRecentDayKey_fn = function(itemDate) {
  const parsed = __privateMethod(this, _PhoneUI_instances, parseRecentDate_fn).call(this, itemDate);
  if (!parsed) return normalizeText(itemDate) || "";
  return `${parsed.getFullYear()}-${parsed.getMonth() + 1}-${parsed.getDate()}`;
};
formatBillsec_fn = function(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const remain = total % 60;
  const hh2 = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(remain).padStart(2, "0");
  if (total >= 3600) return `${hh2}:${mm}:${ss}`;
  return `${mm}:${ss}`;
};
toEpoch_fn = function(itemDate) {
  const parsed = __privateMethod(this, _PhoneUI_instances, parseRecentDate_fn).call(this, itemDate);
  return parsed ? parsed.getTime() : 0;
};
saveRecentFromCurrentCall_fn = function() {
  if (!this.localDB || !this.currentCallLog) return;
  const log = this.currentCallLog;
  const endedAt = /* @__PURE__ */ new Date();
  const startedAt = log.startedAt instanceof Date ? log.startedAt : endedAt;
  const answeredAt = log.answeredAt instanceof Date ? log.answeredAt : null;
  const billsec = answeredAt ? Math.max(1, Math.round((endedAt.getTime() - answeredAt.getTime()) / 1e3)) : 0;
  const storageKey = `${this.profileUserID || "default"}-stream`;
  const stream = safeJsonParse(this.localDB.getItem(storageKey), null) || { TotalRows: 0, DataCollection: [] };
  if (!Array.isArray(stream.DataCollection)) stream.DataCollection = [];
  const isOutbound = log.direction === "outgoing";
  const cdrId = `cdr-${startedAt.getTime()}-${Math.random().toString(16).slice(2)}`;
  const itemDate = startedAt.toISOString();
  stream.DataCollection.unshift({
    ItemType: "CDR",
    CdrId: cdrId,
    ItemDate: itemDate,
    SrcUserId: isOutbound ? this.profileUserID : normalizeText(log.number),
    DstUserId: isOutbound ? normalizeText(log.number) : this.profileUserID,
    Src: isOutbound ? this.profileUserID : normalizeText(log.name || log.number),
    SrcDid: isOutbound ? this.profileUserID : normalizeText(log.number),
    Dst: isOutbound ? normalizeText(log.name || log.number) : this.profileUserID,
    DstDid: isOutbound ? normalizeText(log.number) : this.profileUserID,
    CallDirection: isOutbound ? "outbound" : "inbound",
    Disposition: answeredAt ? "ANSWERED" : "MISSED",
    Billsec: billsec
  });
  stream.TotalRows = stream.DataCollection.length;
  this.localDB.setItem(storageKey, JSON.stringify(stream));
};
deleteRecentById_fn = function(recentId) {
  if (!this.localDB || !recentId) return;
  const item = this.recents.find((r) => r.id === recentId) || (this.recentGroups || []).flatMap((g) => g.calls || [g]).find((r) => r.id === recentId);
  if (!item) return;
  __privateMethod(this, _PhoneUI_instances, deleteRecentGroup_fn).call(this, [item]);
};
deleteRecentGroup_fn = function(calls) {
  if (!this.localDB || !Array.isArray(calls) || !calls.length) return;
  const byIdentity = /* @__PURE__ */ new Map();
  for (const call of calls) {
    if (!call?.identity || !call?.cdrId) continue;
    if (!byIdentity.has(call.identity)) byIdentity.set(call.identity, /* @__PURE__ */ new Set());
    byIdentity.get(call.identity).add(normalizeText(call.cdrId));
  }
  for (const [identity, cdrIds] of byIdentity.entries()) {
    const storageKey = `${identity}-stream`;
    const stream = safeJsonParse(this.localDB.getItem(storageKey), null);
    if (!stream || !Array.isArray(stream.DataCollection)) continue;
    const before = stream.DataCollection.length;
    stream.DataCollection = stream.DataCollection.filter((entry) => {
      if (!entry || entry.ItemType !== "CDR") return true;
      return !cdrIds.has(normalizeText(entry.CdrId));
    });
    if (stream.DataCollection.length !== before) {
      stream.TotalRows = stream.DataCollection.length;
      this.localDB.setItem(storageKey, JSON.stringify(stream));
    }
  }
};
clearAllRecents_fn = function() {
  if (!this.localDB) return;
  for (let i = 0; i < this.localDB.length; i += 1) {
    const storageKey = this.localDB.key(i);
    if (!storageKey || !storageKey.endsWith("-stream")) continue;
    const stream = safeJsonParse(this.localDB.getItem(storageKey), null);
    if (!stream || !Array.isArray(stream.DataCollection)) continue;
    const before = stream.DataCollection.length;
    stream.DataCollection = stream.DataCollection.filter((item) => !item || item.ItemType !== "CDR");
    if (stream.DataCollection.length !== before) {
      stream.TotalRows = stream.DataCollection.length;
      this.localDB.setItem(storageKey, JSON.stringify(stream));
    }
  }
  this.recentExpandedById = {};
};
addContact_fn = function(name, number, { enableDuringDnd = false } = {}) {
  const parsedNumber = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, number);
  if (!parsedNumber) return;
  const collection = __privateMethod(this, _PhoneUI_instances, loadBuddyCollection_fn).call(this);
  const contactId = `c${Date.now()}`;
  const displayName = normalizeText(name).slice(0, __privateMethod(this, _PhoneUI_instances, maxContactNameLength_fn).call(this)) || parsedNumber;
  collection.DataCollection.push({
    Type: "contact",
    LastActivity: (/* @__PURE__ */ new Date()).toISOString(),
    ExtensionNumber: "",
    MobileNumber: "",
    ContactNumber1: parsedNumber,
    ContactNumber2: "",
    uID: null,
    cID: contactId,
    gID: null,
    jid: null,
    DisplayName: displayName,
    Description: "",
    Email: "",
    MemberCount: 0,
    EnableDuringDnd: !!enableDuringDnd,
    Subscribe: false,
    SubscribeUser: null,
    AutoDelete: false
  });
  __privateMethod(this, _PhoneUI_instances, saveBuddyCollection_fn).call(this, collection);
};
updateContact_fn = function(contactId, name, number, { enableDuringDnd = false } = {}) {
  if (!contactId) return false;
  const parsedNumber = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, number);
  if (!parsedNumber) return false;
  const collection = __privateMethod(this, _PhoneUI_instances, loadBuddyCollection_fn).call(this);
  const displayName = normalizeText(name).slice(0, __privateMethod(this, _PhoneUI_instances, maxContactNameLength_fn).call(this)) || parsedNumber;
  let updated = false;
  collection.DataCollection = (collection.DataCollection || []).map((item) => {
    if (!item || item.Type !== "contact") return item;
    const id = normalizeText(item.cID || item.uID || item.gID);
    if (id !== contactId) return item;
    updated = true;
    return {
      ...item,
      ContactNumber1: parsedNumber,
      DisplayName: displayName,
      EnableDuringDnd: !!enableDuringDnd,
      LastActivity: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  if (updated) __privateMethod(this, _PhoneUI_instances, saveBuddyCollection_fn).call(this, collection);
  return updated;
};
promptAddContact_fn = function() {
  __privateMethod(this, _PhoneUI_instances, showAddContactPanel_fn).call(this);
};
hideAddContactSheet_fn = function() {
  this.root.querySelector("#vphoneContactSheet")?.remove();
  this.editingContactId = "";
};
showAddContactPanel_fn = function(numberStr = "", nameStr = "", { contactId = "" } = {}) {
  this.returnTab = this.activeTab || "contacts";
  const editId = normalizeText(contactId);
  this.root.querySelector("#vphoneContactSheet")?.remove();
  this.editingContactId = editId;
  const isEdit = !!this.editingContactId;
  const maxName = __privateMethod(this, _PhoneUI_instances, maxContactNameLength_fn).call(this);
  const maxDid = __privateMethod(this, _PhoneUI_instances, maxDidLength_fn).call(this);
  const safeName = String(nameStr || "").slice(0, maxName);
  const safeNumber = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, numberStr);
  const phone = this.root.querySelector("#Phone") || this.root;
  const sheet = document.createElement("div");
  sheet.id = "vphoneContactSheet";
  sheet.className = "vphoneContactSheet";
  sheet.innerHTML = `
      <div class="vphoneContactSheetBackdrop" data-action="close-add-contact"></div>
      <div class="vphoneContactSheetPanel" role="dialog" aria-modal="true" aria-label="${escapeHtml(isEdit ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "edit") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "addContactTitle"))}">
        <div class="vphoneContactSheetHeader">
          <div class="vphoneContactSheetTitle">${escapeHtml(isEdit ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "edit") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "addContactTitle"))}</div>
        </div>
        <div class="vphoneContactSheetBody">
          <label class="vphoneContactField" for="AddSomeone_Name">
            <span class="vphoneContactLabel">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "fullName"))} *</span>
            <input id="AddSomeone_Name" class="vphoneContactInput" type="text" autocomplete="name" maxlength="${maxName}" placeholder="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "namePlaceholder"))}" value="${escapeHtml(safeName)}">
          </label>
          <label class="vphoneContactField" for="AddSomeone_Num1">
            <span class="vphoneContactLabel">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "contactNumber1"))} *</span>
            <input id="AddSomeone_Num1" class="vphoneContactInput" type="tel" inputmode="tel" autocomplete="tel" maxlength="${maxDid}" placeholder="${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "numberPlaceholder"))}" value="${escapeHtml(safeNumber)}">
          </label>
          <div class="vphoneContactCheck">
            <input type="checkbox" id="AddSomeone_Dnd">
            <label for="AddSomeone_Dnd">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "allowCallsOnDnd"))}</label>
          </div>
        </div>
        <div class="vphoneContactSheetActions">
          <button type="button" class="configSecondaryButton" id="AddSomeone_Cancel">${escapeHtml(__privateMethod(this, _PhoneUI_instances, t_fn).call(this, "cancel"))}</button>
          <button type="button" class="configPrimaryButton" id="AddSomeone_Save">${escapeHtml(isEdit ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "saveContact") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "add"))}</button>
        </div>
      </div>`;
  phone.appendChild(sheet);
  const nameInput = sheet.querySelector("#AddSomeone_Name");
  const numberInput = sheet.querySelector("#AddSomeone_Num1");
  nameInput?.addEventListener("input", () => {
    nameInput.value = String(nameInput.value || "").slice(0, maxName);
  });
  numberInput?.addEventListener("input", () => {
    numberInput.value = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, numberInput.value);
  });
  sheet.querySelectorAll("[data-action='close-add-contact']").forEach((el) => {
    el.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, hideAddContactSheet_fn).call(this));
  });
  sheet.querySelector("#AddSomeone_Cancel")?.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, hideAddContactSheet_fn).call(this));
  sheet.querySelector("#AddSomeone_Save")?.addEventListener("click", () => __privateMethod(this, _PhoneUI_instances, saveAddContactForm_fn).call(this));
  window.setTimeout(() => nameInput?.focus(), 0);
};
saveAddContactForm_fn = function() {
  const name = String(this.root.querySelector("#AddSomeone_Name")?.value || "").slice(0, __privateMethod(this, _PhoneUI_instances, maxContactNameLength_fn).call(this));
  const number = __privateMethod(this, _PhoneUI_instances, clampDialValue_fn).call(this, this.root.querySelector("#AddSomeone_Num1")?.value || "");
  const numberInput = this.root.querySelector("#AddSomeone_Num1");
  if (numberInput) numberInput.value = number;
  if (!normalizeText(name) || !number) return;
  const enableDuringDnd = !!this.root.querySelector("#AddSomeone_Dnd")?.checked;
  const editingId = normalizeText(this.editingContactId);
  if (editingId) {
    __privateMethod(this, _PhoneUI_instances, updateContact_fn).call(this, editingId, name, number, { enableDuringDnd });
  } else {
    __privateMethod(this, _PhoneUI_instances, addContact_fn).call(this, name, number, { enableDuringDnd });
  }
  __privateMethod(this, _PhoneUI_instances, hideAddContactSheet_fn).call(this);
  this.contacts = __privateMethod(this, _PhoneUI_instances, loadContactsFromStorage_fn).call(this);
  this.activeTab = "contacts";
  this.renderer.showTab("contacts");
  __privateMethod(this, _PhoneUI_instances, setBottomTabsVisible_fn).call(this, true);
  __privateMethod(this, _PhoneUI_instances, renderContacts_fn).call(this);
  this.renderer.setStatus(editingId ? "Contact updated" : "Contact added");
};
clearAllContacts_fn = function() {
  const collection = __privateMethod(this, _PhoneUI_instances, loadBuddyCollection_fn).call(this);
  collection.DataCollection = collection.DataCollection.filter((item) => !item || item.Type !== "contact");
  __privateMethod(this, _PhoneUI_instances, saveBuddyCollection_fn).call(this, collection);
};
toggleRegistration_fn = async function() {
  if (typeof this.sdk.toggleRegistration !== "function") {
    this.renderer.setStatus("Register toggle not supported");
    return;
  }
  try {
    const state = await this.sdk.toggleRegistration();
    this.renderer.setRegistrationState({
      ...state || {},
      user: __privateMethod(this, _PhoneUI_instances, registrationDisplayUser_fn).call(this, state?.user)
    });
    this.renderer.setStatus(state?.online ? __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "online") : __privateMethod(this, _PhoneUI_instances, t_fn).call(this, "offline"));
  } catch (err) {
    this.renderer.setStatus(`Register toggle failed: ${String(err?.message || err)}`);
  }
};
function createPhoneWidget({ root, config = {}, deps = {} } = {}) {
  const mountRoot = root || document.getElementById("Phone") || document.body;
  const normalizedConfig = normalizePhoneConfig(config);
  const sdk = deps.sdk || new PhoneSDK(normalizedConfig, deps);
  const ui = new PhoneUI({ root: mountRoot, sdk, config: normalizedConfig, deps });
  ui.mount();
  sdk.bindAudioElements?.({
    remoteEl: mountRoot.querySelector("[data-role='remote-media']"),
    localEl: mountRoot.querySelector("[data-role='local-media']")
  });
  const onHostMessage = (event) => {
    const msg = event?.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.action !== "makeCall") return;
    const data = msg.data && typeof msg.data === "object" ? msg.data : msg;
    void ui.makeCallFromHost(data).catch((err) => {
      ui.renderer?.setStatus?.(`Call failed: ${String(err?.message || err)}`);
    });
  };
  if (typeof window !== "undefined") {
    window.addEventListener("message", onHostMessage);
  }
  const postToHost = (message) => {
    try {
      if (typeof window === "undefined") return;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, "*");
      }
      window.postMessage(message, "*");
    } catch {
    }
  };
  const hostUnsubs = [];
  const onHostEvent = (eventName, handler) => {
    sdk.on?.(eventName, handler);
    hostUnsubs.push(() => sdk.off?.(eventName, handler));
  };
  onHostEvent("registration-changed", ({ online, user, error } = {}) => {
    postToHost({
      type: "vphone-status",
      online: !!online,
      user: user || "",
      error: error || "",
      status: online ? "online" : "offline"
    });
  });
  onHostEvent("incoming-call", (call = {}) => {
    postToHost({
      type: "vphone-call",
      payload: {
        phase: "incoming",
        from: call.from || "",
        displayName: call.displayName || "",
        number: call.from || ""
      }
    });
  });
  onHostEvent("outgoing-call", ({ target } = {}) => {
    postToHost({
      type: "vphone-call",
      payload: { phase: "outgoing", number: target || "", target: target || "" }
    });
  });
  onHostEvent("call-connected", (payload = {}) => {
    postToHost({
      type: "vphone-call",
      payload: { phase: "answered", direction: payload.direction || "" }
    });
  });
  onHostEvent("call-ended", () => {
    postToHost({
      type: "vphone-call",
      payload: { phase: "ended" }
    });
  });
  const ready = (async () => {
    try {
      const password = await sdk.hydrateSecrets?.();
      if (password) ui.config.Password = password;
    } catch {
    }
    try {
      await sdk.register?.();
    } catch (err) {
      sdk.emitRegistrationChanged?.({ online: false, error: String(err?.message || err) });
    }
  })();
  return {
    sdk,
    ui,
    ready,
    makeCall: (numberToDial, options = {}) => ui.makeCallFromHost({
      numberToDial,
      ...options && typeof options === "object" ? options : {},
      extraHeaders: Array.isArray(options) ? options : options?.extraHeaders
    }),
    getTabLeader: () => sdk.getTabLeader?.() || null,
    destroy() {
      try {
        if (typeof window !== "undefined") window.removeEventListener("message", onHostMessage);
      } catch {
      }
      for (const unsub of hostUnsubs) {
        try {
          unsub();
        } catch {
        }
      }
      hostUnsubs.length = 0;
      try {
        sdk.hangup?.();
      } catch {
      }
      const tabLeader = sdk.getTabLeader?.();
      if (tabLeader) {
        try {
          tabLeader.destroy();
        } catch {
        }
      } else {
        try {
          sdk.unregister?.();
        } catch {
        }
      }
    }
  };
}

// renderer/src/app.ts
var shortcutDefaults = {
  answer: "F2",
  hangup: "Escape",
  hold: "F4",
  mute: "F6",
  transfer: "F8"
};
var shortcutLabels = {
  en: {
    answer: "Answer call",
    hangup: "Hangup",
    hold: "Hold or resume",
    mute: "Mute or unmute",
    transfer: "Transfer call"
  },
  vi: {
    answer: "Tr\u1EA3 l\u1EDDi cu\u1ED9c g\u1ECDi",
    hangup: "K\u1EBFt th\xFAc cu\u1ED9c g\u1ECDi",
    hold: "Gi\u1EEF cu\u1ED9c g\u1ECDi",
    mute: "T\u1EAFt ho\u1EB7c b\u1EADt ti\u1EBFng",
    transfer: "Chuy\u1EC3n cu\u1ED9c g\u1ECDi"
  }
};
var shortcutPopupCopy = {
  en: {
    title: "Keyboard shortcuts",
    toggleTitle: "Shortcuts",
    closeAriaLabel: "Close",
    emptyText: "No shortcuts configured."
  },
  vi: {
    title: "C\xE1c ph\xEDm t\u1EAFt",
    toggleTitle: "Ph\xEDm t\u1EAFt",
    closeAriaLabel: "\u0110\xF3ng",
    emptyText: "Kh\xF4ng c\xF3 ph\xEDm t\u1EAFt n\xE0o \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh."
  }
};
function escapeHtml2(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function resolveLang(language) {
  return String(language || document.documentElement.lang || "en").toLowerCase().startsWith("vi") ? "vi" : "en";
}
function normalizeShortcuts(value) {
  let configured = {};
  if (typeof value === "string") {
    try {
      configured = JSON.parse(value);
    } catch {
      configured = {};
    }
  } else if (value && typeof value === "object") {
    configured = value;
  }
  const next = {};
  for (const action of Object.keys(shortcutDefaults)) {
    const candidate = configured[action];
    next[action] = typeof candidate === "string" && candidate.trim() ? candidate.trim() : shortcutDefaults[action];
  }
  return next;
}
function normalizePhoneConfig2(config, { isDev = false } = {}) {
  const defaults = { TraceSip: !!isDev };
  const normalized = Object.assign(defaults, config || {});
  if (!isDev) normalized.TraceSip = false;
  for (const key of ["Server", "Port", "ServerPath", "Domain", "Username", "Password", "PasswordType"]) {
    if (normalized[key] === "") delete normalized[key];
  }
  const hasAccount = !!(normalized.Server || normalized.Port || normalized.Username);
  if (!hasAccount) {
    delete normalized.ServerPath;
    delete normalized.Domain;
    delete normalized.PasswordType;
  }
  normalized.AppMode = "embedded";
  normalized.phoneShell = "embedded";
  normalized.EnableNotifications = false;
  if (normalized.EnableSettings === void 0) normalized.EnableSettings = true;
  delete normalized.EnableRingtone;
  if (!normalized.MediaConfig || typeof normalized.MediaConfig !== "object") {
    normalized.MediaConfig = {};
  }
  const mediaConfig = normalized.MediaConfig;
  if (!mediaConfig.ringtone) {
    mediaConfig.ringtone = new URL("./media/Ringtone.mp3", import.meta.url).href;
  }
  const lang = String(normalized.Language || "vi").toLowerCase();
  normalized.Language = lang === "en" || lang === "english" ? "en" : "vi";
  normalized.SipJsUrl = new URL("../vendor/sip-0.21.2.min.js", import.meta.url).href;
  return normalized;
}
function matchesAccelerator(event, accelerator) {
  const parts = String(accelerator || "").toLowerCase().split("+");
  const hasAlt = parts.includes("alt");
  const hasCtrl = parts.includes("ctrl") || parts.includes("control");
  const hasShift = parts.includes("shift");
  const keyPart = parts.find((p) => p !== "alt" && p !== "ctrl" && p !== "control" && p !== "shift") || "";
  return event.altKey === hasAlt && (event.ctrlKey || event.metaKey) === hasCtrl && event.shiftKey === hasShift && event.key.toLowerCase() === keyPart;
}
(async function boot() {
  const panel = document.getElementById("phone-panel");
  const errorEl = document.getElementById("desktop-error");
  const titleEl = document.querySelector(".desktop-title");
  const shortcutsPopup = document.getElementById("desktop-shortcuts-popup");
  const shortcutsList = document.getElementById("desktop-shortcuts-list");
  const shortcutsToggle = document.querySelector("[data-shortcuts-toggle]");
  const desktop = window.VPhoneDesktop;
  let mounted = null;
  function showError(message) {
    if (!errorEl) return;
    errorEl.hidden = false;
    errorEl.textContent = message;
    desktop?.log?.("error", message);
  }
  function log(level, message, meta) {
    desktop?.log?.(level, message, meta ?? null);
  }
  function setCallPhase(phase) {
    desktop?.setCallPhase?.(phase);
  }
  function focusPhone() {
    try {
      panel?.focus();
      const dial = panel?.querySelector("#dialText") || panel?.querySelector("#txtFindBuddy");
      dial?.focus();
    } catch (error) {
      log("warn", "Unable to focus phone", { message: String(error?.message || error) });
    }
  }
  function bindWindowControls() {
    document.querySelectorAll("[data-window-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-window-action");
        if (action === "minimize") desktop?.minimizeWindow();
        if (action === "close") desktop?.closeWindow();
      });
    });
  }
  function bindShortcutPopup(shortcuts, language) {
    if (!shortcutsPopup || !shortcutsToggle || !shortcutsList) return;
    const lang = resolveLang(language);
    const labels = shortcutLabels[lang];
    const copy = shortcutPopupCopy[lang];
    const titleNode = document.getElementById("desktop-shortcuts-title");
    if (titleNode) titleNode.textContent = copy.title;
    shortcutsToggle.setAttribute("title", copy.toggleTitle);
    shortcutsToggle.setAttribute("aria-label", copy.toggleTitle);
    shortcutsPopup.querySelectorAll("[data-shortcuts-close]").forEach((el) => {
      el.setAttribute("aria-label", copy.closeAriaLabel);
    });
    shortcutsList.innerHTML = Object.keys(labels).map((action) => `<div class="desktop-shortcuts-item"><span class="desktop-shortcuts-label">${escapeHtml2(labels[action])}</span><span class="desktop-shortcuts-key">${escapeHtml2(shortcuts[action] || "-")}</span></div>`).join("") || `<p class="desktop-shortcuts-empty">${escapeHtml2(copy.emptyText)}</p>`;
    shortcutsToggle.addEventListener("click", () => {
      shortcutsPopup.hidden = !shortcutsPopup.hidden;
    });
    shortcutsPopup.querySelectorAll("[data-shortcuts-close]").forEach((el) => {
      el.addEventListener("click", () => {
        shortcutsPopup.hidden = true;
      });
    });
  }
  function runShortcut(action) {
    if (!mounted || !action) return false;
    const { sdk, ui } = mounted;
    try {
      if (action === "answer") sdk.answer();
      else if (action === "hangup") sdk.hangup();
      else if (action === "mute") sdk.toggleMute();
      else if (action === "hold") sdk.isOnHold() ? sdk.resume() : sdk.hold();
      else if (action === "transfer") {
        const transferBtn = panel?.querySelector(".callTransfer, #line-1-btn-Transfer");
        transferBtn?.click();
      }
      return true;
    } catch (error) {
      log("warn", "Shortcut failed", { action, message: String(error?.message || error) });
      return false;
    }
  }
  try {
    if (!desktop || !panel) {
      showError("Electron preload bridge is not available.");
      return;
    }
    bindWindowControls();
    const desktopConfig = await desktop.getConfig();
    const isDev = typeof desktop.isDevMode === "function" ? !!await desktop.isDevMode() : false;
    const mountConfig = desktopConfig.mount || {};
    const appTitle = mountConfig.title || "VPhone";
    if (titleEl) titleEl.textContent = appTitle;
    document.title = appTitle;
    const shortcuts = normalizeShortcuts(desktopConfig.phone?.KeyboardShortcuts);
    bindShortcutPopup(shortcuts, desktopConfig.phone?.Language);
    const phoneConfig = normalizePhoneConfig2(desktopConfig.phone, { isDev });
    panel.setAttribute("data-phone-shell", "embedded");
    panel.setAttribute("tabindex", "-1");
    mounted = createPhoneWidget({
      root: panel,
      config: phoneConfig
    });
    window.__VPhoneDesktopWidget = mounted;
    mounted.sdk.bindAudioElements?.({
      remoteEl: document.querySelector("[data-role='remote-media']"),
      localEl: document.querySelector("[data-role='local-media']")
    });
    const phoneRoot = panel.querySelector("#Phone");
    phoneRoot?.classList.add("phoneEmbedded");
    phoneRoot?.classList.remove("phoneStandalone");
    const sdk = mounted.sdk;
    sdk.on("registration-changed", (event) => {
      log("info", "Phone status changed", event);
    });
    sdk.on("incoming-call", (event) => {
      log("info", "Incoming call", event);
      setCallPhase("incoming");
      [0, 150, 350, 700].forEach((delay) => {
        window.setTimeout(() => {
          void desktop.focusWindow?.("incoming-call");
          focusPhone();
        }, delay);
      });
    });
    sdk.on("outgoing-call", () => setCallPhase("in-call"));
    sdk.on("call-connected", () => setCallPhase("in-call"));
    sdk.on("call-ended", () => setCallPhase("idle"));
    desktop.onWindowFocused?.(() => focusPhone());
    desktop.onShortcutAction?.((payload) => {
      if (payload?.action) runShortcut(payload.action);
    });
    window.addEventListener("keydown", (event) => {
      const active = document.activeElement;
      const isEditable = !!(active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT" || active.isContentEditable));
      if (event.key === "Escape" && shortcutsPopup && !shortcutsPopup.hidden) {
        event.preventDefault();
        shortcutsPopup.hidden = true;
        return;
      }
      if (event.key === "Enter" && !isEditable) {
        const dialText = document.getElementById("dialText");
        if (dialText?.value) {
          event.preventDefault();
          mounted?.ui?.call?.({ video: false });
          return;
        }
      }
      if (event.key === "Escape") {
        const closeDtmf = document.querySelector(".callCloseDtmf");
        if (closeDtmf && closeDtmf.offsetWidth > 0) {
          event.preventDefault();
          closeDtmf.click();
          return;
        }
        event.preventDefault();
        runShortcut("hangup");
        return;
      }
      if (!isEditable) {
        const dialText = document.getElementById("dialText");
        if (dialText) {
          if (/^[\d*#+]$/.test(event.key)) {
            event.preventDefault();
            dialText.value = `${dialText.value || ""}${event.key}`;
            dialText.dispatchEvent(new Event("input", { bubbles: true }));
            dialText.focus();
            return;
          }
          if (event.key === "Backspace") {
            event.preventDefault();
            dialText.value = String(dialText.value || "").slice(0, -1);
            dialText.dispatchEvent(new Event("input", { bubbles: true }));
            dialText.focus();
            return;
          }
        }
      }
      if (matchesAccelerator(event, shortcuts.answer)) {
        event.preventDefault();
        runShortcut("answer");
      } else if (matchesAccelerator(event, shortcuts.hangup) && event.key.toLowerCase() !== "escape") {
        event.preventDefault();
        runShortcut("hangup");
      } else if (matchesAccelerator(event, shortcuts.mute)) {
        event.preventDefault();
        runShortcut("mute");
      } else if (matchesAccelerator(event, shortcuts.hold)) {
        event.preventDefault();
        runShortcut("hold");
      } else if (matchesAccelerator(event, shortcuts.transfer)) {
        event.preventDefault();
        runShortcut("transfer");
      }
    });
    window.setTimeout(() => focusPhone(), 80);
    if (typeof desktop.requestMediaAccess === "function") {
      void desktop.requestMediaAccess().catch((error) => {
        log("warn", "OS media access request failed", { message: String(error?.message || error) });
      });
    }
  } catch (error) {
    showError(String(error?.message || error));
  }
})();
