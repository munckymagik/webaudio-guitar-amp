import BufferSource from './BufferSource'

// From http://www.html5rocks.com/en/tutorials/webaudio/intro/
function loadSoundFile(context, url) {
  return new Promise((resolve, fail) => {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    // Decode asynchronously
    request.onload = () => {
      context.decodeAudioData(request.response, resolve, fail)
    }

    request.send()
  })
}

function loadSoundFileSource(audioCtx, signalChain) {
  return loadSoundFile(audioCtx, '/guitar.mp3').then(buffer => {
    console.log('Loaded OK.')
    const source = new BufferSource(audioCtx, buffer, signalChain.distortion.input())

    console.log('Enabling play/stop')
    document.querySelector('.js-play').addEventListener('click', source.play)
    document.querySelector('.js-stop').addEventListener('click', source.stop)

    return source
  })
}

export default loadSoundFileSource
