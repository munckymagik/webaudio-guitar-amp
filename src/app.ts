import buildSignalChain from './signalChain'
import loadSoundFileSource from './sources/loadSoundFileSource'
import loadUserMediaSource from './sources/loadUserMediaSource'

function app() {
  console.log('Starting application.')

  let audioCtx = new AudioContext()
  let signalChain = buildSignalChain(audioCtx)

  let soundFilePromise = loadSoundFileSource(audioCtx, signalChain)
  let guitarInputPromise = loadUserMediaSource(audioCtx, signalChain)

  Promise.all([soundFilePromise, guitarInputPromise]).then((...args) => {
    console.log('All sources loaded')
    console.log(args)
  }).catch(error => {
    console.log('Error source loading failed', error)
  })

  return {
    audioCtx,
    signalChain,
    soundFilePromise,
    guitarInputPromise
  }
};

export default app
