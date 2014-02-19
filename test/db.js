var gentle = require('../')
  , should = require("should")
  , db = require('../lib/db.js')
  , mysql = require('../lib/db/mysql.js');

describe('mysql', function() {
	it('should add table', function(){
		var mydb = new mysql("mysql://localhost/mysql");
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
});

