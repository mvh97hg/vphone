import { sipAuthorizationOptions } from "../sdk/sip-auth.js";
import { getSipUserAgentString } from "../version.js";

function buildWsUrl(config) {
  const host = config.Server || "";
  const port = config.Port || "443";
  const path = config.ServerPath || "/ws";
  if (!host || !port) return "";
  const useTls = config.Wss !== false && config.Wss !== 0 && config.Wss !== "0" && config.Wss !== "false";
  return `${useTls ? "wss" : "ws"}://${host}:${port}${path}`;
}

/** Domain falls back to Server host when empty (common PBX setups). */
export function resolveSipDomain(config = {}) {
  const explicit = String(config.Domain || "").trim();
  if (explicit) return explicit;
  return String(config.Server || "").trim();
}

/**
 * Caller id from SIP.js Invitation (NameAddrHeader).
 * Prefer assertedIdentity (P-Asserted-Identity) when present, else remoteIdentity (From).
 * - number: URI.user (e.g. "7003")
 * - displayName: NameAddrHeader.displayName
 * - from: URI string (sip:7003@host)
 */
export function sipCallerFromInvitation(invitation) {
  const identity = invitation?.assertedIdentity || invitation?.remoteIdentity || null;
  const uri = identity?.uri;
  const number = uri?.user != null ? String(uri.user).trim() : "";
  const displayName = identity?.displayName != null ? String(identity.displayName).trim() : "";
  const from = uri != null ? String(uri) : "";
  return { from, number, displayName };
}

const SIPJS_FILENAME = "sip-0.21.2.min.js";

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

let sipJsLoadPromise = null;

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

class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
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
}

class MediaManager extends EventEmitter {
  constructor({ mediaDevices = navigator.mediaDevices } = {}) {
    super();
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

  setAudioProcessing( partial = {}) {
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

  #normalizeConstraints(constraints) {
    if (constraints && typeof constraints === "object") {
      return {
        audio: constraints.audio === undefined
          ? this.getAudioConstraints()
          : constraints.audio === true
            ? this.getAudioConstraints()
            : constraints.audio,
        video: constraints.video ?? false
      };
    }
    return { audio: this.getAudioConstraints(), video: false };
  }

  #liveTracks() {
    return this.localStream?.getTracks?.().filter((track) => track.readyState === "live") || [];
  }

