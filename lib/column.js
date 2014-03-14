
var base = require("./base")
  , util = require("util")
  , singularize = require("./singularize")
  , extend = require("./extend");

module.exports = function(name, settings){
	if( name ) {
		this.name = name;
		this.default("label", singularize(name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g,' ')));
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
 * 	- `disabled`	Disabled state for input
 * 	- `dict`	Associate data
 *
 */

column.attr("name", "label", "oriType", "type", "extra", "help", "error", "formatter", "primary", "value", "disabled");

column.dict = null;

/**
 *
 * Filter option from other table
 * Will set type to 'select'
 *
 * @param {Table} table
 * @param {String} display Display for the select
 * @param {Array|String} scope [localKey, remoteKey]
 * @return {This|Object} Return the select object when no argument
 *
 */

column.select = function(table, display, scope){
	if( !arguments.length )
		return this._select;
	this._select = {
		table: this.table.db.table(table)
	  , display: display
	  , scope: scope ? (Array.isArray(scope) ? scope : [scope, scope]) : scope
	};
	//Set the scope column
	if(this._select.scope){
		this.table.column(this._select.scope[0]).scope = true;
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
		.permit("update", 0)
		.permit("sort", 0);
	this._has = {
		table: this.table.db.table(table)
	  , key: key || (singularize(this.table.name) + "_id")
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

function selectFormatter(col, value, row){
	if(value !== undefined && col.dict && col.dict[value] !== undefined)
		return col.dict[value];
	return value;
}
var formatter = {
	"select": selectFormatter
  , "radio": selectFormatter
  , "has": function(col, value, row){
	  var id = row[col.table.primaryKey()];
	  if(id !== undefined && col.dict && col.dict[id] !== undefined)
		  value = col.dict[id];
	  else 
		  value = 0;
	  var t = col.has();
	  if(t.table) {
		  var ob = {};
		  ob[t.key] = id;
		  return ["link", value, t.table, ob ];
	  }
	  return value;
	}
  , "belong": function(col, value, row){
	  var content = value;
	  if(value !== undefined && col.dict && col.dict[value] !== undefined)
		  content = col.dict[value];
	  var t = col.belong();
	  if(t.table) {
		  var ob = {};
		  ob[t.table.primaryKey()] = value;
		  return ["link", content, t.table, ob ];
	  }
	  return content;
	}
  , "datetime": function(col, value, row){
	  return ["datetime", value];
	}
  , "date": function(col, value, row){
	  return ["date", value];
	}
  , "time": function(col, value, row){
	  return ["time", value];
	}
  , "bool": function(col, value, row){
	  return ["bool", value];
	}
  , "image": function(col, value, row){
	  return ["image", value];
	}
  , "file": function(col, value, row){
	  return ["file", value];
	}
  , "link": function(col, value, row){
	  var url = value && !/^https?:/.test(value) ? ("http://" + value) : value;
	  return value ? ["link", value, url] : value;
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

