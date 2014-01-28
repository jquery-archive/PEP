module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-karma');

  var sourceFiles = grunt.file.readJSON('build.json');
  grunt.initConfig({
    concat: {
      pointerevents: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('LICENSE')
        },
        nonull: true,
        src: sourceFiles,
        dest: 'pointerevents.dev.js'
      }
    },
    uglify: {
      pointerevents: {
        options: {
          // sourceMap: 'pointerevents.min.js.map',
          banner: grunt.file.read('LICENSE')
        },
        nonull: true,
        dest: 'pointerevents.min.js',
        src: sourceFiles
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      pointerevents: {
      },
      buildbot: {
        reporters: 'crbot',
        logLevel: 'OFF'
      }
    }
  });

  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('test', 'karma:pointerevents');
  grunt.registerTask('test-buildbot', 'karma:buildbot');
};
