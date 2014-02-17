var express = require("express");
exports = module.exports = createApp;

/**
 * Create an gentle application.
 *
 * @return {Function}
 * @api public
 */

function createApp( dboptions ) {
	if( !dboptions )
		throw new Error('database options required'); 

	var type = typeof dboptions == "string" ?
		dboptions.split(":")[0] : ( dboptions.type || "mysql" );

	var app = express();

	return app;
}

