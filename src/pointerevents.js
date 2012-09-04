/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function() {
  var thisFile = 'pointerevents.js';
  var source = '', base = '';
  var s$ = document.querySelectorAll('script[src]');
  Array.prototype.forEach.call(s$, function(s) {
    var src = s.getAttribute('src');
    if (src.slice(-thisFile.length) == thisFile) {
      source = s;
      base = src.slice(0, -thisFile.length);
    }
  });
  var require = function(inSrc) {
    document.write('<script src="' + base + inSrc + '"></script>');
  };
  [
    'initialize.js',
    'dispatcher.js',
    'platform-events.js',
    'flick.js',
    'finalize.js'
  ].forEach(require);
})();
