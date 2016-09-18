class BufferSource {
  constructor(audioCtx, buffer, destination) {
    this.audioCtx = audioCtx;
    this.buffer = buffer;
    this.destination = destination;
    this.source = undefined;

    this.play = this._play.bind(this);
    this.stop = this._stop.bind(this);
  }

  _play() {
    console.log('Playing ...');

    if (this.source !== undefined) {
      this.stop();
    }

    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.destination);
    this.source.start(0);
  }

  _stop() {
    console.log('Stopping.');

    if (this.source === undefined) {
      return;
    }

    this.source.stop();
    this.source.disconnect();
    this.source = undefined;
  }
}

export default BufferSource
