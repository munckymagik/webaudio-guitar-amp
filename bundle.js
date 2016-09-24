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

	"use strict";
	var app_1 = __webpack_require__(1);
	window.addEventListener('load', function () { return window.app = app_1.default(); });


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var signalChain_1 = __webpack_require__(2);
	var loadSoundFileSource_1 = __webpack_require__(9);
	var loadUserMediaSource_1 = __webpack_require__(11);
	function app() {
	    console.log('Starting application.');
	    var audioCtx = new AudioContext();
	    var signalChain = signalChain_1.default(audioCtx);
	    var soundFilePromise = loadSoundFileSource_1.default(audioCtx, signalChain);
	    var guitarInputPromise = loadUserMediaSource_1.default(audioCtx, signalChain);
	    Promise.all([soundFilePromise, guitarInputPromise]).then(function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        console.log('All sources loaded');
	        console.log(args);
	    }).catch(function (error) {
	        console.log('Error source loading failed', error);
	    });
	    return {
	        audioCtx: audioCtx,
	        signalChain: signalChain,
	        soundFilePromise: soundFilePromise,
	        guitarInputPromise: guitarInputPromise
	    };
	}
	;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = app;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Amplifer_1 = __webpack_require__(3);
	var Compressor_1 = __webpack_require__(4);
	var Distortion_1 = __webpack_require__(5);
	var LFO_1 = __webpack_require__(6);
	var SlapBackEcho_1 = __webpack_require__(7);
	var WebAudioNodeWrapper_1 = __webpack_require__(8);
	function buildSignalChain(audioCtx) {
	    var distortion = new Distortion_1.default(audioCtx, document.querySelector("[data-module='distortion']"));
	    var compressor = new WebAudioNodeWrapper_1.default(Compressor_1.default(audioCtx));
	    var echo = new SlapBackEcho_1.default(audioCtx, document.querySelector("[data-module='echo']"));
	    var panner = new WebAudioNodeWrapper_1.default(audioCtx.createStereoPanner());
	    var lfo = new LFO_1.default(audioCtx, panner.input().pan, document.querySelector("[data-module='panner']"));
	    var amplifier = new Amplifer_1.default(audioCtx, document.querySelector("[data-module='amplifier']"));
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = buildSignalChain;


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	var Amplifer = (function () {
	    function Amplifer(audioCtx, uiElement) {
	        var _this = this;
	        this.gain = audioCtx.createGain();
	        this.volumeCtrl = uiElement.querySelector('.js-amplifier-volume');
	        this.setValue(this.volumeCtrl.value);
	        this.volumeCtrl.addEventListener('input', function () {
	            _this.setValue(_this.volumeCtrl.value);
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
	    return Amplifer;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Amplifer;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = makeCompressor;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	// Taken from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
	function makeDistortionCurve(amount) {
	    var k = typeof amount === 'number' ? amount : 50;
	    var nSamples = 44100;
	    var curve = new Float32Array(nSamples);
	    var deg = Math.PI / 180;
	    var i = 0;
	    var x;
	    for (; i < nSamples; ++i) {
	        x = i * 2 / nSamples - 1;
	        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
	    }
	    return curve;
	}
	var Distortion = (function () {
	    function Distortion(audioCtx, uiElement) {
	        var self = this;
	        this.amountCtrl = uiElement.querySelector('.js-distortion-amount');
	        this.toneCtrl = uiElement.querySelector('.js-distortion-tone');
	        this.distortion = audioCtx.createWaveShaper();
	        this.distortion.curve = makeDistortionCurve(parseInt(this.amountCtrl.value, 10));
	        this.distortion.oversample = '4x';
	        this.lowPass = audioCtx.createBiquadFilter();
	        this.lowPass.type = 'lowpass';
	        this.lowPass.frequency.value = parseInt(this.toneCtrl.value, 10);
	        this.distortion.connect(this.lowPass);
	        this.amountCtrl.addEventListener('change', function () {
	            self.distortion.curve = makeDistortionCurve(parseInt(self.amountCtrl.value, 10));
	        });
	        this.toneCtrl.addEventListener('input', function () {
	            self.lowPass.frequency.value = parseInt(self.toneCtrl.value, 10);
	        });
	    }
	    Distortion.prototype.connect = function (node) {
	        this.lowPass.connect(node);
	    };
	    Distortion.prototype.input = function () {
	        return this.distortion;
	    };
	    return Distortion;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Distortion;


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = LFO;


/***/ },
/* 7 */
/***/ function(module, exports) {

	// http://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/
	"use strict";
	var SlapBackEcho = (function () {
	    function SlapBackEcho(audioCtx, uiElement) {
	        this._input = audioCtx.createGain();
	        this.output = audioCtx.createGain();
	        var self = this;
	        var delay = audioCtx.createDelay();
	        var feedback = audioCtx.createGain();
	        var wetLevel = audioCtx.createGain();
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
	    SlapBackEcho.prototype.input = function () {
	        return this._input;
	    };
	    return SlapBackEcho;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SlapBackEcho;


/***/ },
/* 8 */
/***/ function(module, exports) {

	//
	// NodeWrapper (for the sake of a consistent interface when chaining stuff together)
	//
	"use strict";
	var WebAudioNodeWrapper = (function () {
	    function WebAudioNodeWrapper(webaudioNode) {
	        this.node = webaudioNode;
	    }
	    WebAudioNodeWrapper.prototype.connect = function (node) {
	        this.node.connect(node);
	    };
	    WebAudioNodeWrapper.prototype.input = function () {
	        return this.node;
	    };
	    return WebAudioNodeWrapper;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = WebAudioNodeWrapper;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var BufferSource_1 = __webpack_require__(10);
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
	        var source = new BufferSource_1.default(audioCtx, buffer, signalChain.distortion.input());
	        console.log('Enabling play/stop');
	        document.querySelector('.js-play').addEventListener('click', source.play);
	        document.querySelector('.js-stop').addEventListener('click', source.stop);
	        return source;
	    });
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = loadSoundFileSource;


/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	var BufferSource = (function () {
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
	    return BufferSource;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = BufferSource;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	__webpack_require__(12);
	function loadUserMediaSource(audioCtx, signalChain) {
	    var options = {
	        audio: {
	            optional: [
	                { echoCancellation: false }
	            ]
	        }
	    };
	    return new Promise(function (resolve, fail) {
	        navigator.getUserMedia(options, function (stream) {
	            console.log('Loading stream.');
	            var source = audioCtx.createMediaStreamSource(stream);
	            source.connect(signalChain.distortion.input());
	            resolve(source);
	        }, function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            fail(args);
	        });
	    });
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = loadUserMediaSource;


/***/ },
/* 12 */
/***/ function(module, exports) {

	navigator.getUserMedia = (navigator.getUserMedia ||
	    navigator.webkitGetUserMedia ||
	    navigator.mozGetUserMedia ||
	    navigator.msGetUserMedia);


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map