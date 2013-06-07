/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function() {
  var thisFile = 'pointerevents.js';
  var libLocation = '';

  var require = function(inSrc) {
    document.write('<script src="' + libLocation + inSrc + '"></script>');
  };

  var s = document.querySelector('script[src $= "' + thisFile + '"]');
  if (s) {
    libLocation = s.src.slice(0, -thisFile.length);
  }

  [
    'src/boot.js',
    'src/touch-action.js',
    'src/PointerEvent.js',
    'src/pointermap.js',
    'src/sidetable.js',
    'src/dispatcher.js',
    'src/installer.js',
    'src/platform-events.js',
    'src/capture.js'
  ].forEach(require);
})();
