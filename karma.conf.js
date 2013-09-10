module.exports = function(karma) {
  var common = require('./tools/test/karma-common.conf.js');
  karma.set(common.mixin_common_opts(karma, {
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // list of files / patterns to load in the browser
    files: [
      'node_modules/chai/chai.js',
      'node_modules/chai-spies/chai-spies.js',
      'src/boot.js',
      'src/PointerEvent.js',
      'src/pointermap.js',
      'src/sidetable.js',
      'src/dispatcher.js',
      'src/installer.js',
      'src/mouse.js',
      'src/touch.js',
      'src/ms.js',
      'src/platform-events.js',
      'src/capture.js',
      'tests/setup.js',
      'tests/karma-setup.js',
      'tests/!(setup|karma-setup).js'
    ],
  }));
};