  #wireTrackEnded(stream) {
    if (!stream?.getTracks) return;
    for (const track of stream.getTracks()) {
      track.onended = () => {
        // User revoked permission or device lost — drop cache so next call re-prompts.
        const live = this.#liveTracks();
        if (!live.length && this.localStream === stream) {
          this.localStream = null;
          this.emit("local-stream-stopped", stream);
        }
      };
    }
  }

  #mediaAccessError(message, name = "NotAllowedError") {
    const err = new Error(message || "Microphone permission required");
    err.name = name;
    return err;
  }

  async #getUserMediaWithTimeout(constraints, timeoutMs = 20000) {
    if (!this.mediaDevices || typeof this.mediaDevices.getUserMedia !== "function") {
      throw this.#mediaAccessError("Media devices unavailable");
    }
    let timer = null;
    try {
      return await Promise.race([
        this.mediaDevices.getUserMedia(constraints),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            reject(this.#mediaAccessError("Microphone permission timeout"));
          }, timeoutMs);
        })
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  #assertStreamMatches(stream, { wantAudio, wantVideo }) {
    const live = stream?.getTracks?.().filter((track) => track.readyState === "live") || [];
    const hasLiveAudio = live.some((track) => track.kind === "audio");
    const hasLiveVideo = live.some((track) => track.kind === "video");
    if (wantAudio && !hasLiveAudio) {
      throw this.#mediaAccessError("Microphone permission required");
    }
    if (wantVideo && !hasLiveVideo) {
      throw this.#mediaAccessError("Camera permission required");
    }
    return stream;
  }

  /**
   * Ensure mic/camera access before call/answer.
   * Reuses live tracks when already granted; otherwise getUserMedia (browser prompt).
   * Do not await Permissions API first — that can drop the user-gesture and block the prompt.
   */
  async ensureMediaAccess(constraints) {
    const normalized = this.#normalizeConstraints(constraints);
    const wantAudio = !!normalized.audio;
    const wantVideo = !!normalized.video;
    const live = this.#liveTracks();
    if (this.localStream && !live.length) {
      this.localStream = null;
    }
    const hasLiveAudio = live.some((track) => track.kind === "audio");
    const hasLiveVideo = live.some((track) => track.kind === "video");
    if (this.localStream && (!wantAudio || hasLiveAudio) && (!wantVideo || hasLiveVideo)) {
      this.emit("local-stream", this.localStream);
      return this.localStream;
    }
    if (this.localStream) this.stopLocalStream();
    return this.getLocalStream(normalized);
  }

  async getLocalStream(constraints) {
    const normalized = this.#normalizeConstraints(constraints);
    this.currentConstraints = normalized;
    const wantAudio = !!normalized.audio;
    const wantVideo = !!normalized.video;
    const liveTracks = this.#liveTracks();
    const hasLiveAudio = liveTracks.some((track) => track.kind === "audio");
    const hasLiveVideo = liveTracks.some((track) => track.kind === "video");
    if (this.localStream && (!wantAudio || hasLiveAudio) && (!wantVideo || hasLiveVideo)) {
      this.emit("local-stream", this.localStream);
      return this.localStream;
    }

    let stream;
    try {
      stream = await this.#getUserMediaWithTimeout(normalized);
    } catch (err) {
      // Retry with simple constraints — preferred deviceId can fail as OverconstrainedError.
      const simple = { audio: !!wantAudio, video: !!wantVideo };
      try {
        stream = await this.#getUserMediaWithTimeout(simple);
      } catch (retryErr) {
        const name = String(retryErr?.name || err?.name || "NotAllowedError");
        const message = String(retryErr?.message || err?.message || "Microphone permission required");
        throw this.#mediaAccessError(message, name);
      }
    }

    this.#assertStreamMatches(stream, { wantAudio, wantVideo });
    this.localStream = stream;
    this.#wireTrackEnded(this.localStream);
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
      audio: mediaKind === "audioinput"
        ? { deviceId: { exact: deviceId } }
        : existingAudio.length > 0,
      video: mediaKind === "videoinput"
        ? { deviceId: { exact: deviceId } }
        : existingVideo.length > 0
    };

    const nextStream = await this.mediaDevices.getUserMedia(constraints);
    if (mediaKind === "audioinput") {
      const [nextAudio] = nextStream.getAudioTracks();
      if (nextAudio) this.#replaceTrack(existingAudio, nextAudio);
      for (const track of nextStream.getVideoTracks()) track.stop();
    }
    if (mediaKind === "videoinput") {
      const [nextVideo] = nextStream.getVideoTracks();
      if (nextVideo) this.#replaceTrack(existingVideo, nextVideo);
      for (const track of nextStream.getAudioTracks()) track.stop();
    }

    this.emit("device-switch-requested", { kind, deviceId });
    this.emit("local-stream", this.localStream);
    return { kind: mediaKind, deviceId, stream: this.localStream };
  }

  #replaceTrack(existingTracks, nextTrack) {
    for (const track of existingTracks) {
      this.localStream.removeTrack(track);
      track.stop();
    }
    this.localStream.addTrack(nextTrack);
  }
}

