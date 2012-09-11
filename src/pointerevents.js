/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function() {
  var thisFile = 'pointerevents.js';
  var libLocation = '';
  var require = function(inSrc) {
    document.write('<script src="' + libLocation + inSrc + '"></script>');
  };
  var s$ = document.querySelectorAll('script[src]');
  Array.prototype.some.call(s$, function(s) {
    var src = s.getAttribute('src');
    if (src.slice(-thisFile.length) == thisFile) {
      libLocation = src.slice(0, -thisFile.length);
      return true;
    }
  });
  [
    'initialize.js',
    'pointermap.js',
    'dispatcher.js',
    'platform-events.js',
    'flick.js',
    'finalize.js'
  ].forEach(require);
})();
