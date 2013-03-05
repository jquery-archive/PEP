module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('gruntacular');

  grunt.initConfig({
    uglify: {
      pointerevents: {
        options: {
          sourceMap: 'build/pointerevents.js.map',
          sourceMappingURL: 'pointerevents.js.map',
          sourceMapRoot: '..'
        },
        dest: 'build/pointerevents.js',
        src: [
          'src/touch-action.js',
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
    testacular: {
      test: {
        configFile: 'testacular.conf.js'
      }
    }
  });

  grunt.registerTask('default', 'uglify');
  grunt.registerTask('test', 'testacular');
};
