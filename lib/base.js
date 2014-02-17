
var proto = module.exports = {
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
 * @param	{Number|String|Array}	value The permission level; It will define the children permission when $value is array or string.
 * @return mixed        The permission level of this class, return `true` if not set permission by $name
 * @api public
 *
 */

proto.permit = function( name, value ){
}

