import buildSignalChain from './signalChain'
import BufferSource from './sources/BufferSource'
import loadSoundFileSource from './sources/loadSoundFileSource'
import loadUserMediaSource from './sources/loadUserMediaSource'

function app() {
  console.log('Starting application.')

  const audioCtx = new AudioContext()
  const signalChain = buildSignalChain(audioCtx)

  const sourceLoaderPromises = [
    loadSoundFileSource(audioCtx),
    loadUserMediaSource(audioCtx)
  ]
  let sources: [any] = null

  Promise.all(sourceLoaderPromises).then((resolutions: [any]) => {
    console.log('All sources loaded')
    console.log(resolutions)

    sources = resolutions
    const inputOne: BufferSource = resolutions[0]
    const inputTwo: MediaStreamAudioSourceNode = resolutions[1]

    inputOne.connect(signalChain.input.input1)
    inputTwo.connect(signalChain.input.input2)

    const onSourceChange = () => {
      signalChain.input.toggle()
    }

    Array.from(document.querySelectorAll('[name=source]')).forEach((elem) => {
      elem.addEventListener('change', onSourceChange)
    })
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
