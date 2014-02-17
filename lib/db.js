
module.exports = db;

function db(){
}

/**
 * Load schema from database and automatic configuration
 *
 * @param {Array} data
 * @return {db}
 * @api public
 */

db.prototype.load = function( data ){
	return this;
}
