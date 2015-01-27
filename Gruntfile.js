module.exports = function(grunt) {

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-karma');

var version = require('./package').version;
var header =
  '/*!\n' +
  ' * PEP v' + version + ' | https://github.com/jquery/PEP\n' +
  ' * Copyright jQuery Foundation and other contributors | http://jquery.org/license\n'+
  ' */\n';

grunt.initConfig({
  uglify: {
    pointerevents: {
      options: {
        preserveComments: 'some'
      },
      nonull: true,
      dest: 'dist/PEP.min.js',
      src: 'dist/PEP.js'
    }
  },
  karma: {
    options: {
      configFile: 'karma.conf.js',
      keepalive: true
    },
    pointerevents: {
    },
    buildbot: {
      reporters: 'crbot',
      logLevel: 'OFF'
    }
  }
});

grunt.registerTask('build', function() {
  var esperanto = require('esperanto');
  var done = this.async();

  grunt.log.write('Building PEP...');
  esperanto.bundle({
    base: 'src',
    entry: '../pointerevents.js'
  }).then(function (bundle) {
    var umd = bundle.toUmd({
      name: 'PointerEventsPolyfill'
    });
    grunt.file.write('dist/PEP.js', header + umd.code);
  }).then(
    function() {
      grunt.log.ok();
      done();
    },
    function(error) {
      grunt.log.error();
      done(error);
    }
  );
});

grunt.registerTask('default', ['build', 'uglify']);
grunt.registerTask('test', ['override-chrome-launcher', 'karma:pointerevents']);
grunt.registerTask('test-buildbot', ['override-chrome-launcher', 'karma:buildbot']);

};
