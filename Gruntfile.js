module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('gruntacular');
  grunt.initConfig({
    concat: {
      'build/pointerevents.css': 'src/*.css',
    },
    uglify: {
      pointerevents: {
        options: {
          sourceMap: 'build/pointerevents.js.map',
          sourceMappingURL: 'pointerevents.js.map',
          sourceMapRoot: '..'
        },
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
    testacular: {
      test: {
        configFile: 'testacular.conf.js'
      }
    }
  });

  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('test', ['testacular']);
};
