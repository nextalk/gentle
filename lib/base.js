
var extend = require("./util.js").extend
  , base = module.exports = {
	}
  , defaultClass = function(){};

defaultClass.prototype = base;

/**
 * Set the attribute names for config
 *
 * - `name` The base name
 *
 * @api protected
 */ 
base.attrs = ["name"];

/**
 * Configure
 *
 * @param  {string|array} name  If a string, the name of the setting to set or retrieve. Else an associated array of setting names and values
 * @param  {mixed}        value If name is a string, the value of the setting identified by `name`
 * @return {mixed}        The value of a setting if only one argument is a string
 * @api public
 *
 */

base.config = function( name, value ) {
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift( false );
	return this._config.apply( this, args );
}

/**
 * Configure for default value
 * @api public
 *
 */

base.default = function( name, value ) {
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift( true );
	return this._config.apply( this, args );
}

base._config = function( def, name, value )
{
	var settings = this.settings = this.settings || {}
	  , attrs = this.attrs || [];
	if (arguments.length === 2) {
		if (typeof name == "object") {
			for ( var key in name ) {
				var value = name[ key ];
				if( !def || !settings.hasOwnProperty(key))
					settings[key] = value;
				if( attrs.indexOf( key ) != -1 ) {
					if( !def || !this.hasOwnProperty(key) )
						this[ key ] = value;
				}
			}
		} else {
			return this.hasOwnProperty( name ) && this[name] !== undefined ? this[name] : settings[name];
		}
	} else {
		if( !def || !settings.hasOwnProperty(name))
			settings[name] = value;
		if( attrs.indexOf( name ) != -1 ) {
			if( !def || !this.hasOwnProperty(name) )
				this[ name ] = value;
		}
	}
	return this;
}

/**
 * Set children object
 *
 * @param	{String|Object}	name of the child or a Base object
 * @param	{Array}			settings of the child
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
	if( !children.hasOwnProperty[ name ] ) {
		if( !child )
			child = new childClass( name );
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
			if( key.substr(0, 1) == "!" ) {
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


