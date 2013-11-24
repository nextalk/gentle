module.exports = function( grunt ) {

	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		banner: '/*!\n' +
			' * <%= grunt.template.today("isoDate") %>\n' +
			' * Licensed under MIT %>\n' +
			' *\n' +
			' */\n\n',
		concat: {
			js: {
				src: [
					"components/jquery/jquery.js",
					"components/bootstrap/dist/js/bootstrap.js",
					"components/bootstrap-datetimepicker/js/bootstrap-datetimepicker.js"
				],
				dest: "public/js/base.js"
			},
			css: {
				src: [
					"components/bootstrap/dist/css/bootstrap.css",
					"components/bootstrap/dist/css/bootstrap-theme.css",
					"components/bootstrap-datetimepicker/css/bootstrap-datetimepicker.css"
				],
				dest: "public/css/base.css"
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>',
				report: 'min'
			},
			js: {
				src: ['<%= concat.js.dest %>'],
				dest: 'public/js/base.min.js'
			}
		},
		copy: {
			fonts: {
				expand: true,
				cwd: "components/bootstrap/dist/",
				src: ["fonts/*"],
				dest: 'public'
			}
		},

	});

	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-concat" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );
	grunt.loadNpmTasks( "grunt-contrib-cssmin" );

	grunt.registerTask('dist', ['concat', 'uglify', 'copy']);

};