export class PhoneCore extends EventEmitter {
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
    /** True only after an intentional unregister(); cleared on register(). */
    this._intentionallyUnregistered = false;
    this._registererWired = false;
    /** Fingerprint of SIP identity bound into the current UserAgent (ws/user/domain/auth). */
    this._uaBoundFingerprint = "";
    /** True after the first successful transport connect for this UA. */
    this._transportEverConnected = false;
    this._reregisterAfterTransportInFlight = false;
    this._boundRemoteEl = null;
    this._boundLocalEl = null;
    this._bindMedia();
  }

  _uaFingerprint(config = this.config) {
    const cfg = config || {};
    return [
      buildWsUrl(cfg),
      String(cfg.Username || "").trim(),
      resolveSipDomain(cfg),
      String(cfg.Password || ""),
      String(cfg.PasswordType || "").trim().toLowerCase()
    ].join("|");
  }

  _transportKeepAliveIntervalSec() {
    const raw = Number(this.config.TransportKeepAliveInterval);
    // SIP.js default is 0 (disabled) — half-open WSS after server restart stays
    // "Connected" forever. 15s CRLF keepalives detect dead sockets quickly.
    if (!Number.isFinite(raw)) return 15;
    if (raw < 0) return 0;
    return raw;
  }

  _transportReconnectionAttempts() {
    const raw = Number(this.config.TransportReconnectionAttempts);
    if (!Number.isFinite(raw) || raw < 0) return 10;
    return Math.floor(raw);
  }

  _transportReconnectionDelaySec() {
    const raw = Number(this.config.TransportReconnectionTimeout);
    if (!Number.isFinite(raw) || raw < 0) return 4;
    return raw;
  }

  _buildTransportOptions(wsUrl, traceSip) {
    return {
      server: wsUrl,
      traceSip: !!traceSip,
      keepAliveInterval: this._transportKeepAliveIntervalSec(),
      connectionTimeout: 5
    };
  }

  _disposeUserAgent() {
    if (this.userAgent) {
      try { this.userAgent.stop?.(); } catch {}
    }
    this.userAgent = null;
    this.registerer = null;
    this._registererWired = false;
    this._uaBoundFingerprint = "";
    this._transportEverConnected = false;
    this._reregisterAfterTransportInFlight = false;
    this.isRegistered = false;
  }

  /**
   * Half-open WSS after server restart still reports Connected; reconnect() is a
   * no-op in that state. Disconnect first so the next connect opens a new socket.
   */
  async _recycleTransport() {
    if (!this.userAgent) return;
    try {
      await this.userAgent.transport?.disconnect?.();
    } catch {
      // ignore
    }
    try {
      await this.userAgent.reconnect();
    } catch {
      this._disposeUserAgent();
    }
  }

  _wireTransportRecovery(username) {
    if (!this.userAgent) return;
    const prev = this.userAgent.delegate && typeof this.userAgent.delegate === "object"
      ? this.userAgent.delegate
      : {};
    this.userAgent.delegate = {
      ...prev,
      onDisconnect: (error) => {
        try { prev.onDisconnect?.(error); } catch { /* ignore */ }
        this.isRegistered = false;
        if (this._intentionallyUnregistered) return;
        const message = error
          ? this._formatRegisterError(error)
          : "Transport disconnected";
        this._lastRegisterError = message;
        this.emit("registration-changed", this._registrationStatusPayload({
          online: false,
          user: username || this.config.Username || "",
          error: message
        }));
      },
      onConnect: () => {
        try { prev.onConnect?.(); } catch { /* ignore */ }
        if (this._intentionallyUnregistered) return;
        if (!this._transportEverConnected) {
          this._transportEverConnected = true;
          return;
        }
        // New socket after drop/server restart — REGISTER again so INVITEs arrive.
        void this._reregisterAfterTransportRecover(username);
      }
    };
  }

  async _reregisterAfterTransportRecover(username) {
    if (this._intentionallyUnregistered || !this.registerer) return;
    if (this._reregisterAfterTransportInFlight) return;
    this._reregisterAfterTransportInFlight = true;
    try {
      await this._registerWithRetry();
      const registered = this.registerer?.state === this.SIP.RegistererState.Registered;
      this.isRegistered = !!registered;
      this._lastRegisterError = registered ? "" : (this._lastRegisterError || "Register failed");
      this.emit("registration-changed", this._registrationStatusPayload({
        online: registered,
        user: username || this.config.Username || "",
        error: registered ? undefined : this._lastRegisterError
      }));
    } catch (err) {
      this.isRegistered = false;
      const error = this._formatRegisterError(err);
      this._lastRegisterError = error;
      this.emit("registration-changed", this._registrationStatusPayload({
        online: false,
        user: username || this.config.Username || "",
        error
      }));
    } finally {
      this._reregisterAfterTransportInFlight = false;
    }
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
    const changedSipConfig = sipKeys.some((key) => config[key] !== undefined && config[key] !== before[key]);
    this.config = { ...before, ...(config || {}) };
    // Ringtone cannot be disabled via config.
    this.config.EnableRingtone = true;
    // Rebuild UA when SIP provisioning changes and we are not registered.
    // Must clear _registererWired or the next Registerer never gets state listeners.
    if (changedSipConfig && this.userAgent && !this.isRegistered) {
      this._disposeUserAgent();
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
    // 0 / unset = wait until ICE gathering completes (SIP.js: timeout only when > 0).
    // Legacy 500ms truncated gathering and caused STUN 401 Unauthorized on hold
    // renegotiation vs rtpengine ICE=force (bad ice-ufrag/pwd).
    if (!Number.isFinite(raw) || raw < 0) return 0;
    return raw;
  }

  /**
   * Initial INVITE/answer may use timeout 0 (wait until complete). For hold
   * re-INVITE, timeout 0 is unsafe: after updateDirection, Chromium often
   * briefly re-enters "gathering" and never finishes with iceServers:[], so
   * the re-INVITE never leaves the client.
   */
  _holdIceGatheringTimeoutMs() {
    const configured = this._iceGatheringTimeoutMs();
    if (configured > 0) return configured;
    return 3000;
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
      // candidate:... <foundation> <component> UDP <priority> <ip> <port> ...
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

  /**
   * Keep ice-ufrag/ice-pwd from the current local description on hold re-INVITE.
   * Accidental credential churn → STUN BINDING 401 Unauthorized to rtpengine.
   */
  _preserveIceCredentials(description) {
    const prev = this.session?.sessionDescriptionHandler?.peerConnection?.localDescription?.sdp || "";
    if (!prev || !description || typeof description.sdp !== "string") {
      return Promise.resolve(description);
    }
    const ufrag = (prev.match(/^a=ice-ufrag:(.+)$/m) || [])[1];
    const pwd = (prev.match(/^a=ice-pwd:(.+)$/m) || [])[1];
    if (!ufrag || !pwd) return Promise.resolve(description);
    let sdp = description.sdp;
    // Replace every session/media ice-ufrag/pwd — a single /m replace leaves
    // mismatched media-level lines and setLocalDescription can reject the offer.
    if (/^a=ice-ufrag:/m.test(sdp)) {
      sdp = sdp.replace(/^a=ice-ufrag:.*$/gm, `a=ice-ufrag:${ufrag}`);
    }
    if (/^a=ice-pwd:/m.test(sdp)) {
      sdp = sdp.replace(/^a=ice-pwd:.*$/gm, `a=ice-pwd:${pwd}`);
    }
    return Promise.resolve({ type: description.type, sdp });
  }

  _holdSdpModifiers(onHold) {
    // Keep modifiers minimal on re-INVITE. Heavy SDP rewriting before ICE
    // gathering has finished has caused the first Hold click to stall/fail
    // while leaving transceiver.direction already flipped.
    const modifiers = [
      (description) => this._filterNoisyIceCandidates(description)
    ];
    if (onHold && typeof this.SIP?.Web?.holdModifier === "function") {
      modifiers.push(this.SIP.Web.holdModifier);
    }
    return modifiers;
  }

  /**
   * SIP.js updateDirection mutates transceiver.direction before the re-INVITE
   * is sent. If getOffer fails/stalls, direction stays on hold while isOnHold
   * stays false — the next click then finally sends hold SDP.
   */
  _restoreTransceiverHoldDirection(onHold) {
    const pc = this.session?.sessionDescriptionHandler?.peerConnection;
    if (!pc || pc.signalingState !== "stable") return;
    const map = (direction) => {
      switch (direction) {
        case "inactive":
          return onHold ? "inactive" : "recvonly";
        case "recvonly":
          return onHold ? "inactive" : "recvonly";
        case "sendonly":
          return onHold ? "sendonly" : "sendrecv";
        case "sendrecv":
          return onHold ? "sendonly" : "sendrecv";
        default:
          return direction;
      }
    };
    for (const transceiver of pc.getTransceivers()) {
      if (!transceiver.direction || transceiver.direction === "stopped") continue;
      const next = map(transceiver.direction);
      if (next && next !== transceiver.direction) transceiver.direction = next;
    }
  }

  /**
   * SIP.js calls requestDelegate.onAccept even when setAnswer() fails on the
   * 2xx (e.g. missing a=rtcp-mux). Treat that as failure so UI does not flip.
   */
  _holdRenegotiationSucceeded(onHold) {
    const Established = this.SIP?.SessionState?.Established;
    if (!this.session || (Established && this.session.state !== Established)) {
      return false;
    }
    const pc = this.session.sessionDescriptionHandler?.peerConnection;
    if (!pc || pc.connectionState === "closed" || pc.signalingState !== "stable") {
      return false;
    }
    const audio = pc.getTransceivers().find((t) => {
      const kind = t.receiver?.track?.kind || t.sender?.track?.kind;
      return kind === "audio";
    });
    if (!audio) return true;
    const dir = String(audio.currentDirection || audio.direction || "");
    if (onHold) {
      return dir === "sendonly" || dir === "inactive";
    }
    return dir === "sendrecv" || dir === "recvonly";
  }

  _bindMedia() {
    this.media.on("local-stream", (stream) => this.emit("local-stream", stream));
  }

  bindAudioElements({ remoteEl, localEl } = {}) {
    this._boundRemoteEl = remoteEl || null;
    this._boundLocalEl = localEl || null;
  }

  /**
   * Read host-configured INVITE headers (config.IncomingHeaders: string[]).
   * Returns { [headerName]: rawValue } for names that are present.
   */
  _extractIncomingHeaders(invitation) {
    const names = Array.isArray(this.config?.IncomingHeaders) ? this.config.IncomingHeaders : [];
    if (!names.length) return {};
    const request = invitation?.request;
    if (!request || typeof request.getHeader !== "function") return {};
    const headers = {};
    for (const rawName of names) {
      const name = String(rawName || "").trim();
      if (!name) continue;
      try {
        const value = request.getHeader(name);
        if (value == null || value === "") continue;
        headers[name] = String(value);
      } catch {
        // ignore missing / unreadable headers
      }
    }
    return headers;
  }

  _registrationStatusPayload({ online, user, error } = {}) {
    if (online) {
      return { online: true, status: "online", user: user || "", error: undefined };
    }
    if (this._intentionallyUnregistered) {
      return {
        online: false,
        status: "offline",
        reason: "unregistered",
        user: user || "",
        error: undefined
      };
    }
    return {
      online: false,
      status: "register-failed",
      reason: "failure",
      user: user || "",
      error: error || this._lastRegisterError || "Register failed"
    };
  }

  async register() {
    await this._ensureSip();
    this._intentionallyUnregistered = false;
    if (this.userAgent && this.isRegistered) {
      const connected = typeof this.userAgent.isConnected === "function"
        ? !!this.userAgent.isConnected()
        : true;
      if (connected) {
        return this._registrationStatusPayload({ online: true, user: this.config.Username });
      }
      // Registered flag stale after transport drop — fall through to reconnect + REGISTER.
      this.isRegistered = false;
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
      this.emit("registration-changed", this._registrationStatusPayload({
        online: false,
        user: username || "",
        error
      }));
      throw new Error(error);
    }

    const fingerprint = this._uaFingerprint();
    // Auth/server changed since UA was built — must recreate (credentials are baked into UA).
    if (this.userAgent && this._uaBoundFingerprint && this._uaBoundFingerprint !== fingerprint) {
      this._disposeUserAgent();
    }

    // After a failed register the WS may be down, UA stopped, or half-open after
    // server restart (still reports Connected). Recycle so REGISTER uses a new socket.
    if (this.userAgent) {
      const Stopped = this.SIP.UserAgentState?.Stopped;
      const stopped = Stopped != null && this.userAgent.state === Stopped;
      if (stopped) {
        this._disposeUserAgent();
      } else {
        await this._recycleTransport();
      }
    }

    const uri = this.SIP.UserAgent.makeURI(`sip:${username}@${domain}`);
    const traceSip = this.config.TraceSip === true || this.config.TraceSip === "1" || this.config.TraceSip === 1;
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
        // Replace SIP.js default "SIP.js/0.21.2" with VPhone/<yy.mm.dd> build stamp.
        userAgentString: getSipUserAgentString(),
        transportOptions: this._buildTransportOptions(wsUrl, traceSip),
        reconnectionAttempts: this._transportReconnectionAttempts(),
        reconnectionDelay: this._transportReconnectionDelaySec(),
        // Keep console quiet unless TraceSip is explicitly enabled (dev).
        logLevel: traceSip ? "debug" : "error",
        logBuiltinEnabled: !!traceSip,
        logConfiguration: false
      };
      if (displayName) uaOptions.displayName = displayName;
      // SIP.js ignores undefined auth fields better when omitted.
      if (auth.authorizationPassword === undefined) delete uaOptions.authorizationPassword;
      if (auth.authorizationHa1 === undefined) delete uaOptions.authorizationHa1;
      uaOptions.sessionDescriptionHandlerFactoryOptions = this._buildSessionDescriptionHandlerFactoryOptions();
      this.userAgent = new this.SIP.UserAgent(uaOptions);
      this.registerer = new this.SIP.Registerer(this.userAgent);
      this._uaBoundFingerprint = fingerprint;
      this._transportEverConnected = false;
      this._wireRegisterer(username);

      this.userAgent.delegate = {
        onInvite: (invitation) => {
          this.session = invitation;
          this._wireSession(invitation, "incoming");
          const caller = sipCallerFromInvitation(invitation);
          this.emit("incoming-call", {
            from: caller.from,
            number: caller.number,
            displayName: caller.displayName,
            headers: this._extractIncomingHeaders(invitation)
          });
        }
      };
      this._wireTransportRecovery(username);
      await this.userAgent.start();
    } else if (this.registerer && !this._registererWired) {
      this._wireRegisterer(username);
    } else if (!this.registerer) {
      this.registerer = new this.SIP.Registerer(this.userAgent);
      this._wireRegisterer(username);
    }

    try {
      await this._registerWithRetry();
      const registered = this.registerer?.state === this.SIP.RegistererState.Registered;
      this.isRegistered = !!registered;
      this._lastRegisterError = registered ? "" : this._lastRegisterError;
      const state = this._registrationStatusPayload({
        online: registered,
        user: username,
        error: registered ? undefined : (this._lastRegisterError || "Register failed")
      });
      this.emit("registration-changed", state);
      if (!registered) throw new Error(state.error || "Register failed");
      return state;
    } catch (err) {
      this.isRegistered = false;
      const error = this._formatRegisterError(err);
      this._lastRegisterError = error;
      this.emit("registration-changed", this._registrationStatusPayload({
        online: false,
        user: username,
        error
      }));
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
      if (online) {
        this._intentionallyUnregistered = false;
        this._lastRegisterError = "";
      }
      this.emit("registration-changed", this._registrationStatusPayload({
        online,
        user: username || this.config.Username || "",
        error: online ? undefined : (this._lastRegisterError || undefined)
      }));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.registerer.register();
    }
  }

  async _ensureSip() {
    if (this.SIP) return this.SIP;
    if (globalThis.SIP) {
      this.SIP = globalThis.SIP;
      return this.SIP;
    }
    // Local/bundled SIP.js only — never download from CDN at runtime.
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
    this._intentionallyUnregistered = true;
    this._lastRegisterError = "";
    if (!this.userAgent || !this.registerer) {
      const state = this._registrationStatusPayload({
        online: false,
        user: this.config.Username || ""
      });
      this.emit("registration-changed", state);
      return state;
    }
    try {
      await this.registerer.unregister();
    } finally {
      this.isRegistered = false;
      this.media.stopLocalStream();
      const state = this._registrationStatusPayload({
        online: false,
        user: this.config.Username || ""
      });
      this.emit("registration-changed", state);
      return state;
    }
  }

  async warmMedia(constraints = { audio: true, video: false }) {
    try {
      await this.media.ensureMediaAccess(constraints);
    } catch {
      // Permission denied or device busy — ignore; call()/answer() will re-request.
    }
  }

  async toggleRegistration() {
    if (this.isRegistered) {
      return this.unregister();
    }
    // After register-failed: force a fresh attempt (reconnect / rebuild UA if needed).
    return this.register();
  }

  getRegistrationState() {
    return this._registrationStatusPayload({
      online: !!this.isRegistered,
      user: this.config.Username || "",
      error: this.isRegistered ? undefined : (this._lastRegisterError || undefined)
    });
  }

  async call(target, options = {}) {
    await this.register();
    this.lastOutgoingTarget = target;
    const domain = resolveSipDomain(this.config);
    const targetUri = this.SIP.UserAgent.makeURI(`sip:${target}@${domain}`);
    const constraints = options.constraints || { audio: this.media.getAudioConstraints(), video: !!options.video };
    const extraHeaders = Array.isArray(options.extraHeaders)
      ? options.extraHeaders.map((h) => String(h || "").trim()).filter(Boolean)
      : [];
    // Mic/camera first — do not create INVITE if permission is blocked.
    const localStream = await this.media.ensureMediaAccess(constraints);
    const inviterOptions = extraHeaders.length ? { extraHeaders } : undefined;
    const inviter = new this.SIP.Inviter(this.userAgent, targetUri, inviterOptions);
    this.session = inviter;
    this._wireSession(inviter, "outgoing");
    this.emit("outgoing-call", { target, extraHeaders });
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
    // Answer click: prompt for mic first; caller rejects if this throws.
    const localStream = await this.media.ensureMediaAccess(constraints);
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
    // Keep mic stream warm so the next INVITE is not blocked by getUserMedia (~1-2s).
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
    // Keep mic stream warm so the next INVITE is not blocked by getUserMedia (~1-2s).
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

  _holdIceRestartEnabled() {
    // Default OFF — same as legacy Phone/phone.js.
    // iceRestart:true + rtpengine ICE=force causes Role conflict / bad username / DTLS close.
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
      // Re-sync UI only — do not pretend a new re-INVITE happened.
      this.emit("hold-changed", { onHold: !!onHold });
      return this.isOnHold;
    }

    if (typeof this.session.invite !== "function") {
      throw new Error("No active session to hold");
    }

    const previous = this.isOnHold;
    const wantHold = !!onHold;
    this._holdInProgress = true;
    // Emit progress so UI can disable Hold/Resume until the re-INVITE settles.
    this.emit("hold-changed", { onHold: previous, pending: true });

    // Always SIP re-INVITE hold (a=sendonly / resume a=sendrecv).
    // Never iceRestart unless explicitly enabled — restart + rtpengine ICE=force
    // → Role conflict / STUN 401 Unauthorized (bad username).
    const holdModifiers = this._holdSdpModifiers(wantHold);
    const reInviteOptions = {
      hold: wantHold,
      iceGatheringTimeout: this._holdIceGatheringTimeoutMs()
    };
    if (this._holdIceRestartEnabled()) {
      reInviteOptions.offerOptions = { iceRestart: true };
    }
    this.session.sessionDescriptionHandlerOptionsReInvite = reInviteOptions;
    this.session.sessionDescriptionHandlerModifiersReInvite = holdModifiers;

    const failHold = (message) => {
      this.isOnHold = previous;
      this._restoreTransceiverHoldDirection(previous);
      this._applyLocalHoldState(previous);
      this.emit("hold-changed", { onHold: this.isOnHold, pending: false });
      return new Error(message || "Hold failed");
    };

    try {
      await new Promise((resolve, reject) => {
        let settled = false;
        const finish = (fn, value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          fn(value);
        };
        // Bound the whole renegotiation — ICE wait alone is not enough if 2xx
        // handling stalls or SIP.js fires a bogus onAccept after setAnswer fails.
        const timer = setTimeout(() => {
          finish(reject, failHold("Hold request timed out"));
        }, Math.max(8000, this._holdIceGatheringTimeoutMs() + 5000));

        const invitePromise = this.session.invite({
          sessionDescriptionHandlerOptions: reInviteOptions,
          sessionDescriptionHandlerModifiers: holdModifiers,
          requestDelegate: {
            onAccept: () => {
              // SIP.js invokes onAccept even when setAnswer() rejected the 2xx SDP
              // (RTCP-MUX missing, etc.). Only flip local hold after PC looks good.
              if (!this._holdRenegotiationSucceeded(wantHold)) {
                finish(reject, failHold(
                  wantHold
                    ? "Hold renegotiation failed (bad answer SDP)"
                    : "Resume renegotiation failed (bad answer SDP)"
                ));
                return;
              }
              this.isOnHold = wantHold;
              this._applyLocalHoldState(wantHold);
              try { this._attachRemoteFromSession(this.session); } catch { /* ignore */ }
              this.emit("hold-changed", { onHold: this.isOnHold, pending: false });
              finish(resolve, this.isOnHold);
            },
            onReject: (response) => {
              const code = response?.message?.statusCode || response?.statusCode;
              finish(reject, failHold(
                code ? `Hold request rejected: ${code}` : "Hold request rejected"
              ));
            }
          }
        });

        Promise.resolve(invitePromise).catch((err) => {
          const message = String(err?.message || err || "");
          if (/already in progress|RequestPending/i.test(message)) {
            finish(reject, failHold("Hold request already in progress"));
            return;
          }
          finish(reject, failHold(message || "Hold failed"));
        });
      });
    } catch (err) {
      if (this._holdInProgress) {
        // failHold already restored state when used; still normalize unknowns.
        if (this.isOnHold !== previous) {
          this.isOnHold = previous;
          this._restoreTransceiverHoldDirection(previous);
          this._applyLocalHoldState(previous);
          this.emit("hold-changed", { onHold: this.isOnHold, pending: false });
        } else {
          this.emit("hold-changed", { onHold: this.isOnHold, pending: false });
        }
      }
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
        body: `Signal=${payload}\r\nDuration=${duration}`
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
}

export { EventEmitter, MediaManager };
