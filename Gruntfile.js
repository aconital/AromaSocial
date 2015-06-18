module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      dist: {
        options:{
          loadPath: ['bower_components/foundation/scss','bower_components/bootstrap-sass-official/assets/stylesheets']
        },
        files: [
  		  {
    		  expand: true,
          cwd: 'styles',
          src: ['bower_components/foundation/scss/*.scss','bower_components/bootstrap-sass-official/assets/stylesheets/*.scss'],
          dest: '../public/stylesheets',
          ext: '.css'
        },
        {
	        'public/stylesheets/style.css' : 'public/scss/style.scss'
		    }]
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

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  grunt.registerTask('build', ['sass']);
  grunt.registerTask('default', ['build','copy','watch']);
}
