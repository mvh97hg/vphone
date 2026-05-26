export class UINotifications {
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
  }

  notifyIncomingCall(from) {
    if (!this.enabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification("Incoming call", {
      body: from ? `From ${from}` : "Incoming call"
    });
  }
}
