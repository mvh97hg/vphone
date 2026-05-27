import { PhoneCore } from "../core/phone-core.js";

function configFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  const keys = ["wssServer", "WebSocketPort", "ServerPath", "profileName", "SipDomain", "SipUsername", "SipPassword"];
  const config = {};
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value !== null && value !== "") config[key] = value;
  }
  return config;
}

export class PhoneSDK {
  constructor(config = {}, deps = {}) {
    const mergedConfig = { ...configFromStorage(), ...(config || {}) };
    this.core = deps.core || new PhoneCore(mergedConfig, deps);
  }

  on(eventName, handler) {
    return this.core.on(eventName, handler);
  }

  off(eventName, handler) {
    this.core.off(eventName, handler);
  }

  configure(config = {}) {
    return this.core.configure?.(config);
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

  hangup() {
    return this.core.hangup();
  }

  mute() {
    return this.core.mute();
  }

  hold() {
    return this.core.hold();
  }

  resume() {
    return this.core.resume();
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
}
