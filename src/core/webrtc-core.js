import { EventEmitter } from "./event-emitter.js";
import { SignalingClient } from "./signaling.js";
import { MediaManager } from "./media-manager.js";
import { PeerManager } from "./peer-manager.js";
import { CallStateStore, CallStates } from "./call-state.js";

export class WebRTCCore extends EventEmitter {
  constructor(config = {}, deps = {}) {
    super();
    this.config = config;
    this.media = deps.mediaManager || new MediaManager(deps);
    this.signaling = deps.signalingClient || new SignalingClient(deps.signaling || {});
    this.peers =
      deps.peerManager ||
      new PeerManager({
        PeerConnection: deps.PeerConnection || RTCPeerConnection,
        rtcConfig: config.rtcConfig || {}
      });
    this.callState = deps.callState || new CallStateStore();
    this.currentCall = null;
    this.lastOutgoingCall = null;
    this.isMuted = false;
    this.isOnHold = false;
    this.isRegistered = false;
    this._boundRemoteEl = null;
    this._boundLocalEl = null;
    this.#bindEvents();
  }

  #bindEvents() {
    this.media.on("local-stream", (stream) => {
      if (this._boundLocalEl) this._boundLocalEl.srcObject = stream;
      this.emit("local-stream", stream);
    });
    this.peers.on("remote-stream", (stream) => {
      if (this._boundRemoteEl) this._boundRemoteEl.srcObject = stream;
      this.emit("remote-stream", stream);
    });
    this.peers.on("ice-candidate-local", async (candidate) => {
      await this.signaling.sendIceCandidate({ candidate });
      this.emit("ice-candidate-local", candidate);
    });
    this.callState.on("state-changed", (payload) => this.emit("call-state", payload));

    this.signaling.on("offer", async (msg) => this.#handleRemoteOffer(msg));
    this.signaling.on("answer", async (msg) => this.#handleRemoteAnswer(msg));
    this.signaling.on("ice-candidate", async (msg) => this.#handleRemoteIce(msg));
  }

  bindAudioElements({ remoteEl, localEl } = {}) {
    this._boundRemoteEl = remoteEl || null;
    this._boundLocalEl = localEl || null;
  }

  async register() {
    this.isRegistered = true;
    this.emit("registration-changed", { online: true, user: this.config.profileUserID || "webrtc" });
  }

  async unregister() {
    this.isRegistered = false;
    this.emit("registration-changed", { online: false });
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
    if (!this.isRegistered) await this.register();
    this.currentCall = { target, direction: "outgoing", options };
    this.lastOutgoingCall = { target, options };
    this.callState.transition(CallStates.OUTGOING, this.currentCall);
    const local = await this.media.getLocalStream(options.constraints || { audio: true, video: !!options.video });
    const pc = this.peers.ensurePeerConnection();
    this.peers.addLocalStream(local);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this.signaling.sendOffer({ target, type: offer.type, sdp: offer.sdp });
    this.emit("outgoing-call", { target });
  }

  async reconnect(options = {}) {
    if (!this.lastOutgoingCall?.target) throw new Error("No previous outgoing call to reconnect");
    const nextTarget = this.lastOutgoingCall.target;
    const nextOptions = { ...(this.lastOutgoingCall.options || {}), ...options };
    this.emit("reconnect-started", { target: nextTarget });
    this.hangup();
    await this.call(nextTarget, nextOptions);
    this.emit("reconnect-complete", { target: nextTarget });
    return { target: nextTarget };
  }

  async answer(options = {}) {
    const pc = this.peers.ensurePeerConnection();
    if (!pc.remoteDescription) throw new Error("No remote offer to answer");
    const local = await this.media.getLocalStream(options.constraints || { audio: true, video: !!options.video });
    this.peers.addLocalStream(local);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await this.signaling.sendAnswer({ type: answer.type, sdp: answer.sdp });
    this.callState.transition(CallStates.CONNECTED, { direction: "incoming" });
    this.emit("call-connected", { direction: "incoming" });
  }

  hangup() {
    this.peers.close();
    this.media.stopLocalStream();
    this.currentCall = null;
    this.isMuted = false;
    this.isOnHold = false;
    this.callState.transition(CallStates.ENDED);
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
    this.isOnHold = true;
    this.callState.transition(CallStates.HOLD);
    await this.signaling.sendControl({ action: "hold" });
    this.emit("hold-changed", { onHold: true });
  }

  async resume() {
    this.isOnHold = false;
    this.callState.transition(CallStates.CONNECTED);
    await this.signaling.sendControl({ action: "resume" });
    this.emit("hold-changed", { onHold: false });
  }

  switchDevice(kind, deviceId) {
    return this.media.switchDevice(kind, deviceId);
  }

  listDevices() {
    return this.media.listDevices();
  }

  async sendDTMF(digits, options = {}) {
    const payload = String(digits || "").trim();
    if (!payload) return;
    await this.signaling.sendControl({ action: "dtmf", digits: payload, duration: Number(options.duration || 160) });
    this.emit("dtmf-sent", { digits: payload });
  }

  async transfer(target) {
    const value = String(target || "").trim();
    if (!value) throw new Error("Transfer target is required");
    await this.signaling.sendControl({ action: "transfer", target: value });
    this.emit("transfer-requested", { target: value });
  }

  async conference(target) {
    const value = String(target || "").trim();
    if (!value) throw new Error("Conference target is required");
    await this.signaling.sendControl({ action: "conference", target: value });
    this.emit("conference-requested", { target: value });
  }

  receiveSignaling(message) {
    this.signaling.receive(message);
  }

  async #handleRemoteOffer(msg) {
    const pc = this.peers.ensurePeerConnection();
    this.currentCall = { direction: "incoming", from: msg.from, target: msg.target };
    await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: msg.sdp }));
    this.callState.transition(CallStates.RINGING, this.currentCall);
    this.emit("incoming-call", this.currentCall);
  }

  async #handleRemoteAnswer(msg) {
    const pc = this.peers.ensurePeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: msg.sdp }));
    this.callState.transition(CallStates.CONNECTED, this.currentCall || {});
    this.emit("call-connected", { direction: "outgoing" });
  }

  async #handleRemoteIce(msg) {
    const pc = this.peers.ensurePeerConnection();
    if (!msg?.candidate) return;
    await pc.addIceCandidate(msg.candidate);
    this.emit("ice-candidate-remote", msg.candidate);
  }
}
