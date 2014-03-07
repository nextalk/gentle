
var base = require("./base")
  , util = require("util")
  , extend = require("./extend");

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

/**
 * Attributes:
 *
 * 	- `name`
 * 	- `label`
 * 	- `type`
 * 	- `extra`
 * 	- `help`
 * 	- `error`
 * 	- `formatter`
 * 	- `primary`
 * 	- `value`	The default value
 * 	- `dict`	Associate data
 *
 */

column.attr("name", "label", "oriType", "type", "extra", "help", "error", "formatter", "primary", "value");

column.dict = null;

/**
 *
 * Filter option from other table
 * Will set type to 'select'
 *
 * @param {Table} table
 * @param {String} display Display for the filter
 * @param {Array|String} scope [localKey, remoteKey]
 * @return {This|Object} Return the filter object when no argument
 *
 */

column.filter = function(table, display, scope){
	if( !arguments.length )
		return this._filter;
	this._filter = {
		table: this.table.db.table(table)
	  , display: display
	  , scope: scope ? (Array.isArray(scope) ? scope : [scope, scope]) : scope
	};
	//Set the scope column
	if(this._filter.scope){
		this.table.column(this._filter.scope[0]).scope = true;
	}
	return this;
}

/**
 * The has many relation
 *
 * @param {Table} table
 * @param {Array|String} key [local, remote]
 * @return {This|Object} Return the has object when no argument
 *
 */
column.has = function(table, key){
	if( !arguments.length )
		return this._has;
	this.permit("create", 0)
		.permit("update", 0);
	this._has = {
		table: this.table.db.table(table)
	  , key: key
	};
	if(this.formatter === undefined)
		this.formatter = "has";
	return this;
}

/**
 * The belong to relation
 *
 * @param {Table} table
 * @param {String} display display column name from the table
 * @return {This|Object} Return the belong object when no argument
 *
 */
column.belong = function(table, display){
	if( !arguments.length )
		return this._belong;
	this._belong = {
		table: this.table.db.table(table)
	  , display: display
	};
	if(this.formatter === undefined)
		this.formatter = "belong";
	return this;
}

/**
 * Set the default formatter for type
 */
var formatter = {
	"select": function(col, value, row){
		if(value !== undefined && col.dict && col.dict[value] !== undefined)
			return col.dict[value];
		return value;
	}
  , "has": function(col, value, row){
	  value = row[col.table.primaryKey()];
	  if(value !== undefined && col.dict && col.dict[value] !== undefined)
		  return col.dict[value];
	  return 0;
	}
  , "belong": function(col, value, row){
	  if(value !== undefined && col.dict && col.dict[value] !== undefined)
		  return col.dict[value];
	  return value;
	}
};

/**
 * Format the value
 */
column.format = function(value, row){
	var f = this.formatter !== false 
		&& (typeof this.formatter == "function" ? this.formatter : formatter[this.formatter]) 
		|| formatter[this.type];
	if(f)
		return f(this, value, row);
	return value;
}

column.inspect = function(){
	return "column( '"+this.name+"', "+util.inspect(this.settings || {}, {
		depth: null
	})+" )";
}

