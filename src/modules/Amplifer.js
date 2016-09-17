function Amplifer(audioCtx, uiElement) {
  const self = this;

  this.gain = audioCtx.createGain();
  this.volumeCtrl = uiElement.querySelector('.js-amplifier-volume');

  self.setValue(self.volumeCtrl.value);
  this.volumeCtrl.addEventListener('input', function() {
    self.setValue(self.volumeCtrl.value);
  });
}

Amplifer.prototype.connect = function(node) {
  this.gain.connect(node);
};

Amplifer.prototype.setValue = function(gainValue) {
  this.gain.gain.value = gainValue;
};

Amplifer.prototype.input = function() {
  return this.gain;
};

export default Amplifer
