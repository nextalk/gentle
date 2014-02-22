
var base = require("./base.js")
  , util = require("util")
  , extend = require("./extend.js");

module.exports = function(name, settings){
	if( name ) {
		this.name = name;
		this.label = name.charAt(0).toUpperCase() + name.slice(1);
	}
	this.config(settings);
};

var column = module.exports.prototype = {
	__proto__: base
  , attrs: ["name", "label", "type", "extra", "help", "error", "formatter"]
};

column.inspect = function(){
	return "column( '"+this.name+"', "+util.inspect(this.settings || {}, {
		depth: null
	})+" )";
}

