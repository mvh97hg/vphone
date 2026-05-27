function buildWsUrl(config) {
  const host = config.wssServer || config.WSSSERVER || "";
  const port = config.WebSocketPort || config.WSSPORT || "443";
  const path = config.ServerPath || config.WSSPATH || "/ws";
  if (!host || !port) return "";
  return `wss://${host}:${port}${path}`;
}

const DEFAULT_SIPJS_URL = "https://dtd6jl0d42sve.cloudfront.net/lib/SipJS/sip-0.20.0.min.js";
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
  }

  async getLocalStream(constraints = { audio: true, video: false }) {
    this.currentConstraints = constraints;
    this.localStream = await this.mediaDevices.getUserMedia(constraints);
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
    this._boundRemoteEl = null;
    this._boundLocalEl = null;
    this._bindMedia();
  }

  configure(config = {}) {
    const before = this.config || {};
    const sipKeys = ["wssServer", "WSSSERVER", "WebSocketPort", "WSSPORT", "ServerPath", "WSSPATH", "SipUsername", "SIPUSER", "SipPassword", "SIPPASSWORD", "SipDomain", "DOMAIN"];
    const changedSipConfig = sipKeys.some((key) => config[key] !== undefined && config[key] !== before[key]);
    this.config = { ...before, ...(config || {}) };
    if (changedSipConfig && this.userAgent && !this.isRegistered) {
      try { this.userAgent.stop?.(); } catch {}
      this.userAgent = null;
      this.registerer = null;
    }
    return this.config;
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
    if (this.userAgent && this.isRegistered) return;

    const wsUrl = buildWsUrl(this.config);
    const username = this.config.SipUsername || this.config.SIPUSER;
    const password = this.config.SipPassword || this.config.SIPPASSWORD;
    const domain = this.config.SipDomain || this.config.DOMAIN;
    if (!wsUrl || !username || !password || !domain) {
      throw new Error("Missing SIP configuration");
    }

    const uri = this.SIP.UserAgent.makeURI(`sip:${username}@${domain}`);
    const transportOptions = { server: wsUrl };
    if (!this.userAgent) {
      this.userAgent = new this.SIP.UserAgent({
        uri,
        authorizationUsername: username,
        authorizationPassword: password,
        transportOptions
      });
      this.registerer = new this.SIP.Registerer(this.userAgent);

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
    }

    await this._registerWithRetry();
    this.isRegistered = true;
    const state = { online: true, user: username };
    this.emit("registration-changed", state);
    return state;
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
    const url = this.config.SipJsUrl || this.config.SIPJS_URL || DEFAULT_SIPJS_URL;
    if (!sipJsLoadPromise) sipJsLoadPromise = loadScript(url);
    await sipJsLoadPromise;
    this.SIP = globalThis.SIP;
    if (!this.SIP) throw new Error("SIP.js not loaded");
    return this.SIP;
  }

  async unregister() {
    if (!this.userAgent || !this.registerer) return;
    try {
      await this.registerer.unregister();
    } finally {
      this.isRegistered = false;
      const state = { online: false };
      this.emit("registration-changed", state);
      return state;
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
    return { online: !!this.isRegistered };
  }

  async call(target, options = {}) {
    await this.register();
    this.lastOutgoingTarget = target;
    const domain = this.config.SipDomain || this.config.DOMAIN;
    const targetUri = this.SIP.UserAgent.makeURI(`sip:${target}@${domain}`);
    const inviter = new this.SIP.Inviter(this.userAgent, targetUri);
    this.session = inviter;
    this._wireSession(inviter, "outgoing");
    const constraints = options.constraints || { audio: true, video: !!options.video };
    const localStream = await this.media.getLocalStream(constraints);
    this._attachLocal(localStream);
    const pcOpts = {
      sessionDescriptionHandlerOptions: {
        constraints,
        localMediaStream: localStream
      }
    };
    await inviter.invite(pcOpts);
    this.emit("outgoing-call", { target });
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
    const constraints = options.constraints || { audio: true, video: !!options.video };
    const localStream = await this.media.getLocalStream(constraints);
    this._attachLocal(localStream);
    await this.session.accept({
      sessionDescriptionHandlerOptions: {
        constraints,
        localMediaStream: localStream
      }
    });
  }

  hangup() {
    if (this.session) {
      if (typeof this.session.bye === "function") this.session.bye();
      else if (typeof this.session.cancel === "function") this.session.cancel();
      else if (typeof this.session.reject === "function") this.session.reject();
    }
    this.media.stopLocalStream();
    this.session = null;
    this.isMuted = false;
    this.isOnHold = false;
    this.emit("call-ended");
  }

  mute(forceMuted) {
    if (!this.media.localStream) return false;
    this.isMuted = typeof forceMuted === "boolean" ? forceMuted : !this.isMuted;
    for (const track of this.media.localStream.getAudioTracks()) track.enabled = !this.isMuted;
    this.emit("mute-changed", { muted: this.isMuted });
    return this.isMuted;
  }

  unmute() {
    if (!this.media.localStream) return false;
    this.isMuted = false;
    for (const track of this.media.localStream.getAudioTracks()) track.enabled = true;
    this.emit("mute-changed", { muted: false });
    return false;
  }

  toggleMute() {
    return this.isMuted ? this.unmute() : this.mute();
  }

  async hold() {
    if (!this.session || typeof this.session.invite !== "function") return;
    this.isOnHold = true;
    this.emit("hold-changed", { onHold: true });
  }

  async resume() {
    this.isOnHold = false;
    this.emit("hold-changed", { onHold: false });
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
    const domain = this.config.SipDomain || this.config.DOMAIN;
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
