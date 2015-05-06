(function() {
  "use strict";

  //
  // Shims --------------------------------------------------------------------
  //

  navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);

  //
  // MAIN ---------------------------------------------------------------------
  //

  window.addEventListener('load', function() {
    console.log('On Load.');

    var audioCtx = window.__audioCtx = new AudioContext();

    navigator.getUserMedia({ audio: { optional: [ { echoCancellation: false } ] } },
      function(stream) {
        console.log('stream.');
        var source = window.__source = audioCtx.createMediaStreamSource(stream);

        var volume = audioCtx.createGain();
        volume.gain.value = 2.0;

        source.connect(volume);
        volume.connect(audioCtx.destination);
      },
      function() {
        // error
        console.log(arguments);
      });

  });
})();
