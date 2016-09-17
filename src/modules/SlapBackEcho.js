// http://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/

function SlapBackEcho(audioCtx, uiElement) {
  this._input = audioCtx.createGain();
  this.output = audioCtx.createGain();

  const self = this, delay = audioCtx.createDelay(), feedback = audioCtx.createGain(), wetLevel = audioCtx.createGain();

  this.uiWetControl = uiElement.querySelector('.js-echo-mix');
  this.uiFeedbackControl = uiElement.querySelector('.js-echo-feedback');
  this.uiDelayControl = uiElement.querySelector('.js-echo-delay');

  this._input.gain.value = 1.0;
  this.output.gain.value = 1.0;
  delay.delayTime.value = parseFloat(this.uiDelayControl.value);
  feedback.gain.value = parseFloat(this.uiFeedbackControl.value);
  wetLevel.gain.value = this.uiWetControl.value;

  this._input.connect(delay);
  this._input.connect(this.output);

  delay.connect(feedback);
  delay.connect(wetLevel);
  feedback.connect(delay);
  wetLevel.connect(this.output);

  this.uiWetControl.addEventListener('input', function() {
    wetLevel.gain.value = self.uiWetControl.value;
  });
  this.uiFeedbackControl.addEventListener('input', function() {
    feedback.gain.value = parseFloat(self.uiFeedbackControl.value);
  });
  this.uiDelayControl.addEventListener('input', function() {
    delay.delayTime.value = parseFloat(self.uiDelayControl.value);
  });
}

SlapBackEcho.prototype.connect = function(node) {
  this.output.connect(node);
};

SlapBackEcho.prototype.setValue = function(gainValue) {
  this.gain.gain.value = gainValue;
};

SlapBackEcho.prototype.input = function() {
  return this._input;
};

export default SlapBackEcho
