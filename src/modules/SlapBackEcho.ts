// http://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/

class SlapBackEcho {
  private _input: GainNode
  private output: GainNode
  private uiWetControl: HTMLInputElement
  private uiFeedbackControl: HTMLInputElement
  private uiDelayControl: HTMLInputElement

  constructor(audioCtx, uiElement) {
    this._input = audioCtx.createGain()
    this.output = audioCtx.createGain()

    const self = this
    const delay = audioCtx.createDelay()
    const feedback = audioCtx.createGain()
    const wetLevel = audioCtx.createGain()

    this.uiWetControl = uiElement.querySelector('.js-echo-mix')
    this.uiFeedbackControl = uiElement.querySelector('.js-echo-feedback')
    this.uiDelayControl = uiElement.querySelector('.js-echo-delay')

    this._input.gain.value = 1.0
    this.output.gain.value = 1.0
    delay.delayTime.value = parseFloat(this.uiDelayControl.value)
    feedback.gain.value = parseFloat(this.uiFeedbackControl.value)
    wetLevel.gain.value = this.uiWetControl.value

    this._input.connect(delay)
    this._input.connect(this.output)

    delay.connect(feedback)
    delay.connect(wetLevel)
    feedback.connect(delay)
    wetLevel.connect(this.output)

    this.uiWetControl.addEventListener('input', () => {
      wetLevel.gain.value = self.uiWetControl.value
    })
    this.uiFeedbackControl.addEventListener('input', () => {
      feedback.gain.value = parseFloat(self.uiFeedbackControl.value)
    })
    this.uiDelayControl.addEventListener('input', () => {
      delay.delayTime.value = parseFloat(self.uiDelayControl.value)
    })
  }

  connect(node) {
    this.output.connect(node)
  }

  input() {
    return this._input
  }
}

export default SlapBackEcho
