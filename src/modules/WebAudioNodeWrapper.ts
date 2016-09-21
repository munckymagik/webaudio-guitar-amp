//
// NodeWrapper (for the sake of a consistent interface when chaining stuff together)
//

class WebAudioNodeWrapper {
  constructor(webaudioNode) {
    this.node = webaudioNode
  }

  connect(node) {
    this.node.connect(node)
  }

  input() {
    return this.node
  }
}

export default WebAudioNodeWrapper
