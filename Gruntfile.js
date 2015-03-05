module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-git-authors');
  grunt.loadNpmTasks('intern');

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
    intern: {
      options: {
        runType: 'runner'
      },
      pointerevents: {
        options: {
          config: 'tests/intern-local'
        }
      },
      ci: {
        options: {
          config: 'tests/intern'
        }
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
        name: 'PointerEventsPolyfill',
        sourceMap: true,
        sourceMapFile: 'dist/PEP.js'
      });
      grunt.file.write('dist/PEP.js', header + umd.code);
      grunt.file.write('dist/PEP.js.map', umd.map.toString());
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
  grunt.registerTask('test', ['intern:pointerevents']);
  grunt.registerTask('ci', ['build', 'intern:ci']);
};
