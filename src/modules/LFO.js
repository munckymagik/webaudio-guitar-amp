function LFO(audioCtx, paramToModulate, uiElement) {
  var self = this;

  this.speedCtrl = uiElement.querySelector('.js-lfo-speed');
  this.widthCtrl = uiElement.querySelector('.js-lfo-gain');

  this.lfo = audioCtx.createOscillator();
  this.lfoGain = audioCtx.createGain();

  this.lfo.frequency.value = this.speedCtrl.value;
  this.lfoGain.gain.value = this.widthCtrl.value;

  this.lfo.connect(this.lfoGain);
  this.lfoGain.connect(paramToModulate);
  this.lfo.connect(paramToModulate);

  this.speedCtrl.addEventListener('input', function() {
    self.lfo.frequency.value = self.speedCtrl.value;
  });
  this.widthCtrl.addEventListener('input', function() {
    self.lfoGain.gain.value = self.widthCtrl.value;
  });

  this.lfo.start();
}

export default LFO
