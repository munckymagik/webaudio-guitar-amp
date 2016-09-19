// Based on code from: https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode
function makeCompressor(audioCtx) {
  const compressor = audioCtx.createDynamicsCompressor()
  compressor.threshold.value = -50
  compressor.knee.value = 40
  compressor.ratio.value = 12
  compressor.attack.value = 0.25
  compressor.release.value = 0.25

  return compressor
}

export default makeCompressor
