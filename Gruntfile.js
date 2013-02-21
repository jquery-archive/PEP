module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.initConfig({
    concat: {
      'build/pointerevents.css': 'src/*.css',
    },
    uglify: {
      pointerevents: {
        dest: 'build/pointerevents.js',
        src: [
          'src/PointerEvent.js',
          'src/pointermap.js',
          'src/sidetable.js',
          'src/dispatcher.js',
          'src/installer.js',
          'src/findTarget.js',
          'src/platform-events.js',
          'src/capture.js',
        ]
      }
    },
  });

  grunt.registerTask('default', ['concat', 'uglify']);
};
