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
				options: {
					sourceMap: 'public/js/base.min.map',
					sourceMappingURL: "base.min.map",
					sourceMapPrefix: 2
				},
				files: {
					'public/js/base.min.js': ['<%= concat.js.dest %>']
				}
			}
		},
		cssmin: {
			options: {
				banner: '<%= banner %>',
				report: 'min'
			},
			css: {
				files: {
					'public/css/base.min.css': ['<%= concat.css.dest %>']
				}
			}
		},
		copy: {
			fonts: {
				expand: true,
				cwd: "components/bootstrap/dist/",
				src: ["fonts/*"],
				dest: 'public'
			},
			"bootstrap-datetimepicker-locales": {
				expand: true,
				cwd: "components/bootstrap-datetimepicker/js/",
				src: ["locales/*"],
				dest: 'public/js'
			}
		},

	});

	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-concat" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );
	grunt.loadNpmTasks( "grunt-contrib-cssmin" );

	grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'copy']);

};


