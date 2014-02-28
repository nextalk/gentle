var gentle = require('../')
  , should = require("should")
  , urlFor = require('../lib/middleware/url.js').urlFor
  , table = require('../lib/table.js')
  , column = require('../lib/column.js');

describe('urlFor', function() {
	var post = new table("posts");
	post.column("id", "ID", {
		primary: true
	});
	post.column("title", "Title");

	it('should be able to get url for table', function(){
		urlFor('/posts').should.be.equal('/posts');
		should.ok( post.primary );
		urlFor(post).should.be.equal('/posts');
		urlFor(post, {id: 3}).should.be.equal('/posts/3');
		urlFor(post, {id: 3}, 'edit').should.be.equal('/posts/3/edit');
		urlFor(post, {page:3}).should.be.equal('/posts?page=3');
	});
});

