import '../shims/getUserMedia'

function loadUserMediaSource(audioCtx, signalChain) {
  const options = {
    audio: {
      optional: [
        { echoCancellation: false }
      ]
    }
  };

  return new Promise(function(resolve, fail) {
    navigator.getUserMedia(
      options,
      function(stream) {
        console.log('Loading stream.');

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(signalChain.distortion.input());

        resolve(source);
      },
      function() {
        fail(arguments);
      }
    );
  });
}

export default loadUserMediaSource
