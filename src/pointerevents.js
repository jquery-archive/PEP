/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function() {
  var thisFile = 'pointerevents.js';
  var libLocation = '';
  /*
   * if we are loaded inside a component, we need to know the relative path from
   * that location, not the document
   */
  var baseUrlFromNode = function(inNode) {
    var n = inNode, p;
    while ((p = n.parentNode)) {
      n = p;
    }
    return (n && (n.URL || n.name)) || '';
  };
  var appendScriptPath = function(inBasePath, inRelPath) {
    // include last slash as well
    var ls = inBasePath.lastIndexOf('/') + 1;
    return inBasePath.slice(0, ls) + inRelPath;
  };
  var require = function(inSrc) {
    document.write('<script src="' + libLocation + inSrc + '"></script>');
  };
  var s$ = document.querySelectorAll('script[src]');
  Array.prototype.forEach.call(s$, function(s) {
    var src = s.getAttribute('src');
    if (src.slice(-thisFile.length) == thisFile) {
      var source = baseUrlFromNode(s);
      var base = src.slice(0, -thisFile.length);
      libLocation = appendScriptPath(source, base);
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
