//
// NodeWrapper (for the sake of a consistent interface when chaining stuff together)
//

function WebAudioNodeWrapper(webaudioNode) {
  this.node = webaudioNode;
}

WebAudioNodeWrapper.prototype.connect = function(node) {
  this.node.connect(node);
};

WebAudioNodeWrapper.prototype.input = function() {
  return this.node;
};

export default WebAudioNodeWrapper
