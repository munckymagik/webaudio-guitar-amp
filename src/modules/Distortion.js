// Taken from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 50
  const nSamples = 44100
  const curve = new Float32Array(nSamples)
  const deg = Math.PI / 180
  let i = 0
  let x

  for (; i < nSamples; ++i) {
    x = i * 2 / nSamples - 1
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x))
  }

  return curve
}

class Distortion {
  constructor(audioCtx, uiElement) {
    const self = this

    this.amountCtrl = uiElement.querySelector('.js-distortion-amount')
    this.toneCtrl = uiElement.querySelector('.js-distortion-tone')

    this.distortion = audioCtx.createWaveShaper()
    this.distortion.curve = makeDistortionCurve(parseInt(this.amountCtrl.value, 10))
    this.distortion.oversample = '4x'

    this.lowPass = audioCtx.createBiquadFilter()
    this.lowPass.type = 'lowpass'
    this.lowPass.frequency.value = parseInt(this.toneCtrl.value, 10)

    this.distortion.connect(this.lowPass)

    this.amountCtrl.addEventListener('change', () => {
      self.distortion.curve = makeDistortionCurve(parseInt(self.amountCtrl.value, 10))
    })
    this.toneCtrl.addEventListener('input', () => {
      self.lowPass.frequency.value = parseInt(self.toneCtrl.value, 10)
    })
  }

  connect(node) {
    this.lowPass.connect(node)
  }

  input() {
    return this.distortion
  }
}

export default Distortion
