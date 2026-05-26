import { WebRTCCore } from "../core/webrtc-core.js";
import { SipCore } from "../core/sip-core.js";
import { PhoneUI } from "./phone-ui.js";
import { createLegacyPhoneAdapter } from "../adapters/legacy-phone-adapter.js";

function createDefaultSignalingBridge() {
  const normalizeIceCandidate = (payload) => {
    const candidate = payload?.candidate;
    if (!candidate) return payload;
    if (typeof candidate.toJSON === "function") {
      return { ...payload, candidate: candidate.toJSON() };
    }
    return payload;
  };
  return {
    sendOffer: async (payload) => window.postMessage({ type: "vphone-signal-offer", payload }, "*"),
    sendAnswer: async (payload) => window.postMessage({ type: "vphone-signal-answer", payload }, "*"),
    sendIceCandidate: async (payload) => window.postMessage({ type: "vphone-signal-ice", payload: normalizeIceCandidate(payload) }, "*"),
    sendControl: async (payload) => window.postMessage({ type: "vphone-signal-control", payload }, "*")
  };
}

export function createModularPhone({ root, config = {}, deps = {} } = {}) {
  const hasSipConfig = !!(
    (config.SipUsername || config.SIPUSER) &&
    (config.SipPassword || config.SIPPASSWORD) &&
    (config.SipDomain || config.DOMAIN) &&
    (config.wssServer || config.WSSSERVER) &&
    (config.WebSocketPort || config.WSSPORT)
  );
  const core = hasSipConfig
    ? new SipCore(config, deps)
    : new WebRTCCore(config, { ...deps, signaling: deps.signaling || createDefaultSignalingBridge() });
  const sdk = {
    core,
    on: (eventName, handler) => core.on(eventName, handler),
    off: (eventName, handler) => core.off(eventName, handler),
    register: () => core.register(),
    unregister: () => core.unregister(),
    toggleRegistration: () => core.toggleRegistration(),
    getRegistrationState: () => core.getRegistrationState(),
    call: (number, options) => core.call(number, options),
    answer: (options) => core.answer(options),
    hangup: () => core.hangup(),
    toggleMute: () => core.toggleMute(),
    hold: () => core.hold(),
    resume: () => core.resume(),
    reconnect: (options) => core.reconnect(options),
    listDevices: () => core.listDevices(),
    switchDevice: (kind, deviceId) => core.switchDevice(kind, deviceId),
    sendDTMF: (digits, options) => core.sendDTMF(digits, options),
    transfer: (target) => core.transfer(target),
    conference: (target) => core.conference(target),
    receiveSignaling: (message) => core.receiveSignaling(message)
  };
  const ui = new PhoneUI({ root, sdk });
  ui.mount();

  const onWindowMessage = (event) => {
    const data = event?.data;
    if (!data || typeof data !== "object") return;
    const rawType = String(data.type || "");
    if (!rawType.startsWith("vphone-signal-")) return;
    let normalizedType = "";
    if (rawType === "vphone-signal-offer") normalizedType = "offer";
    if (rawType === "vphone-signal-answer") normalizedType = "answer";
    if (rawType === "vphone-signal-ice") normalizedType = "ice-candidate";
    if (rawType === "vphone-signal-control") normalizedType = "control";
    if (!normalizedType) return;
    sdk.receiveSignaling({ type: normalizedType, ...(data.payload || {}) });
  };
  window.addEventListener("message", onWindowMessage);

  core.bindAudioElements?.({
    remoteEl: root.querySelector("[data-role='remote-media']"),
    localEl: root.querySelector("[data-role='local-media']")
  });
  core.register?.().catch((err) => {
    core.emit("registration-changed", { online: false, error: String(err?.message || err) });
  });
  const legacyApi = createLegacyPhoneAdapter(sdk);
  const destroy = () => {
    window.removeEventListener("message", onWindowMessage);
    try { core.hangup?.(); } catch {}
    try { core.unregister?.(); } catch {}
  };
  return { core, sdk, ui, legacyApi, destroy };
}
