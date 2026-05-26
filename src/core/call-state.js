import { EventEmitter } from "./event-emitter.js";

export const CallStates = Object.freeze({
  IDLE: "idle",
  OUTGOING: "outgoing",
  RINGING: "ringing",
  CONNECTED: "connected",
  HOLD: "hold",
  ENDED: "ended"
});

export class CallStateStore extends EventEmitter {
  constructor() {
    super();
    this.state = CallStates.IDLE;
    this.context = {};
  }

  transition(nextState, context = {}) {
    const prevState = this.state;
    this.state = nextState;
    this.context = { ...this.context, ...context };
    this.emit("state-changed", {
      prevState,
      nextState,
      context: this.context
    });
  }
}
