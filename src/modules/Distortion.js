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

    this.amountCtrl.addEventListener('change', function() {
      self.distortion.curve = makeDistortionCurve(parseInt(self.amountCtrl.value));
    });
    this.toneCtrl.addEventListener('input', function() {
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

export default Distortion
