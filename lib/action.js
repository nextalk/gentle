
var base = require("./base.js")
  , extend = require("./extend.js");

module.exports = function(name, settings){
	if( name ) {
		this.name = name;
		this.alias = name.charAt(0).toUpperCase() + name.slice(1);
	}
	this.columnList = [];
	this.config(settings);
};

var action = module.exports.prototype = {
	__proto__: base
};

action.attr("alias", "submit", "display", "handler", "table", "columnNames");

action.columns = function(){
	return this.columnNames ? 
		(typeof this.columnNames == "string" ? this.columnNames.split( new RegExp("\\s*,\\s*") ) : this.columnNames) : [];
}

