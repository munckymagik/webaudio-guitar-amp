import buildSignalChain from './signalChain'
import loadSoundFileSource from './sources/loadSoundFileSource'
import loadUserMediaSource from './sources/loadUserMediaSource'

function app() {
  console.log('Starting application.');

  const audioCtx = window.__audioCtx = new AudioContext();
  const signalChain = window.__signalChain = buildSignalChain(audioCtx);

  window.__soundFilePromise = loadSoundFileSource(audioCtx, signalChain);
  window.__guitarInputPromise = loadUserMediaSource(audioCtx, signalChain);

  Promise.all([window.__soundFilePromise, window.__guitarInputPromise], function() {
    console.log('All sources loaded');
    console.log(arguments);
  }).catch(error => {
    console.log('Error source loading failed', error);
  });
};

export default app
