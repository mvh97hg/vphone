import { EventEmitter } from "./event-emitter.js";

export class MediaManager extends EventEmitter {
  constructor({ mediaDevices = navigator.mediaDevices } = {}) {
    super();
    this.mediaDevices = mediaDevices;
    this.localStream = null;
    this.currentConstraints = { audio: true, video: false };
    this.preferredDeviceIds = {
      audioinput: "",
      videoinput: "",
      audiooutput: ""
    };
  }

  async getLocalStream(constraints = { audio: true, video: false }) {
    this.currentConstraints = constraints;
    this.localStream = await this.mediaDevices.getUserMedia(constraints);
    this.emit("local-stream", this.localStream);
    return this.localStream;
  }

  async listDevices() {
    if (!this.mediaDevices || typeof this.mediaDevices.enumerateDevices !== "function") {
      return [];
    }
    return this.mediaDevices.enumerateDevices();
  }

  stopLocalStream() {
    if (!this.localStream) return;
    for (const track of this.localStream.getTracks()) track.stop();
    this.emit("local-stream-stopped", this.localStream);
    this.localStream = null;
  }

  async switchDevice(kind, deviceId) {
    if (!kind || !deviceId) throw new Error("kind and deviceId are required");
    const normalizedKind = String(kind).toLowerCase();
    const mediaKind = normalizedKind === "audio" ? "audioinput" : normalizedKind === "video" ? "videoinput" : normalizedKind;
    if (mediaKind !== "audioinput" && mediaKind !== "videoinput" && mediaKind !== "audiooutput") {
      throw new Error(`Unsupported device kind: ${kind}`);
    }
    this.preferredDeviceIds[mediaKind] = deviceId;

    if (!this.localStream || mediaKind === "audiooutput") {
      // audiooutput is applied by UI element.setSinkId and tracked as preference only.
      this.emit("device-switch-requested", { kind: mediaKind, deviceId });
      return { kind: mediaKind, deviceId, stream: this.localStream };
    }

    const existingAudio = this.localStream.getAudioTracks();
    const existingVideo = this.localStream.getVideoTracks();
    const constraints = {
      audio: mediaKind === "audioinput"
        ? { deviceId: { exact: deviceId } }
        : existingAudio.length > 0,
      video: mediaKind === "videoinput"
        ? { deviceId: { exact: deviceId } }
        : existingVideo.length > 0
    };

    const nextStream = await this.mediaDevices.getUserMedia(constraints);
    if (mediaKind === "audioinput") {
      const [nextAudio] = nextStream.getAudioTracks();
      if (nextAudio) this.#replaceTrack(existingAudio, nextAudio);
      for (const track of nextStream.getVideoTracks()) track.stop();
    }
    if (mediaKind === "videoinput") {
      const [nextVideo] = nextStream.getVideoTracks();
      if (nextVideo) this.#replaceTrack(existingVideo, nextVideo);
      for (const track of nextStream.getAudioTracks()) track.stop();
    }

    this.emit("device-switch-requested", { kind, deviceId });
    this.emit("local-stream", this.localStream);
    return { kind: mediaKind, deviceId, stream: this.localStream };
  }

  #replaceTrack(existingTracks, nextTrack) {
    for (const track of existingTracks) {
      this.localStream.removeTrack(track);
      track.stop();
    }
    this.localStream.addTrack(nextTrack);
  }
}
