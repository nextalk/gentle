var gentle = require('../')
  , should = require("should")
  , table = require('../lib/table.js')
  , column = require('../lib/column.js');

describe('table util', function() {
	it('pair', function(){
		table._pair([{a:1,b:1,c:1},{a:2,b:2,c:"c"}]).should.be.eql([[1,1,1], [2,2,"c"]]);
		table._pair([{a:1,b:1,c:1},{a:2,b:2,c:"c"}], "b", "c").should.be.eql([[1,1], [2,"c"]]);
	});
	it('dict', function(){
		table._dict([{a:1,b:1,c:1},{a:2,b:2,c:"c"}], "a", "c").should.be.eql({"1": "1", "2": "c"});
		table._dict([[1,"c"], [2,"c"]]).should.be.eql( {"1": "c", "2": "c"});
		table._dict([{a:1,b:1,c:1},{a:2,b:2,c:"c"}]).should.be.eql({"1": "1", "2": "2"});
	});
});

describe('table', function() {
	it('should add column', function(){
		var admin = new table("admin");
		admin.name.should.be.equal("admin");
		var col = admin.column("username", "Username", {
			"type": "text"
		});
		col.label.should.be.equal("Username");
		col.type.should.be.equal("text");
		var col2 = admin.column("password", {
			"type": "password"
		});
		col2.label.should.be.equal("Password");
		col2.type.should.be.equal("password");
		var col3 = admin.column("address", "Add");
		col3.label.should.be.equal("Add");
		var col4 = admin.column("email");
		col4.label.should.be.equal("Email");
		col4.should.be.an.instanceof( column );
		var col5 = admin.column("email");
		col5.should.be.equal( col4 );

		admin.columns().should.have.length(4);

	});
});

