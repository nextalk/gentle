
var extend = require("./util.js").extend
  , proto = module.exports = {
	};

/**
 *
 * Permission control
 *
 * Examples:
 *
 * 		db.permit("manage", "admin,posts,!logs")
 * 		table.permit("create", false)
 * 		table.permit("display", "name,!created_at")
 * 		table.permit("sort", "!created_at")
 *
 * @param	{String}	name of the permission
 * @param	{Number|String|Array}	value The permission level; It will define the children permission when `value` is array or string.
 * @return mixed        The permission level of this class, return `1` if not set permission by `name`
 * @api public
 *
 */

proto.permit = function( name, value ){
	var perm = this->permissions = this->permissions || {};
	var children = this->children;
	if (arguments.length === 1) {
		return perm.hasOwnProperty( name ) ? perm[ name ] : 1;
	} else {
		if( typeof value == "string" ) {
			value = value.trim().split( new RegExp("\\s*,\\s*") );
			//Children...
			var ar = {}
			  , len = value.length;
			for (var i = 0; i < len; i++) {
				var key = value[i];
				if( key.substr(0, 1) == "!" ) {
					key = key.substr(1);
					ar[ key ] = 0;
				} else {
					ar[ key ] = len - i + 1;
				}
				if( children && children.hasOwnProperty( key ) ) {
					children[ key ].permit( name, ar[ key ] );
				}
			}
			perm[name] = perm.hasOwnProperty( name )
				&& Array.isArray( perm[name] )
				? extend(perm[name], ar) : ar;

		} else if( Array.isArray( value ) ) {
			perm[ name ] = value;
		}
		return this;
	}
}

