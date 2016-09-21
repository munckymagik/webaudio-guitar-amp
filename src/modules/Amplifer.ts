class Amplifer {
  constructor(audioCtx, uiElement) {
    const self = this

    this.gain = audioCtx.createGain()
    this.volumeCtrl = uiElement.querySelector('.js-amplifier-volume')

    self.setValue(self.volumeCtrl.value)
    this.volumeCtrl.addEventListener('input', () => {
      self.setValue(self.volumeCtrl.value)
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
