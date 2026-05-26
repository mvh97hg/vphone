export function createLegacyPhoneAdapter(sdk) {
  return {
    on: (eventName, handler) => sdk.on(eventName, handler),
    register: () => sdk.register(),
    unregister: () => sdk.unregister(),
    toggleRegistration: () => sdk.toggleRegistration(),
    getRegistrationState: () => sdk.getRegistrationState(),
    call: (number, options) => sdk.call(number, options),
    answer: (options) => sdk.answer(options),
    hangup: () => sdk.hangup(),
    toggleMute: () => sdk.toggleMute(),
    hold: () => sdk.hold(),
    resume: () => sdk.resume(),
    reconnect: (options) => sdk.reconnect(options),
    listDevices: () => sdk.listDevices(),
    switchDevice: (kind, deviceId) => sdk.switchDevice(kind, deviceId),
    sendDTMF: (digits, options) => sdk.sendDTMF(digits, options),
    transfer: (target) => sdk.transfer(target),
    conference: (target) => sdk.conference(target),
    receiveSignaling: (message) => sdk.receiveSignaling(message)
  };
}
