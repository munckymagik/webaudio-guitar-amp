(function() {
  "use strict";

  //
  // Shims --------------------------------------------------------------------
  //

  navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);

  //
  // SlapBackDelay ------------------------------------------------------------
  //

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

    this.uiWetControl.addEventListener('input', function() {
      wetLevel.gain.value = self.uiWetControl.value;
    });
    this.uiFeedbackControl.addEventListener('input', function() {
      feedback.gain.value = parseFloat(self.uiFeedbackControl.value);
    });
    this.uiDelayControl.addEventListener('input', function() {
      delay.delayTime.value = parseFloat(self.uiDelayControl.value);
    });
  }

  SlapBackEcho.prototype.connect = function(node) {
    this.output.connect(node);
  };

  SlapBackEcho.prototype.setValue = function(gainValue) {
    this.gain.gain.value = gainValue;
  };

  SlapBackEcho.prototype.input = function() {
    return this._input;
  };

  //
  // Mixer ---------------------------------------------------------------------
  //

  function Amplifer(audioCtx, uiElement) {
    var self = this;

    this.gain = audioCtx.createGain();
    this.volumeCtrl = uiElement.querySelector('.js-amplifier-volume');

    self.setValue(self.volumeCtrl.value);
    this.volumeCtrl.addEventListener('input', function() {
      self.setValue(self.volumeCtrl.value);
    });
  }

  Amplifer.prototype.connect = function(node) {
    this.gain.connect(node);
  };

  Amplifer.prototype.setValue = function(gainValue) {
    this.gain.gain.value = gainValue;
  };

  Amplifer.prototype.input = function() {
    return this.gain;
  };

  //
  // Distortion
  //

  function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;

    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
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

    this.amountCtrl.addEventListener('change', function() {
      self.distortion.curve = makeDistortionCurve(parseInt(self.amountCtrl.value));
    });
    this.toneCtrl.addEventListener('input', function() {
      self.lowPass.frequency.value = parseInt(self.toneCtrl.value);
    });
  }

  Distortion.prototype.connect = function(node) {
    this.lowPass.connect(node);
  };

  Distortion.prototype.input = function() {
    return this.distortion;
  };

  //
  // LFO
  //

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

    this.speedCtrl.addEventListener('input', function() {
      self.lfo.frequency.value = self.speedCtrl.value;
    });
    this.widthCtrl.addEventListener('input', function() {
      self.lfoGain.gain.value = self.widthCtrl.value;
    });

    this.lfo.start();
  }

  //
  // Compressor
  //

  function makeCompressor(audioCtx) {
    var compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.reduction.value = -20;
    compressor.attack.value = 0.25;
    compressor.release.value = 0.25;

    return compressor;
  }

  //
  // MAIN ---------------------------------------------------------------------
  //

  window.addEventListener('load', function() {
    console.log('On Load.');

    var audioCtx = window.__audioCtx = new AudioContext();

    navigator.getUserMedia({ audio: { optional: [ { echoCancellation: false } ] } },
      function(stream) {
        console.log('stream.');
        var source = window.__source = audioCtx.createMediaStreamSource(stream);
        var distortion = new Distortion(audioCtx, document.querySelector("[data-module='distortion']"));
        var compressor = makeCompressor(audioCtx);
        var echo = new SlapBackEcho(audioCtx, document.querySelector("[data-module='echo']"));
        var amplifier = new Amplifer(audioCtx, document.querySelector("[data-module='amplifier']"));
        var panner = audioCtx.createStereoPanner();
        var lfo = new LFO(audioCtx, panner.pan, document.querySelector("[data-module='panner']"));

        source.connect(distortion.input());
        distortion.connect(compressor);
        compressor.connect(echo.input());
        echo.connect(panner);
        panner.connect(amplifier.input());
        amplifier.connect(audioCtx.destination);
      },
      function() {
        // error
        console.log(arguments);
      });
  });
})();
