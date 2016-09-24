class Amplifer {
  private gain: GainNode
  private volumeCtrl: HTMLInputElement

  constructor(audioCtx, uiElement) {
    this.gain = audioCtx.createGain()
    this.volumeCtrl = uiElement.querySelector('.js-amplifier-volume')

    this.setValue(this.volumeCtrl.value)
    this.volumeCtrl.addEventListener('input', () => {
      this.setValue(this.volumeCtrl.value)
    })
  }

  connect(node) {
    this.gain.connect(node)
  }

  setValue(gainValue) {
    this.gain.gain.value = gainValue
  }

  input() {
    return this.gain
  }
}

export default Amplifer
