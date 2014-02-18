var gentle = require('../')
  , should = require("should")
  , base = require('../lib/base.js');

var defaultClass = function(){};
defaultClass.prototype = base;

describe('config', function() {
	it('should set/get', function(){
		var base = new defaultClass();
		base.config("a", 1).config("a").should.be.equal(1);
		base.config({"b": 2, "c": 3}).config("b").should.be.equal(2);
		should.not.exist( base.c );
		base.config("name", "post").config("name").should.be.equal("post");
		base.name.should.be.equal("post");
	});
	it('should set default value', function(){
		var base = new defaultClass();
		base.attrs = ["name", "alias"];
		base.default("def", 1).config("def").should.be.equal(1);
		base.config("def2", 1).default("def2", 3).config("def2").should.be.equal(1);
		base.default("alias", 1).alias.should.be.equal(1);
	});
});

describe('child', function() {
	it('should add child', function(){
		var base = new defaultClass();
		var child = base.child( "admin", { alias: "Admin", type: "m" } );
		child.child.should.be.a.Function;
		child.name.should.be.equal( "admin" );
		child.config("alias").should.be.equal( "Admin" );
		child.config("type").should.be.equal( "m" );

		var child2 = base.child( "blog", { alias: "Blog" } );
		child2.config("alias").should.be.equal( "Blog" );

		var child3 = base.child( child, { alias: "Admin2" } );
		child3.config("alias").should.be.equal( "Admin2" );
		child3.should.be.equal( child );

		var child4 = base.child( "blog" );
		child4.should.be.equal( child2 );

	});
});

describe('permit', function() {
	it('should default ok', function(){
		var base = new defaultClass();
		base.permit("update").should.be.ok;
	});
	it('should be set/get', function(){
		var base = new defaultClass();
		base.permit("create", 0);
		base.permit("create").should.not.be.ok;
		base.permit("display", 2).permit("display").should.be.equal(2);
	});
	it('should set for children', function(){
		var base = new defaultClass();
		var admin = base.child( "admin", { name: "Admin", type: "m" } );
		admin.permit("update").should.be.ok;
		base.permit("update", "!admin,!blog");
		admin.permit("update").should.not.be.ok;
		var blog = base.child( "blog", { name: "Blog" } );
		blog.permit("update").should.not.be.ok;
	});
});



