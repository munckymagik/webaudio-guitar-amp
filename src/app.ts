import buildSignalChain from './signalChain'
import loadSoundFileSource from './sources/loadSoundFileSource'
import loadUserMediaSource from './sources/loadUserMediaSource'

let audioCtx: AudioContext
let signalChain: any
let soundFilePromise: Promise<any>
let guitarInputPromise: Promise<any>

function app() {
  console.log('Starting application.')

  audioCtx = new AudioContext()
  signalChain = buildSignalChain(audioCtx)

  soundFilePromise = loadSoundFileSource(audioCtx, signalChain)
  guitarInputPromise = loadUserMediaSource(audioCtx, signalChain)

  Promise.all([soundFilePromise, guitarInputPromise]).then((...args) => {
    console.log('All sources loaded')
    console.log(args)
  }).catch(error => {
    console.log('Error source loading failed', error)
  })
};

export default app
