module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      options: {
        includePaths: ['bower_components/foundation/scss']
      },
      dist: {
        options: {
        	outputStyle: 'compressed',
          loadPath: require('node-neat').includePaths,
          loadPath: require('node-bourbon').includePaths,
          sourceMap: true,
        },
        files: {
	        'public/stylesheets/style.css' : 'public/scss/style.scss',
          'public/stylesheets/footer.css' : 'public/scss/footer.scss'
		    }
      }
    },
    copy: {
      main: {
        expand: true,
        cwd: 'bower_components',
        src: '**',
        dest: 'public/javascripts'
      }
    },
    watch: {
      grunt: {
        options: {
          reload: true
        },
        files: ['Gruntfile.js']
      },

      sass: {
        files: 'public/scss/*.scss',
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  grunt.registerTask('build', ['sass']);
  grunt.registerTask('default', ['build','copy','watch']);
}
