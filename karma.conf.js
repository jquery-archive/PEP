module.exports = function(karma) {
  var common = require('../tools/test/karma-common.conf.js');
  karma.set(common.mixin_common_opts(karma, {
    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // list of files / patterns to load in the browser
    files: [
      'PointerEvents/node_modules/chai/chai.js',
      'PointerEvents/node_modules/chai-spies/chai-spies.js',
      'PointerEvents/src/boot.js',
      'PointerEvents/src/touch-action.js',
      'PointerEvents/src/PointerEvent.js',
      'PointerEvents/src/pointermap.js',
      'PointerEvents/src/dispatcher.js',
      'PointerEvents/src/installer.js',
      'PointerEvents/src/mouse.js',
      'PointerEvents/src/touch.js',
      'PointerEvents/src/ms.js',
      'PointerEvents/src/platform-events.js',
      'PointerEvents/src/capture.js',
      'PointerEvents/test/karma-setup.js',
      'PointerEvents/test/setup.js',
      'PointerEvents/test/loader.js',
      'PointerEvents/test/constructor.js',
      'PointerEvents/test/dispatcher.js',
      'PointerEvents/test/pointermap.js',
      'PointerEvents/test/capture.js'
    ]
  }));
};
