var base = require("./base.js")
  , extend = require("./extend.js")
  , action = require("./action.js");

module.exports = function(name, settings){
	this.name = name;
	this.config( settings );
};

var actionManager = module.exports.prototype = {
	__proto__: base
  , childClass: action
  , attrs: ["name"]
};


actionManager.action = function(table, name, settings){
	var child
	  , callable
	  , args = Array.prototype.slice.call(arguments, 0)
	  , len = args.length;
	args.shift();

	if( len && typeof args[len-1] == "function" ){
		len--;
		callable = args.pop();
	}
	args.shift();
	if( typeof settings == "string" ) {
		settings = { "alias": settings };
		args.shift();
	} else {
		settings = {};
	}
	settings.callable = callable;
	settings.table = table;
	return this.child( name, extend.apply( null, [settings].concat(args) ) );
}

actionManager.actions = function(){
	return this.childrenList || [];
}


