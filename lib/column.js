
var base = require("./base.js")
  , util = require("util")
  , extend = require("./extend.js");

module.exports = function(name, settings){
	if( name ) {
		this.name = name;
		this.default("label", name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g,' '));
	}
	this.config(settings);
};

var column = module.exports.prototype = {
	__proto__: base
};

column.attr("name", "label", "oriType", "type", "extra", "help", "error", "formatter", "primary", "value");

column.inspect = function(){
	return "column( '"+this.name+"', "+util.inspect(this.settings || {}, {
		depth: null
	})+" )";
}

