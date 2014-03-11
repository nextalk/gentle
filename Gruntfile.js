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
					"components/bootstrap-datetimepicker/js/bootstrap-datetimepicker.js",
					"components/Gallery/js/jquery.blueimp-gallery.min.js",
					"components/Bootstrap-Image-Gallery/js/bootstrap-image-gallery.js",
					//"components/bootstrap-modal/js/bootstrap-modalmanager.js",
					//"components/bootstrap-modal/js/bootstrap-modal.js",
				],
				dest: "public/static/js/base.js"
			},
			css: {
				src: [
					"components/bootstrap/dist/css/bootstrap.css",
					"components/bootstrap-datetimepicker/css/bootstrap-datetimepicker.css",
					"components/Gallery/css/blueimp-gallery.css",
					"components/Bootstrap-Image-Gallery/css/bootstrap-image-gallery.css",
					//"components/bootstrap-modal/css/bootstrap-modal-bs3patch.css",
					//"components/bootstrap-modal/css/bootstrap-modal.css",
					//"components/Font-Awesome/css/font-awesome.css"
				],
				dest: "public/static/css/base.css"
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>',
				report: 'min'
			},
			js: {
				options: {
					sourceMap: 'public/static/js/base.min.map',
					sourceMappingURL: "base.min.map",
					sourceMapPrefix: 2
				},
				files: {
					'public/static/js/base.min.js': ['<%= concat.js.dest %>']
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
					'public/static/css/base.min.css': ['<%= concat.css.dest %>']
				}
			}
		},
		copy: {
			"bootstrap-theme":{
				expand: true,
				cwd: "components/bootstrap/dist/css/",
				src: ["bootstrap-theme.css", "bootstrap-theme.css.map"],
				dest: 'public/static/css'
			},
			"bootstrap-fonts": {
				expand: true,
				cwd: "components/bootstrap/dist/",
				src: ["fonts/*"],
				dest: 'public/static'
			},
			//"Font-Awesome-fonts": {
			//	expand: true,
			//	cwd: "components/Font-Awesome/",
			//	src: ["fonts/*"],
			//	dest: 'public/static'
			//},
			"bootstrap-datetimepicker-locales": {
				expand: true,
				cwd: "components/bootstrap-datetimepicker/js/",
				src: ["locales/*"],
				dest: 'public/static/js'
			},
			"gallery":{
				expand: true,
				cwd: "components/Gallery/",
				src: ["img/*"],
				dest: 'public/static/'
			},
			"bootstrap-gallery":{
				expand: true,
				cwd: "components/Bootstrap-Image-Gallery/",
				src: ["img/*"],
				dest: 'public/static/'
			},
		},

	});

	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-concat" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );
	grunt.loadNpmTasks( "grunt-contrib-cssmin" );
	grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'copy']);

};


