/*!
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

(function() {
  var thisFile = 'pointerevents.js';
  var scopeName = 'PointerEventsPolyfill';
  var modules = [
    'src/boot.js',
    'src/touch-action.js',
    'src/PointerEvent.js',
    'src/pointermap.js',
    'src/dispatcher.js',
    'src/installer.js',
    'src/mouse.js',
    'src/touch.js',
    'src/ms.js',
    'src/platform-events.js',
    'src/capture.js'
  ];

  window[scopeName] = {
    entryPointName: thisFile,
    modules: modules
  };

  var script = document.querySelector('script[src $= "' + thisFile + '"]');
  var src = script.attributes.src.value;
  var basePath = src.slice(0, src.indexOf(thisFile));

  modules.forEach(function( module ) {
    document.write('<script src="' + basePath + module + '"></script>');
  });

})();
