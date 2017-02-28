import '../shims/getUserMedia'

function loadUserMediaSource(audioCtx, signalChainInput) {
  const options = {
    audio: {
      optional: [
        { echoCancellation: false }
      ]
    }
  }

  return new Promise((resolve, fail) => {
    navigator.getUserMedia(
      options,
      (stream) => {
        console.log('Loading stream.')

        const source = audioCtx.createMediaStreamSource(stream)
        source.connect(signalChainInput)

        resolve(source)
      },
      (...args) => {
        fail(args)
      }
    )
  })
}

export default loadUserMediaSource
