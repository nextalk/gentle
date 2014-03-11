
var extend = require("./extend")
  , clone = require("clone")
  , base = module.exports = {
	}
  , defaultClass = function(){};

defaultClass.prototype = base;

/**
 * Set the attribute names for config
 *
 * @param {Array|String} name
 *
 * @api protected
 */ 

base.attr = function( name ) {
	if( arguments.length > 1 ) {
		for (var i = arguments.length - 1; i >= 0; i--) {
			this.attr( arguments[i] );
		};
	} else if( Array.isArray( name ) ) {
		for (var i = name.length - 1; i >= 0; i--) {
			this.attr( name[i] );
		};
	} else if( name ) {
		this.__defineGetter__(name, function(){
			return this.valueFor( name );
		});
		this.__defineSetter__(name, function(val){
			this.settings = this.settings || {};
			this.settings[name] = val;
		});
	}
	return this;
}

base.attr("name");

/**
 * Configure
 *
 * @param  {String|Object} name  If a string, the name of the setting to set or retrieve. Else an associated array of setting names and values
 * @param  {mixed}        value If name is a string, the value of the setting identified by `name`
 * @return {mixed}        The value of a setting if only one argument is a string
 * @api public
 *
 */

base.config = function( name, value ) {
	var settings = this.settings = this.settings || {};
	if (arguments.length === 1) {
		if (typeof name == "object") {
			extend( settings, name );
		} else {
			return this.valueFor( name );
		}
	} else {
		settings[name] = value;
	}
	return this;
}
/**
 *
 * @api private
 */
base.valueFor = function( name ) {
	var settings = this.settings;
	return settings && settings.hasOwnProperty(name) ? settings[name]
		: this.defaults && this.defaults[name];
}

/**
 * Configure for default value
 * @api public
 *
 */

base.default = function( name, value ) {
	var defaults = this.defaults = this.defaults || {};
	if (arguments.length === 1) {
		if (typeof name == "object") {
			extend( defaults, name );
		} else {
			return defaults[name];
		}
	} else {
		defaults[name] = value;
	}
	return this;

}

/**
 * Set children object
 *
 * @param	{String|Object}	name of the child or a Base object
 * @param	{Object}			settings of the child
 * @api		protected
 *
 */

base.child = function( name, settings ) {
	var child = null
	  , children = this.children = this.children || {}
	  , childrenList = this.childrenList = this.childrenList || []
	  , childClass = this.childClass || defaultClass;

	if( name instanceof childClass ) {
		child = name;
		name = child.name;
	}
	if( typeof name !== "string" ) {
		throw new Error('name must a string or Base object.');
	}
	if( !children.hasOwnProperty( name ) ) {
		if( !child ) {
			child = new childClass( name );
			child.config("name", name);
		}
		children[ name ] = child;
		childrenList.push( child );
		//auto complete permit
		if( this.permissions ) {
			for ( var key in this.permissions ) {
				var perm = this.permissions[ key ];
				if( typeof perm == "object" && perm.hasOwnProperty(name) ) {
					child.permit( key, perm[name] );
				}
			}
		}
	} else {
		child = children[ name ];
	}

	var args = Array.prototype.slice.call(arguments, 0);
	args.shift();
	if( args.length )
		child.config.apply( child, args );

	return child;
}

/**
 * Check the child exists
 *
 * @param {String} name
 *
 */

base.hasChild = function(name){
	if(name !== undefined)
		return !!(this.children && this.children[ name ]);
	else
		return !!(this.childrenList && this.childrenList.length);
}

/**
 *
 * Permission control
 *
 * Examples:
 *
 * 		//Set
 * 		table.permit("create", 0)
 *
 *		//Set for child object
 * 		db.permit("manage", "admin,posts,!logs")
 * 		table.permit("display", "name,!created_at")
 * 		table.permit("sort", ["!created_at", "name"])
 *
 * 		//Get
 * 		table.permit("create") //0
 *
 * @param	{String}	name of the permission
 * @param	{Number|String|Array}	value The permission level; It will define the children permission when `value` is array or string.
 * @return	{Number|Object}        The permission level of this class, return `1` if not set permission by `name`
 * @api		public
 *
 */

base.permit = function( name, value ){
	var perm = this.permissions = this.permissions || {};
	var children = this.children;
	if (arguments.length === 1) {
		return perm.hasOwnProperty( name ) ? perm[ name ] : 1;
	} else {
		if( typeof value == "string" ) {
			value = value.trim().split( new RegExp("\\s*,\\s*") );
		} else if( !Array.isArray( value ) ) {
			perm[ name ] = value;
			return this;
		}
		//Children...
		var obj = {}
		  , len = value.length;
		for (var i = 0; i < len; i++) {
			var key = value[i];
			if( key.charAt(0) == "!" ) {
				key = key.substr(1);
				obj[ key ] = 0;
			} else {
				obj[ key ] = len - i + 1;
			}
			if( children && children.hasOwnProperty( key ) ) {
				children[ key ].permit( name, obj[ key ] );
			}
		}
		perm[name] = perm.hasOwnProperty( name )
			&& typeof perm[name] == "object"
			? extend(perm[name], obj) : obj;
		return this;
	}
}

/**
 * Return a instance of the base object
 */

base.instance = function(){
	var obj = {
		settings: clone(this.settings)
	  , defaults: clone(this.defaults)
	  , permissions: clone(this.permissions)
	};
	obj.__proto__ = this;
	var list = [], ob = {};
	if( this.childrenList ) {
		for (var i = 0, l = this.childrenList.length; i < l; i++) {
			var child =this.childrenList[i].instance();
			list.push(child);
			ob[child.name] = child;
		};
		obj.childrenList = list;
		obj.children = ob;
	}
	return obj;
}


