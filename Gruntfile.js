module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-git-authors');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-selenium-standalone');
  grunt.loadNpmTasks('intern');

  var pkg = require('./package');
  var version = pkg.version;
  var header =
    '/*!\n' +
    ' * PEP v' + version + ' | https://github.com/jquery/PEP\n' +
    ' * Copyright jQuery Foundation and other contributors | http://jquery.org/license\n' +
    ' */\n';

  var path = require('path');
  var testPkg = pkg['web-platform-tests'];
  var w3cPath = path.normalize(testPkg.path);

  var srcFiles = ['src/**/*.js'];
  var buildFiles = ['Gruntfile.js', 'build/**/*.js'];

  var testFiles = [
    'tests/**/*.js',
    '!tests/support/pep_support.js',
    '!' + path.join(w3cPath, '**', '*.js')
  ];

  var allFiles = srcFiles.concat(buildFiles).concat(testFiles);

  grunt.initConfig({
    authors: {
      prior: [
        'Google, Inc.'
      ]
    },
    uglify: {
      pointerevents: {
        options: {
          preserveComments: 'some'
        },
        nonull: true,
        dest: 'dist/pep.min.js',
        src: 'dist/pep.js'
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
    },
    "selenium_standalone": {
        options: {
          stopOnExit: true
        },
        pointerevents: {
            seleniumVersion: '2.53.0',
            seleniumDownloadURL: 'http://selenium-release.storage.googleapis.com',
            drivers: {
                chrome: {
                  version: '2.25',
                  arch: process.arch,
                  baseURL: 'http://chromedriver.storage.googleapis.com'
                },
                ie: {
                  version: '2.53',
                  arch: process.arch,
                  baseURL: 'http://selenium-release.storage.googleapis.com'
                }
            }
        }
    },
    jscs: {
      lint: {
        options: {
          config: true
        },
        files: {
          src: allFiles
        }
      },
      fix: {
        options: {
          config: true,
          esnext: true,
          fix: true
        },
        files: {
          src: allFiles
        }
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      main: allFiles
    },
    watch: {
      src: {
        files: srcFiles,
        tasks: ['build', 'lint'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('build', function() {
    var rollup = require('rollup');
    var done = this.async();

    grunt.log.write('Building PEP...');
    rollup.rollup({
      entry: 'src/pointerevents.js'
    }).then(function(bundle) {
      var result = bundle.generate({
        moduleName: 'PointerEventsPolyfill',
        format: 'umd',
        banner: header
      });
      grunt.file.write('dist/pep.js', result.code);
    }).then(
      function() {
        grunt.log.ok();
        done();
      },
      function(error) {
        grunt.log.error(error);
        done(error);
      }
    );
  });

  grunt.registerTask('pretest', function() {
    var done = this.async();
    var pretest = require('./tests/support/pretest');

    pretest().then(done);
  });

  grunt.registerTask('server', [
    'selenium_standalone:pointerevents:install',
    'selenium_standalone:pointerevents:start'
  ]);
  grunt.registerTask('default', ['lint', 'build', 'uglify']);
  grunt.registerTask('lint', ['jscs:lint', 'jshint']);
  grunt.registerTask('test', [
    'build',
    'server',
    'pretest',
    'intern:pointerevents',
    'selenium_standalone:pointerevents:stop'
  ]);
  grunt.registerTask('ci', ['lint', 'build', 'pretest', 'intern:ci']);
};
