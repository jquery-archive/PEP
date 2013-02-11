module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      'build/pointerevents.css': 'src/*.css',
    },
    meta: {
      banner: 'window.__PointerEventShim__ = {};'
    },
    min: {
      pointerevents: {
        dest: 'build/pointerevents.js',
        src: [
          'src/PointerEvent.js',
          '<banner>',
          'src/sidetable.js',
          'src/pointermap.js',
          'src/dispatcher.js',
          'src/installer.js',
          'src/findTarget.js',
          'src/platform-events.js',
          'src/capture.js',
        ]
      }
    }
  });

  grunt.registerTask('default', 'concat min');
};
