import buildSignalChain from './signalChain'
import loadSoundFileSource from './sources/loadSoundFileSource'
import loadUserMediaSource from './sources/loadUserMediaSource'

function app() {
  console.log('Starting application.')

  const audioCtx = new AudioContext()
  const signalChain = buildSignalChain(audioCtx)

  const sourceLoaderPromises = [
    loadSoundFileSource(audioCtx, signalChain.distortion.input()),
    loadUserMediaSource(audioCtx, signalChain.distortion.input())
  ]
  let sources = null

  Promise.all(sourceLoaderPromises).then((resolutions) => {
    console.log('All sources loaded')
    console.log(resolutions)

    sources = resolutions
  }).catch((error) => {
    console.log('Error source loading failed', error)
  })

  return {
    audioCtx,
    signalChain,
    sources
  }
}

export default app
