var express = require("express")
  , path = require("path")
  , extend = require("./extend.js")
  , table = require("./table.js")
  , column = require("./column.js")
  , action = require("./action.js")
  , actionManager  = require("./actionManager.js")
  , util = require("util")
  , proto = require("./application.js");

exports = module.exports = createApp;


/**
 * Create an gentle application.
 *
 *
 * @return {Function}
 * @api public
 */

function createApp() {
	var app = express();
	extend( app, proto );
	return app;
}

exports.table  = table;
exports.column  = column;
exports.action  = action;

exports.log = function( ob ){
	console.log( util.inspect(ob, false, null, true) );
}

