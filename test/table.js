var gentle = require('../')
  , should = require("should")
  , table = require('../lib/table.js')
  , column = require('../lib/column.js');

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

