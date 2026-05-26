import { EventEmitter } from "./event-emitter.js";
import { MediaManager } from "./media-manager.js";

function buildWsUrl(config) {
  const host = config.wssServer || config.WSSSERVER || "";
  const port = config.WebSocketPort || config.WSSPORT || "";
  const path = config.ServerPath || config.WSSPATH || "/ws";
  if (!host || !port) return "";
  return `wss://${host}:${port}${path}`;
}

export class SipCore extends EventEmitter {
  constructor(config = {}, deps = {}) {
    super();
    this.config = config;
    this.media = deps.mediaManager || new MediaManager(deps);
    this.SIP = deps.SIP || window.SIP;
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

  _bindMedia() {
    this.media.on("local-stream", (stream) => this.emit("local-stream", stream));
  }

  bindAudioElements({ remoteEl, localEl } = {}) {
    this._boundRemoteEl = remoteEl || null;
    this._boundLocalEl = localEl || null;
  }

  async register() {
    if (!this.SIP) throw new Error("SIP.js not loaded");
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
          this.emit("incoming-call", { from: String(invitation.remoteIdentity?.uri || "") });
        }
      };
      await this.userAgent.start();
    }

    await this.registerer.register();
    this.isRegistered = true;
    this.emit("registration-changed", { online: true, user: username });
  }

  async unregister() {
    if (!this.userAgent || !this.registerer) return;
    try {
      await this.registerer.unregister();
    } finally {
      this.isRegistered = false;
      this.emit("registration-changed", { online: false });
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

  toggleMute() {
    if (!this.media.localStream) return false;
    this.isMuted = !this.isMuted;
    for (const track of this.media.localStream.getAudioTracks()) track.enabled = !this.isMuted;
    this.emit("mute-changed", { muted: this.isMuted });
    return this.isMuted;
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
    // Full attended-conference orchestration remains in legacy flow; expose a hook for gradual migration.
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

