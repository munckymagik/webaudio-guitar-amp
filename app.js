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

    this._input.gain.value = 1.0;
    this.output.gain.value = 1.0;
    delay.delayTime.value = 0.15 // 150ms
    feedback.gain.value = 0.25;
    wetLevel.gain.value = 0.50;

    this._input.connect(delay);
    this._input.connect(this.output);

    delay.connect(feedback);
    delay.connect(wetLevel);
    feedback.connect(delay);
    wetLevel.connect(this.output);

    this.uiWetControl = uiElement.querySelector('.echo__wet');
    this.uiWetControl.addEventListener('change', function() {
      wetLevel.gain.value = self.uiWetControl.value;
    });
  }

  SlapBackEcho.prototype.connect = function(node) {
    this.output.connect(node);
  }

  SlapBackEcho.prototype.setValue = function(gainValue) {
    this.gain.gain.value = gainValue;
  }

  SlapBackEcho.prototype.input = function() {
    return this._input;
  }

  //
  // Mixer ---------------------------------------------------------------------
  //

  function Mixer(audioCtx, uiElement) {
    var self = this;

    this.gain = audioCtx.createGain();
    this.uiControl = uiElement.querySelector('.mixer__control');

    this.uiControl.addEventListener('mousemove', function() {
      self.setValue(self.uiControl.value);
    });
  }

  Mixer.prototype.connect = function(node) {
    this.gain.connect(node);
  }

  Mixer.prototype.setValue = function(gainValue) {
    this.gain.gain.value = gainValue;
  }

  Mixer.prototype.input = function() {
    return this.gain;
  }

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
  };

  //
  // LFO
  //

  function LFO(audioCtx, paramToModulate) {
    this.lfo = audioCtx.createOscillator();
    this.lfoGain = audioCtx.createGain();

    this.lfo.frequency.value = 5.0;
    this.lfoGain.gain.value = 0.0;

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(paramToModulate);
    this.lfo.connect(paramToModulate);

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
        var distortion = audioCtx.createWaveShaper();
        var lowPass = audioCtx.createBiquadFilter();
        var compressor = makeCompressor(audioCtx);
        var echo = new SlapBackEcho(audioCtx, document.querySelector("[data-module='echo']"));
        var mixer = new Mixer(audioCtx, document.querySelector("[data-module='mixer']"));
        var panner = audioCtx.createStereoPanner();
        var lfo = new LFO(audioCtx, panner.pan);

        distortion.curve = makeDistortionCurve(18);
        distortion.oversample = '4x';
        lowPass.type = 'lowpass';
        lowPass.frequency.value = 2000;

        source.connect(distortion);
        distortion.connect(lowPass);
        lowPass.connect(compressor);
        compressor.connect(echo.input());
        echo.connect(mixer.input());
        mixer.connect(panner);
        panner.connect(audioCtx.destination);
      },
      function() {
        // error
        console.log(arguments);
      });
  });
})();
