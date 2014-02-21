var gentle = require('../')
  , should = require("should")
  , db = require('../lib/db.js')
  , mysql = require('../lib/db/mysql.js')
  , fs = require('fs')
  , config =require('../config.js');

describe('util', function() {
	it('should parse attribute from comment', function(){
		var res = db.parseComment( 'Type|select(0:Default,1:Life,2:News)//Select the category' );
		res.label.should.be.equal('Type');
		res.extra.should.be.eql( [ [ '0', 'Default' ], [ '1', 'Life' ], [ '2', 'News' ] ] );
		res.type.should.be.equal('select');
		res.help.should.be.equal('Select the category');

		res = db.parseComment( 'Blog' );
		res.label.should.be.equal('Blog');
		should.not.exist( res.help );
		should.not.exist( res.type );
	});
});

describe('mysql', function() {
	it('should parse column type', function(){
		var res = mysql.parseType( 'enum(\'N\',\'Y\')' );
		res.extra.should.have.length( 2 );
		res.extra[0].should.eql( ['N', 'N'] );
		res.type.should.be.equal('select');
		res = mysql.parseType( 'tinyint(1)' );
		res.type.should.be.equal('bool');
		res = mysql.parseType( "enum('personal','family','friend','classmate')" );
		res.type.should.be.equal('select');
		res = mysql.parseType( "set('twitter','facebook','google')" );
		res.type.should.be.equal('checkgroup');

		res = mysql.parseType( 'int(5)' );
		res.type.should.be.equal('number');
		res.extra.should.be.eql( 1 );

		res = mysql.parseType( 'decimal(5,2)' );
		res.type.should.be.equal('number');
		res.extra.should.be.eql( Math.pow(0.1, 2) );
	});

	it('should add table', function(){
		var mydb = new mysql(config.mysql);
		var _admin;
		var admin = mydb.table("admin", "Adm", {
			per_size: 30
		}, function(ad){
			_admin = ad;
			this.should.be.equal( mydb );
		});
		_admin.should.be.equal( admin );
		admin.per_size.should.be.equal( 30 );
		admin.alias.should.be.equal( "Adm" );
		var admin2 = mydb.table("admin");
		admin2.should.be.equal( admin );

		var blog = mydb.table("blog");
		blog.alias.should.be.equal("Blog");
	});

	describe('connect', function() {
		var db = new mysql( config.mysql + "?multipleStatements=true" );
		before(function(done){
			var sql = fs.readFileSync( __dirname + "/test.sql", "UTF8")
			  , dbname = "gentle_test";

			db.query("drop database if exists ??;create database ??;use ??;" + sql, [dbname, dbname, dbname], function(err){
				if( err )
					throw err;
				done();
			});
		});
		it('should load tables info for database', function( done ){
			db.load( function( err ) {
				if( err )
					throw err;
				var post = db.table("posts");
				post.alias.should.be.equal("Post");
				done();
			} );
		});
		it('should load table schema for database', function( done ){
			db.loadTable("posts", function(err, table){
				if( err )
					throw err;
				table.should.be.an.Array;
				done();
			});
		});
		after(function(done){
			db.destroy();
			done();
		});
	});
});

