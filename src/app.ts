import buildSignalChain from './signalChain'
import loadSoundFileSource from './sources/loadSoundFileSource'
import loadUserMediaSource from './sources/loadUserMediaSource'

function app() {
  console.log('Starting application.')

  const audioCtx = new AudioContext()
  const signalChain = buildSignalChain(audioCtx)

  const soundFilePromise = loadSoundFileSource(audioCtx, signalChain)
  const guitarInputPromise = loadUserMediaSource(audioCtx, signalChain)

  Promise.all([soundFilePromise, guitarInputPromise]).then((...args) => {
    console.log('All sources loaded')
    console.log(args)
  }).catch((error) => {
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
