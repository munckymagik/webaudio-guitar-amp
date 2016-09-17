/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _app = __webpack_require__(1);
	
	var _app2 = _interopRequireDefault(_app);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var whatev = function whatev() {
	  return true;
	};
	
	window.addEventListener('load', _app2.default);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _signalChain = __webpack_require__(2);
	
	var _signalChain2 = _interopRequireDefault(_signalChain);
	
	var _loadSoundFileSource = __webpack_require__(9);
	
	var _loadSoundFileSource2 = _interopRequireDefault(_loadSoundFileSource);
	
	var _loadUserMediaSource = __webpack_require__(11);
	
	var _loadUserMediaSource2 = _interopRequireDefault(_loadUserMediaSource);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function app() {
	  console.log('Starting application.');
	
	  var audioCtx = window.__audioCtx = new AudioContext();
	  var signalChain = window.__signalChain = (0, _signalChain2.default)(audioCtx);
	
	  window.__soundFilePromise = (0, _loadSoundFileSource2.default)(audioCtx, signalChain);
	  window.__guitarInputPromise = (0, _loadUserMediaSource2.default)(audioCtx, signalChain);
	
	  Promise.all([window.__soundFilePromise, window.__guitarInputPromise], function () {
	    console.log('All sources loaded');
	    console.log(arguments);
	  }).catch(function (error) {
	    console.log('Error source loading failed', error);
	  });
	};
	
	exports.default = app;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _Amplifer = __webpack_require__(3);
	
	var _Amplifer2 = _interopRequireDefault(_Amplifer);
	
	var _Distortion = __webpack_require__(4);
	
	var _Distortion2 = _interopRequireDefault(_Distortion);
	
	var _LFO = __webpack_require__(5);
	
	var _LFO2 = _interopRequireDefault(_LFO);
	
	var _SlapBackEcho = __webpack_require__(6);
	
	var _SlapBackEcho2 = _interopRequireDefault(_SlapBackEcho);
	
	var _WebAudioNodeWrapper = __webpack_require__(7);
	
	var _WebAudioNodeWrapper2 = _interopRequireDefault(_WebAudioNodeWrapper);
	
	var _Compressor = __webpack_require__(8);
	
	var _Compressor2 = _interopRequireDefault(_Compressor);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function buildSignalChain(audioCtx) {
	  var distortion = new _Distortion2.default(audioCtx, document.querySelector("[data-module='distortion']"));
	  var compressor = new _WebAudioNodeWrapper2.default((0, _Compressor2.default)(audioCtx));
	  var echo = new _SlapBackEcho2.default(audioCtx, document.querySelector("[data-module='echo']"));
	  var panner = new _WebAudioNodeWrapper2.default(audioCtx.createStereoPanner());
	  var lfo = new _LFO2.default(audioCtx, panner.input().pan, document.querySelector("[data-module='panner']"));
	  var amplifier = new _Amplifer2.default(audioCtx, document.querySelector("[data-module='amplifier']"));
	
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
	
	exports.default = buildSignalChain;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function Amplifer(audioCtx, uiElement) {
	  var self = this;
	
	  this.gain = audioCtx.createGain();
	  this.volumeCtrl = uiElement.querySelector('.js-amplifier-volume');
	
	  self.setValue(self.volumeCtrl.value);
	  this.volumeCtrl.addEventListener('input', function () {
	    self.setValue(self.volumeCtrl.value);
	  });
	}
	
	Amplifer.prototype.connect = function (node) {
	  this.gain.connect(node);
	};
	
	Amplifer.prototype.setValue = function (gainValue) {
	  this.gain.gain.value = gainValue;
	};
	
	Amplifer.prototype.input = function () {
	  return this.gain;
	};
	
	exports.default = Amplifer;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// Taken from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
	function makeDistortionCurve(amount) {
	  var k = typeof amount === 'number' ? amount : 50,
	      n_samples = 44100,
	      curve = new Float32Array(n_samples),
	      deg = Math.PI / 180,
	      i = 0,
	      x;
	
	  for (; i < n_samples; ++i) {
	    x = i * 2 / n_samples - 1;
	    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
	  }
	
	  return curve;
	}
	
	function Distortion(audioCtx, uiElement) {
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
	
	Distortion.prototype.connect = function (node) {
	  this.lowPass.connect(node);
	};
	
	Distortion.prototype.input = function () {
	  return this.distortion;
	};
	
	exports.default = Distortion;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
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
	
	exports.default = LFO;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// http://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/
	
	function SlapBackEcho(audioCtx, uiElement) {
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
	
	SlapBackEcho.prototype.connect = function (node) {
	  this.output.connect(node);
	};
	
	SlapBackEcho.prototype.setValue = function (gainValue) {
	  this.gain.gain.value = gainValue;
	};
	
	SlapBackEcho.prototype.input = function () {
	  return this._input;
	};
	
	exports.default = SlapBackEcho;

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	//
	// NodeWrapper (for the sake of a consistent interface when chaining stuff together)
	//
	
	function WebAudioNodeWrapper(webaudioNode) {
	  this.node = webaudioNode;
	}
	
	WebAudioNodeWrapper.prototype.connect = function (node) {
	  this.node.connect(node);
	};
	
	WebAudioNodeWrapper.prototype.input = function () {
	  return this.node;
	};
	
	exports.default = WebAudioNodeWrapper;

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
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
	
	exports.default = makeCompressor;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _BufferSource = __webpack_require__(10);
	
	var _BufferSource2 = _interopRequireDefault(_BufferSource);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
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
	    var source = new _BufferSource2.default(audioCtx, buffer, signalChain.distortion.input());
	
	    console.log('Enabling play/stop');
	    document.querySelector('.js-play').addEventListener('click', source.play);
	    document.querySelector('.js-stop').addEventListener('click', source.stop);
	
	    return source;
	  });
	}
	
	exports.default = loadSoundFileSource;

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function BufferSource(audioCtx, buffer, destination) {
	  this.audioCtx = audioCtx;
	  this.buffer = buffer;
	  this.destination = destination;
	  this.source = undefined;
	
	  this.play = this._play.bind(this);
	  this.stop = this._stop.bind(this);
	}
	
	BufferSource.prototype._play = function () {
	  console.log('Playing ...');
	
	  if (this.source !== undefined) {
	    this.stop();
	  }
	
	  this.source = this.audioCtx.createBufferSource();
	  this.source.buffer = this.buffer;
	  this.source.connect(this.destination);
	  this.source.start(0);
	};
	
	BufferSource.prototype._stop = function () {
	  console.log('Stopping.');
	
	  if (this.source === undefined) {
	    return;
	  }
	
	  this.source.stop();
	  this.source.disconnect();
	  this.source = undefined;
	};
	
	exports.default = BufferSource;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	__webpack_require__(12);
	
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
	      fail(arguments);
	    });
	  });
	}
	
	exports.default = loadUserMediaSource;

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map