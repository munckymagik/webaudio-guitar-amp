import Amplifer from './modules/Amplifer'
import Distortion from './modules/Distortion'
import LFO from './modules/LFO'
import SlapBackEcho from './modules/SlapBackEcho'
import WebAudioNodeWrapper from './modules/WebAudioNodeWrapper'
import makeCompressor from './modules/Compressor'

function buildSignalChain(audioCtx) {
  var distortion = new Distortion(audioCtx, document.querySelector("[data-module='distortion']"));
  var compressor = new WebAudioNodeWrapper(makeCompressor(audioCtx));
  var echo = new SlapBackEcho(audioCtx, document.querySelector("[data-module='echo']"));
  var panner = new WebAudioNodeWrapper(audioCtx.createStereoPanner());
  var lfo = new LFO(audioCtx, panner.input().pan, document.querySelector("[data-module='panner']"));
  var amplifier = new Amplifer(audioCtx, document.querySelector("[data-module='amplifier']"));

  distortion.connect(compressor.input());
  compressor.connect(echo.input());
  echo.connect(panner.input());
  panner.connect(amplifier.input());
  amplifier.connect(audioCtx.destination);

  return {
    distortion: distortion,
    compressor: compressor,
    echo: echo,
    panner: panner,
    lfo: lfo,
    amplifier: amplifier
  };
}

export default buildSignalChain
