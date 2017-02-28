class TwoInOneOutSwitch {
  public readonly input1: GainNode
  public readonly input2: GainNode
  private output: GainNode

  constructor(audioCtx) {
    this.input1 = audioCtx.createGain()
    this.input2 = audioCtx.createGain()
    this.output = audioCtx.createGain()

    this.input1.connect(this.output)
    this.input2.connect(this.output)
  }

  connect(node) {
    this.output.connect(node)
  }
}

export default TwoInOneOutSwitch
