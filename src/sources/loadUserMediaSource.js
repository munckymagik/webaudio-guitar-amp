import '../shims/getUserMedia'

function loadUserMediaSource(audioCtx, signalChain) {
  const options = {
    audio: {
      optional: [
        { echoCancellation: false }
      ]
    }
  };

  return new Promise((resolve, fail) => {
    navigator.getUserMedia(
      options,
      stream => {
        console.log('Loading stream.');

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(signalChain.distortion.input());

        resolve(source);
      },
      (...args) => {
        fail(args);
      }
    );
  });
}

export default loadUserMediaSource
