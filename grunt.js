module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      'build/pointerevents.css': 'src/*.css',
    },
    min: {
      pointerevents: {
        dest: 'build/pointerevents.js',
        src: [
          'src/PointerEvent.js',
          'src/initialize.js',
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
