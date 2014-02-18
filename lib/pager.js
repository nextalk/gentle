/**
 * Pager
 *
 * Attributes:
 *
 * 		- `page`
 * 		- `per_size`
 * 		- `offset`
 * 		- `total`
 * 		- `prev`
 * 		- `next`
 * 		- `pages`
 * 		- `len`
 *
 */

function pager( page, num, per_size )
{
	this.config( page, num || 0, per_size || 15 );
}

pager.display = 10;

pager.prototype.config( page, num, per_size ) {
	page = parseInt( page );
	if( page < 1 )
		page = 1;

	var offset = (page - 1) * per_size
	  ,	len = Math.ceil( num / per_size )
	  , display = pager.display
	  , start = page - parseInt(display / 2);
	if( start < 1 )
		start = 1;
	var end = start + display - 1;
	if( end > len ) {
		end = len;
		start = end - display + 1;
		start = start < 1 ? 1 : start;
	}
	var pages = [];
	for (i = start; i <= end; i++) {
		pages.push( i );
	}
	var prev = page == 1 ? null : page - 1
	  , next = page == len ? null : page + 1;

	this.per_size = per_size;
	this.total = num;
	this.offset = offset;
	this.page = page;
	this.len = len;
	this.pages = pages;
	this.prev = prev;
	this.next = next;
}


