(function () {
'use strict';

class Amplifer {
  constructor(audioCtx, uiElement) {
    const self = this;

    this.gain = audioCtx.createGain();
    this.volumeCtrl = uiElement.querySelector('.js-amplifier-volume');

    self.setValue(self.volumeCtrl.value);
    this.volumeCtrl.addEventListener('input', () => {
      self.setValue(self.volumeCtrl.value);
    });
  }

  connect(node) {
    this.gain.connect(node);
  }

  setValue(gainValue) {
    this.gain.gain.value = gainValue;
  }

  input() {
    return this.gain;
  }
}

// Taken from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  let i = 0;
  let x;

  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }

  return curve;
}

class Distortion {
  constructor(audioCtx, uiElement) {
    const self = this;

    this.amountCtrl = uiElement.querySelector('.js-distortion-amount');
    this.toneCtrl = uiElement.querySelector('.js-distortion-tone');

    this.distortion = audioCtx.createWaveShaper();
    this.distortion.curve = makeDistortionCurve(parseInt(this.amountCtrl.value));
    this.distortion.oversample = '4x';

    this.lowPass = audioCtx.createBiquadFilter();
    this.lowPass.type = 'lowpass';
    this.lowPass.frequency.value = parseInt(this.toneCtrl.value);

    this.distortion.connect(this.lowPass);

    this.amountCtrl.addEventListener('change', () => {
      self.distortion.curve = makeDistortionCurve(parseInt(self.amountCtrl.value));
    });
    this.toneCtrl.addEventListener('input', () => {
      self.lowPass.frequency.value = parseInt(self.toneCtrl.value);
    });
  }

  connect(node) {
    this.lowPass.connect(node);
  }

  input() {
    return this.distortion;
  }
}

function LFO(audioCtx, paramToModulate, uiElement) {
  const self = this;

  this.speedCtrl = uiElement.querySelector('.js-lfo-speed');
  this.widthCtrl = uiElement.querySelector('.js-lfo-gain');

  this.lfo = audioCtx.createOscillator();
  this.lfoGain = audioCtx.createGain();

  this.lfo.frequency.value = this.speedCtrl.value;
  this.lfoGain.gain.value = this.widthCtrl.value;

  this.lfo.connect(this.lfoGain);
  this.lfoGain.connect(paramToModulate);
  this.lfo.connect(paramToModulate);

  this.speedCtrl.addEventListener('input', () => {
    self.lfo.frequency.value = self.speedCtrl.value;
  });
  this.widthCtrl.addEventListener('input', () => {
    self.lfoGain.gain.value = self.widthCtrl.value;
  });

  this.lfo.start();
}

// http://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/

class SlapBackEcho {
  constructor(audioCtx, uiElement) {
    this._input = audioCtx.createGain();
    this.output = audioCtx.createGain();

    const self = this, delay = audioCtx.createDelay(), feedback = audioCtx.createGain(), wetLevel = audioCtx.createGain();

    this.uiWetControl = uiElement.querySelector('.js-echo-mix');
    this.uiFeedbackControl = uiElement.querySelector('.js-echo-feedback');
    this.uiDelayControl = uiElement.querySelector('.js-echo-delay');

    this._input.gain.value = 1.0;
    this.output.gain.value = 1.0;
    delay.delayTime.value = parseFloat(this.uiDelayControl.value);
    feedback.gain.value = parseFloat(this.uiFeedbackControl.value);
    wetLevel.gain.value = this.uiWetControl.value;

    this._input.connect(delay);
    this._input.connect(this.output);

    delay.connect(feedback);
    delay.connect(wetLevel);
    feedback.connect(delay);
    wetLevel.connect(this.output);

    this.uiWetControl.addEventListener('input', () => {
      wetLevel.gain.value = self.uiWetControl.value;
    });
    this.uiFeedbackControl.addEventListener('input', () => {
      feedback.gain.value = parseFloat(self.uiFeedbackControl.value);
    });
    this.uiDelayControl.addEventListener('input', () => {
      delay.delayTime.value = parseFloat(self.uiDelayControl.value);
    });
  }

  connect(node) {
    this.output.connect(node);
  }

  setValue(gainValue) {
    this.gain.gain.value = gainValue;
  }

  input() {
    return this._input;
  }
}

//
// NodeWrapper (for the sake of a consistent interface when chaining stuff together)
//

class WebAudioNodeWrapper {
  constructor(webaudioNode) {
    this.node = webaudioNode;
  }

  connect(node) {
    this.node.connect(node);
  }

  input() {
    return this.node;
  }
}

// Based on code from: https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode
function makeCompressor(audioCtx) {
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -50;
  compressor.knee.value = 40;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.25;
  compressor.release.value = 0.25;

  return compressor;
}

function buildSignalChain(audioCtx) {
  const distortion = new Distortion(audioCtx, document.querySelector("[data-module='distortion']"));
  const compressor = new WebAudioNodeWrapper(makeCompressor(audioCtx));
  const echo = new SlapBackEcho(audioCtx, document.querySelector("[data-module='echo']"));
  const panner = new WebAudioNodeWrapper(audioCtx.createStereoPanner());
  const lfo = new LFO(audioCtx, panner.input().pan, document.querySelector("[data-module='panner']"));
  const amplifier = new Amplifer(audioCtx, document.querySelector("[data-module='amplifier']"));

  distortion.connect(compressor.input());
  compressor.connect(echo.input());
  echo.connect(panner.input());
  panner.connect(amplifier.input());
  amplifier.connect(audioCtx.destination);

  return {
    distortion,
    compressor,
    echo,
    panner,
    lfo,
    amplifier
  };
}

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

// From http://www.html5rocks.com/en/tutorials/webaudio/intro/
function loadSoundFile(context, url) {
  return new Promise((resolve, fail) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = () => {
      context.decodeAudioData(request.response, resolve, fail);
    };

    request.send();
  });
}

function loadSoundFileSource(audioCtx, signalChain) {
  return loadSoundFile(audioCtx, '/guitar.mp3').then(buffer => {
    console.log('Loaded OK.');
    const source = new BufferSource(audioCtx, buffer, signalChain.distortion.input());

    console.log('Enabling play/stop');
    document.querySelector('.js-play').addEventListener('click', source.play);
    document.querySelector('.js-stop').addEventListener('click', source.stop);

    return source;
  });
}

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

function loadUserMediaSource(audioCtx, signalChain) {
  const options = {
    audio: {
      optional: [
        { echoCancellation: false }
      ]
    }
  };

  return new Promise((resolve, fail) => {
    navigator.getUserMedia(
      options,
      stream => {
        console.log('Loading stream.');

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(signalChain.distortion.input());

        resolve(source);
      },
      (...args) => {
        fail(args);
      }
    );
  });
}

function app() {
  console.log('Starting application.');

  const audioCtx = window.__audioCtx = new AudioContext();
  const signalChain = window.__signalChain = buildSignalChain(audioCtx);

  window.__soundFilePromise = loadSoundFileSource(audioCtx, signalChain);
  window.__guitarInputPromise = loadUserMediaSource(audioCtx, signalChain);

  Promise.all([window.__soundFilePromise, window.__guitarInputPromise], (...args) => {
    console.log('All sources loaded');
    console.log(args);
  }).catch(error => {
    console.log('Error source loading failed', error);
  });
}

window.addEventListener('load', app)

}());
//# sourceMappingURL=bundle.js.map
