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
};

actionManager.action = function(table, name, settings){
	var child
	  , handler
	  , args = Array.prototype.slice.call(arguments, 0)
	  , len = args.length - 1;
	args.shift();

	if( len && typeof args[len-1] == "function" ){
		len--;
		handler = args.pop();
	}
	args.shift();
	if( typeof settings == "string" ) {
		settings = { "alias": settings };
		args.shift();
	} else {
		settings = {};
	}
	if(handler)
		settings.handler = handler;
	settings.table = table;
	return this.child( name, extend.apply( null, [settings].concat(args) ) );
}

actionManager.actions = function(){
	return this.childrenList || [];
}

actionManager.hasAction = actionManager.hasChild;

