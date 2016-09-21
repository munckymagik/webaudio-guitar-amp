import Amplifer from './modules/Amplifer'
import Distortion from './modules/Distortion'
import LFO from './modules/LFO'
import SlapBackEcho from './modules/SlapBackEcho'
import WebAudioNodeWrapper from './modules/WebAudioNodeWrapper'
import makeCompressor from './modules/Compressor'

function buildSignalChain(audioCtx) {
  const distortion = new Distortion(audioCtx, document.querySelector("[data-module='distortion']"))
  const compressor = new WebAudioNodeWrapper(makeCompressor(audioCtx))
  const echo = new SlapBackEcho(audioCtx, document.querySelector("[data-module='echo']"))
  const panner = new WebAudioNodeWrapper<StereoPannerNode>(audioCtx.createStereoPanner())
  const lfo = new LFO(audioCtx, panner.input().pan, document.querySelector("[data-module='panner']"))
  const amplifier = new Amplifer(audioCtx, document.querySelector("[data-module='amplifier']"))

  distortion.connect(compressor.input())
  compressor.connect(echo.input())
  echo.connect(panner.input())
  panner.connect(amplifier.input())
  amplifier.connect(audioCtx.destination)

  return {
    distortion,
    compressor,
    echo,
    panner,
    lfo,
    amplifier
  }
}

export default buildSignalChain
