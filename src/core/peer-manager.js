import { EventEmitter } from "./event-emitter.js";

export class PeerManager extends EventEmitter {
  constructor({ PeerConnection = RTCPeerConnection, rtcConfig = {} } = {}) {
    super();
    this.PeerConnection = PeerConnection;
    this.rtcConfig = rtcConfig;
    this.pc = null;
  }

  ensurePeerConnection() {
    if (this.pc) return this.pc;
    this.pc = new this.PeerConnection(this.rtcConfig);
    this.pc.onicecandidate = (event) => {
      if (event.candidate) this.emit("ice-candidate-local", event.candidate);
    };
    this.pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) this.emit("remote-stream", stream);
    };
    this.emit("peer-created", this.pc);
    return this.pc;
  }

  addLocalStream(stream) {
    const pc = this.ensurePeerConnection();
    const existing = pc.getSenders().map((s) => s.track).filter(Boolean);
    for (const track of stream.getTracks()) {
      if (!existing.includes(track)) pc.addTrack(track, stream);
    }
  }

  close() {
    if (!this.pc) return;
    this.pc.ontrack = null;
    this.pc.onicecandidate = null;
    this.pc.close();
    this.pc = null;
    this.emit("peer-closed");
  }
}
