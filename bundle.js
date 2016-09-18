(function () {
'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

























var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var Amplifer = function () {
  function Amplifer(audioCtx, uiElement) {
    classCallCheck(this, Amplifer);

    var self = this;

    this.gain = audioCtx.createGain();
    this.volumeCtrl = uiElement.querySelector('.js-amplifier-volume');

    self.setValue(self.volumeCtrl.value);
    this.volumeCtrl.addEventListener('input', function () {
      self.setValue(self.volumeCtrl.value);
    });
  }

  createClass(Amplifer, [{
    key: 'connect',
    value: function connect(node) {
      this.gain.connect(node);
    }
  }, {
    key: 'setValue',
    value: function setValue(gainValue) {
      this.gain.gain.value = gainValue;
    }
  }, {
    key: 'input',
    value: function input() {
      return this.gain;
    }
  }]);
  return Amplifer;
}();

// Taken from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50;
  var n_samples = 44100;
  var curve = new Float32Array(n_samples);
  var deg = Math.PI / 180;
  var i = 0;
  var x = void 0;

  for (; i < n_samples; ++i) {
    x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }

  return curve;
}

var Distortion = function () {
  function Distortion(audioCtx, uiElement) {
    classCallCheck(this, Distortion);

    var self = this;

    this.amountCtrl = uiElement.querySelector('.js-distortion-amount');
    this.toneCtrl = uiElement.querySelector('.js-distortion-tone');

    this.distortion = audioCtx.createWaveShaper();
    this.distortion.curve = makeDistortionCurve(parseInt(this.amountCtrl.value));
    this.distortion.oversample = '4x';

    this.lowPass = audioCtx.createBiquadFilter();
    this.lowPass.type = 'lowpass';
    this.lowPass.frequency.value = parseInt(this.toneCtrl.value);

    this.distortion.connect(this.lowPass);

    this.amountCtrl.addEventListener('change', function () {
      self.distortion.curve = makeDistortionCurve(parseInt(self.amountCtrl.value));
    });
    this.toneCtrl.addEventListener('input', function () {
      self.lowPass.frequency.value = parseInt(self.toneCtrl.value);
    });
  }

  createClass(Distortion, [{
    key: 'connect',
    value: function connect(node) {
      this.lowPass.connect(node);
    }
  }, {
    key: 'input',
    value: function input() {
      return this.distortion;
    }
  }]);
  return Distortion;
}();

function LFO(audioCtx, paramToModulate, uiElement) {
  var self = this;

  this.speedCtrl = uiElement.querySelector('.js-lfo-speed');
  this.widthCtrl = uiElement.querySelector('.js-lfo-gain');

  this.lfo = audioCtx.createOscillator();
  this.lfoGain = audioCtx.createGain();

  this.lfo.frequency.value = this.speedCtrl.value;
  this.lfoGain.gain.value = this.widthCtrl.value;

  this.lfo.connect(this.lfoGain);
  this.lfoGain.connect(paramToModulate);
  this.lfo.connect(paramToModulate);

  this.speedCtrl.addEventListener('input', function () {
    self.lfo.frequency.value = self.speedCtrl.value;
  });
  this.widthCtrl.addEventListener('input', function () {
    self.lfoGain.gain.value = self.widthCtrl.value;
  });

  this.lfo.start();
}

// http://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/

var SlapBackEcho = function () {
  function SlapBackEcho(audioCtx, uiElement) {
    classCallCheck(this, SlapBackEcho);

    this._input = audioCtx.createGain();
    this.output = audioCtx.createGain();

    var self = this,
        delay = audioCtx.createDelay(),
        feedback = audioCtx.createGain(),
        wetLevel = audioCtx.createGain();

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

    this.uiWetControl.addEventListener('input', function () {
      wetLevel.gain.value = self.uiWetControl.value;
    });
    this.uiFeedbackControl.addEventListener('input', function () {
      feedback.gain.value = parseFloat(self.uiFeedbackControl.value);
    });
    this.uiDelayControl.addEventListener('input', function () {
      delay.delayTime.value = parseFloat(self.uiDelayControl.value);
    });
  }

  createClass(SlapBackEcho, [{
    key: 'connect',
    value: function connect(node) {
      this.output.connect(node);
    }
  }, {
    key: 'setValue',
    value: function setValue(gainValue) {
      this.gain.gain.value = gainValue;
    }
  }, {
    key: 'input',
    value: function input() {
      return this._input;
    }
  }]);
  return SlapBackEcho;
}();

//
// NodeWrapper (for the sake of a consistent interface when chaining stuff together)
//

var WebAudioNodeWrapper = function () {
  function WebAudioNodeWrapper(webaudioNode) {
    classCallCheck(this, WebAudioNodeWrapper);

    this.node = webaudioNode;
  }

  createClass(WebAudioNodeWrapper, [{
    key: "connect",
    value: function connect(node) {
      this.node.connect(node);
    }
  }, {
    key: "input",
    value: function input() {
      return this.node;
    }
  }]);
  return WebAudioNodeWrapper;
}();

// Based on code from: https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode
function makeCompressor(audioCtx) {
  var compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -50;
  compressor.knee.value = 40;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.25;
  compressor.release.value = 0.25;

  return compressor;
}

function buildSignalChain(audioCtx) {
  var distortion = new Distortion(audioCtx, document.querySelector("[data-module='distortion']"));
  var compressor = new WebAudioNodeWrapper(makeCompressor(audioCtx));
  var echo = new SlapBackEcho(audioCtx, document.querySelector("[data-module='echo']"));
  var panner = new WebAudioNodeWrapper(audioCtx.createStereoPanner());
  var lfo = new LFO(audioCtx, panner.input().pan, document.querySelector("[data-module='panner']"));
  var amplifier = new Amplifer(audioCtx, document.querySelector("[data-module='amplifier']"));

  distortion.connect(compressor.input());
  compressor.connect(echo.input());
  echo.connect(panner.input());
  panner.connect(amplifier.input());
  amplifier.connect(audioCtx.destination);

  return {
    distortion: distortion,
    compressor: compressor,
    echo: echo,
    panner: panner,
    lfo: lfo,
    amplifier: amplifier
  };
}

var BufferSource = function () {
  function BufferSource(audioCtx, buffer, destination) {
    classCallCheck(this, BufferSource);

    this.audioCtx = audioCtx;
    this.buffer = buffer;
    this.destination = destination;
    this.source = undefined;

    this.play = this._play.bind(this);
    this.stop = this._stop.bind(this);
  }

  createClass(BufferSource, [{
    key: '_play',
    value: function _play() {
      console.log('Playing ...');

      if (this.source !== undefined) {
        this.stop();
      }

      this.source = this.audioCtx.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(this.destination);
      this.source.start(0);
    }
  }, {
    key: '_stop',
    value: function _stop() {
      console.log('Stopping.');

      if (this.source === undefined) {
        return;
      }

      this.source.stop();
      this.source.disconnect();
      this.source = undefined;
    }
  }]);
  return BufferSource;
}();

// From http://www.html5rocks.com/en/tutorials/webaudio/intro/
function loadSoundFile(context, url) {
  return new Promise(function (resolve, fail) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function () {
      context.decodeAudioData(request.response, resolve, fail);
    };

    request.send();
  });
}

