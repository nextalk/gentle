
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
  , attrs: ["name", "alias", "submit", "display", "callable", "table", "columnNames"]
};

action.columns( name, settings ){
	var columns = this.columnNames;
	if( columns ) {
		var table = this.table;
		if( table ) {
			this.columnNames = null;
			columns = typeof columns == "string" ?
				columns.split( new RegExp("\\s*,\\s*") ) : columns;
			for (i = 0; i < columns.length; i++) {
				var col = columns[i];
				if(!Array.isArray(col)){
					col = [col];
				}
				this.columnList.push( this.column.apply(this.column, col) );
			}
		}
	}
	return this.columnList;
}

action.column( name, settings )
{
	return this.table.column.apply(this.table, arguments);
}



