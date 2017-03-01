class TwoInOneOutSwitch {
  public readonly input1: GainNode
  public readonly input2: GainNode
  private output: GainNode
  private selector: number

  constructor(audioCtx) {
    this.input1 = audioCtx.createGain()
    this.input2 = audioCtx.createGain()
    this.output = audioCtx.createGain()

    this.selector = 0
    this.update()

    this.input1.connect(this.output)
    this.input2.connect(this.output)
  }

  connect(node) {
    this.output.connect(node)
  }

  toggle() {
    this.selector = (this.selector > 0) ? 0 : 1
    this.update()
  }

  private update() {
    this.input1.gain.value = 1 - this.selector
    this.input2.gain.value = this.selector
  }
}

export default TwoInOneOutSwitch