function loadSoundFileSource(audioCtx, signalChain) {
  return loadSoundFile(audioCtx, '/guitar.mp3').then(function (buffer) {
    console.log('Loaded OK.');
    var source = new BufferSource(audioCtx, buffer, signalChain.distortion.input());

    console.log('Enabling play/stop');
    document.querySelector('.js-play').addEventListener('click', source.play);
    document.querySelector('.js-stop').addEventListener('click', source.stop);

    return source;
  });
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

function loadUserMediaSource(audioCtx, signalChain) {
  var options = {
    audio: {
      optional: [{ echoCancellation: false }]
    }
  };

  return new Promise(function (resolve, fail) {
    navigator.getUserMedia(options, function (stream) {
      console.log('Loading stream.');

      var source = audioCtx.createMediaStreamSource(stream);
      source.connect(signalChain.distortion.input());

      resolve(source);
    }, function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      fail(args);
    });
  });
}

function app() {
  console.log('Starting application.');

  var audioCtx = window.__audioCtx = new AudioContext();
  var signalChain = window.__signalChain = buildSignalChain(audioCtx);

  window.__soundFilePromise = loadSoundFileSource(audioCtx, signalChain);
  window.__guitarInputPromise = loadUserMediaSource(audioCtx, signalChain);

  Promise.all([window.__soundFilePromise, window.__guitarInputPromise], function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    console.log('All sources loaded');
    console.log(args);
  }).catch(function (error) {
    console.log('Error source loading failed', error);
  });
}

window.addEventListener('load', app);

}());
//# sourceMappingURL=bundle.js.map
