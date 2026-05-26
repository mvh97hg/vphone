import { WebRTCCore } from "../core/webrtc-core.js";

export class PhoneSDK {
  constructor(config = {}, deps = {}) {
    this.core = new WebRTCCore(config, deps);
  }

  on(eventName, handler) {
    return this.core.on(eventName, handler);
  }

  off(eventName, handler) {
    this.core.off(eventName, handler);
  }

  call(number, options) {
    return this.core.call(number, options);
  }

  answer(options) {
    return this.core.answer(options);
  }

  hangup() {
    return this.core.hangup();
  }

  toggleMute() {
    return this.core.toggleMute();
  }

  hold() {
    return this.core.hold();
  }

  resume() {
    return this.core.resume();
  }

  reconnect(options) {
    return this.core.reconnect(options);
  }

  register() {
    return this.core.register();
  }

  unregister() {
    return this.core.unregister();
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

  sendDTMF(digits, options) {
    return this.core.sendDTMF(digits, options);
  }

  transfer(target) {
    return this.core.transfer(target);
  }

  conference(target) {
    return this.core.conference(target);
  }

  switchDevice(kind, deviceId) {
    return this.core.switchDevice(kind, deviceId);
  }

  receiveSignaling(message) {
    return this.core.receiveSignaling(message);
  }
}
