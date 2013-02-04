module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-exec');
  grunt.renameTask('exec', 'test');

  grunt.initConfig({
    concat: {
      'build/pointerevents.css': 'src/*.css',
    },
    min: {
      pointerevents: {
        dest: 'build/pointerevents.js',
        src: ['third_party/mutation_summary/mutation_summary.js', 'src/!(pointerevents).js']
      }
    },
    test: {
      mocha: {
        command: './node_modules/mocha-phantomjs/bin/mocha-phantomjs ./tests/index.html',
        stdout: true,
        stderr: true
      }
    }
  });

  grunt.registerTask('default', 'concat min');
};
