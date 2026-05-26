import { EventEmitter } from "./event-emitter.js";

export class SignalingClient extends EventEmitter {
  constructor({ sendOffer, sendAnswer, sendIceCandidate, sendControl } = {}) {
    super();
    this.transport = {
      sendOffer,
      sendAnswer,
      sendIceCandidate,
      sendControl
    };
  }

  async sendOffer(payload) {
    if (!this.transport.sendOffer) throw new Error("sendOffer transport is missing");
    await this.transport.sendOffer(payload);
  }

  async sendAnswer(payload) {
    if (!this.transport.sendAnswer) throw new Error("sendAnswer transport is missing");
    await this.transport.sendAnswer(payload);
  }

  async sendIceCandidate(payload) {
    if (!this.transport.sendIceCandidate) throw new Error("sendIceCandidate transport is missing");
    await this.transport.sendIceCandidate(payload);
  }

  async sendControl(payload) {
    if (!this.transport.sendControl) return;
    await this.transport.sendControl(payload);
  }

  receive(message) {
    this.emit("message", message);
    this.emit(message?.type || "unknown", message);
  }
}
