module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-karma-0.9.1');

  var os = require('os').type();
  var browsers = ['Chrome', 'Firefox'];
  if (os == 'Darwin') {
    browsers.push('ChromeCanary');
  }
  if (os == 'Windows_NT') {
    browsers.push('IE');
  }

  grunt.initConfig({
    uglify: {
      pointerevents: {
        options: {
          sourceMap: 'pointerevents.min.js.map',
          banner: '/* Copyright 2013 The Polymer Authors. All rights reserved. Use of this source code is governed by a BSD-style license that can be found in the LICENSE file. */\n'
        },
        dest: 'pointerevents.min.js',
        src: [
          'src/boot.js',
          'src/touch-action.js',
          'src/PointerEvent.js',
          'src/pointermap.js',
          'src/sidetable.js',
          'src/dispatcher.js',
          'src/installer.js',
          'src/platform-events.js',
          'src/capture.js',
        ]
      }
    },
    karma: {
      options: {
        browsers: browsers,
        configFile: 'karma.conf.js'
      },
      polymer: {
      },
      buildbot: {
        reporters: 'crbot',
        logLevel: 'OFF'
      },
      browserstack: {
        browsers: "BrowserStack:IE:Win"
      }
    }
  });

  grunt.registerTask('default', 'uglify');
  grunt.registerTask('test', 'karma:polymer');
  grunt.registerTask('test-buildbot', 'karma:buildbot');
};
