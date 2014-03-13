/**
 * Attributes:
 *
 * 		- `name`
 * 		- `alias`
 * 		- `desc`
 * 		- `per_size`
 * 		- `primary`
 *
 */
var base = require("./base")
  , extend = require("./extend")
  , util = require("util")
  , async = require("async")
  , pager = require("./pager")
  , singularize = require("./singularize")
  , column = require("./column")
  , actionManager = require("./actionManager");

module.exports = function(name, settings){
	if( name ) {
		this.name = name;
		this.default("alias", singularize(name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g,' ')));
	}
	this.default("per_size", 15);
	this._actions = new actionManager("actions");
	this._multiActions = new actionManager("multiActions");
	this.config( settings );
};

var table = module.exports.prototype = {
	__proto__: base
  , childClass: column
};

table.attr("name", "alias", "desc", "per_size");

table.__defineGetter__("primary", function(){
	if( this._primary )
		return this._primary;
	if( this.childrenList ) {
		for (var i = 0, l = this.childrenList.length; i < l; i++) {
			var col = this.childrenList[i];
			if( col.primary ) {
				this._primary = col;
				return col;
			}
		};
	}
});

table.primaryKey = function(){
	return this.primary && this.primary.name || "id";
}

/**
 * Configure column
 *
 * @param  {String} name The name of the column
 * @param  {String|Object} settings  If a string, the name of the setting to set or retrieve. Else an associated array of setting names and values
 *
 * @return {Table}
 */

table.column = function( name, settings ){
	var child
	  , callable
	  , args = Array.prototype.slice.call(arguments, 0)
	  , len = args.length;

	if( len && typeof args[len-1] == "function" ){
		len--;
		callable = args.pop();
	}
	args.shift();
	if( typeof settings == "string" ) {
		settings = { "label": settings };
		args.shift();
	} else {
		settings = {};
	}
	child = this.child( name, extend.apply( null, [settings].concat(args) ) );
	child.table = this;
	if( callable ) {
		callable.call( this, child );
	}
	return child;
}

/**
 * Get columns
 *
 * @return {Array} columns
 */

table.columns = function(){
	return this.childrenList || [];
}

/**
 * Check if has column by name
 *
 * @param {String} name
 * @return {Boolean} 
 * @api public
 *
 */

table.hasColumn = table.hasChild;

/**
 * Configure action
 *
 * @param {String} name
 * @param {Object} settings
 * @param {Function} handler
 */
table.action = function( name, settings, handler ) {
	var args = Array.prototype.slice.call(arguments,0);
	args.unshift(this);
	return this._actions.action.apply(this._actions, args);
}

table.actions = function() {
	return this._actions.actions();
}

table.hasAction = function(name) {
	return this._actions.hasAction(name);
}

/**
 * Configure multi-action
 *
 * @param {String} name
 * @param {Object} settings
 * @param {Function} handler
 */
table.multiAction = function( name, settings, handler ) {
	var args = Array.prototype.slice.call(arguments,0);
	args.unshift(this);
	return this._multiActions.action.apply(this._multiActions, args);
}

table.multiActions = function() {
	return this._multiActions.actions();
}

table.hasMultiAction = function(name) {
	return this._multiActions.hasAction(name);
}

/**
 * Config the search UI
 */
table.search = function(){
	if(!arguments.length)
		return this._search;
	this._search = {
		title: arguments[arguments.length-1]
	  , fields:Array.prototype.slice.call(arguments,0, -1)
	};
	return this;
}

/**
 * Define the default conditions for permit
 *
 * Will set disabled state for create,update,filter
 *
 */
table.conditions = function(obj){
	if(!arguments.length)
		return this._conditions;
	var cond = this._conditions = extend({}, this._conditions, obj);
	for(var k in cond){
		//Disabled state for create,update,filter
		if(this.hasColumn(k) && cond[k] !== undefined){
			this.column(k, {
				disabled: true
			});
		}
	}
	return this;
}

/**
 * Get the filters option
 * type-> select,date
 * permit("filter")
 *
 table.filters = function(){
 var columns = this.columns()
 , filters = [];
 for (var i = 0, l = columns.length; i < l; i++) {
 var col = columns[i];
 if(col.permit("filter")){
 if(col.type == "select" && Array.isArray(col.extra) && col.extra.length){
 filters.push({
 type: "select"
 , options: extra
 });
 }
 }
 };
 return filters;
 }
 */

/**
 * Query conditions
 *
 * Reserved option: page,sort,q
 */

table.where = function(obj){
	if(!arguments.length)
		return this._where || {};
	obj = extend({}, this._where, obj);
	//Clean page and sort
	delete obj.page;
	delete obj.sort;
	for(var key in obj){
		if((key != "q" && !this.hasColumn(key)) || obj[key] === ''){
			delete obj[key];
		}
	}
	this._where = obj;
	return this;
}

table.group = function(name){
	if(!arguments.length)
		return this._group;
	this._group = name;
	return this;
}

table.field = function(names){
	if(!arguments.length)
		return this._field;
	this._field = (this._field || []).concat(Array.prototype.slice.call(arguments,0));
	return this;
}

table.sort = function(name){
	if(!arguments.length)
		return this._sort || {name: this.primaryKey()};
	if(name) {
		var asc, name;
		if(typeof name == "object"){
			asc = name.asc;
			name = name.name;
		}else{
			asc = name.charAt(0) === "-";
			name = asc ? name.slice(1) : name;
		}
		name = name || this.primaryKey();
		if(this.hasColumn(name)){
			this._sort = {name: name, asc: asc};
		}
	}
	return this;
}

table.pager = function(page){
	if(!arguments.length)
		return this._pager;
	this._page = page;
	this._hasPage = true;
	return this;
}

table.associate = function(ass){
	if(!arguments.length)
		return this._associate;
	this._associate = ass;
	return this;
}

/**
 * @api private
 */

table._cond = function(){
	var cond = extend({}, this.where(), this.conditions());

	//The search param
	var q = cond.q
	  , search = this.search();
	if(search && q){
		cond.q = {
			type: "search"
		  , key: search.fields
		  , value: q
		};
	} else {
		delete cond.q;
	}
	return {
		conditions: cond
	  , fields: this.field()
	  , group: this.group()
	};
}

table.count = function(fn){
	this.db.count(this.name, this._cond(), fn);
	return this;
}

table.all = function(fn){
	var self = this
	  , cond = self._cond();
	function page(cb){
		if(self._hasPage){
			self.db.count(self.name, extend({},cond,{fields: null}), function(err, num){
				cond.page = self._pager = new pager(self._page, num, self.per_size);
				cb(err);
			});
		}else{
			cb(null);
		}
	}
	page(function(err){
		if(err)
			return fn && fn(err);
		cond.sort = self.sort();
		self.db.all(self.name, cond, function(err, rows){
			if(err)
				return fn && fn(err);
			self._associateData(rows || [], function(err){
				if(err)
					return fn && fn(err);
				self._filterData(cond.conditions, function(err){
					fn && fn(err, rows);
				});
			});
		});
	});
	return this;
}

table.new = function(params, fn){
	var obj = {};
	this.columns().forEach(function(col){
		obj[col.name] = col.value;
	});
	obj = extend(obj, params, this.conditions());
	this._filterData(obj, function(err){
		fn && fn(err, obj);
	});
}

table.find = function(id, fn, optionForFilter){
	var op = this._cond()
	  , self = this;
	op.conditions[this.primaryKey()] = id;
	this.db.find(this.name, op, function(err, row){
		if(err)
			return fn && fn(err);
		self._filterData(extend(row, optionForFilter), function(err){
			fn && fn(err, row);
		});
	});
	return this;
}

table.update = function(id, obj, fn, checkPermit){
	obj = obj || {};
	var op = this._cond()
	  , key = this.primaryKey();
	op.conditions[key] = id;

	var data = {}
	  , columns = this.columns()
	  , pass = false;
	for (var i = 0, l = columns.length; i < l; i++) {
		var col = columns[i]
		  , name = col.name;
		if( name != key && obj[name] !== undefined && (!checkPermit || col.permit(checkPermit))){
			data[name] = Array.isArray(obj[name]) ? obj[name].join(",") : obj[name];
			pass = true;
			//Fix- Error: ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: Incorrect integer value
			if( data[name] === '' )
				data[name] = null;
		}
	};
	if(pass){
		this.db.update(this.name, op, data, function(err, row){
			fn && fn(err, row);
		});
	}else{
		fn && fn(new Error("Nothing for update"));
	}
	return this;
}

table.create = function(obj, fn, checkPermit){
	obj = extend({}, obj, this.conditions());
	var key = this.primaryKey();

	var data = {}
	  , columns = this.columns()
	  , pass = false;
	for (var i = 0, l = columns.length; i < l; i++) {
		var col = columns[i]
		  , name = col.name;
		if(name != key && obj[name] !== undefined && (!checkPermit || col.permit('create'))){
			pass = true;
			data[name] = Array.isArray(obj[name]) ? obj[name].join(",") : obj[name];
			if( data[name] === '' )
				data[name] = null;
		}
	};
	if(pass){
		this.db.create(this.name, data, function(err, row){
			fn && fn(err, row);
		});
	}else{
		fn && fn(new Error("Nothing for update"));
	}
	return this;
}

table.delete = function(id, fn){
	var op = this._cond();
	op.conditions[this.primaryKey()] = id;
	this.db.delete(this.name, op, function(err, row){
		fn && fn(err, row);
	});
	return this;
}

/**
 * Fetch data for the filter column
 *
 * @api private
 */
table._filterData = function(params, fn){
	if(this._associate){
		async.eachSeries(this.columns(), function(col, done){
			var filter = col.filter();
			if((col.type == "select" || col.type == "radio") && col.extra){
				col.dict = dict(col.extra);
			}
			if(col.filter()){
				var where = {}
				  , scope = filter.scope
				  , key = filter.table.primaryKey();
				if(scope){
					if(params && params[scope[0]] !== undefined && params[scope[0]] !== ''){
						where[scope[1]] = params[scope[0]];
					} else {
						col.type = "select";
						col.extra = [];
						return done();
					}
				}
				filter.table.instance()
					.where(where)
					.sort({asc:true})
					.field(key, filter.display)
					.all(function(err, rows){
						if( !err ){
							col.type = "select";
							col.extra = pair(rows, key, filter.display);
							col.dict = dict(col.extra);
						}
						done(err);
					});
			} else {
				done();
			}
		}, function(err){
			fn && fn(err);
		});
	}else{
		fn && fn(null);
	}
	return this;
}

/**
 * Fetch the associate data
 * @api private
 */

table._associateData = function(data, fn){
	if(this._associate && data && data.length){
		var keyId = this.primaryKey()
		  , ids = data.map(function(d){
			  return d[keyId];
			});
		async.eachSeries(this.columns(), async.applyEachSeries([
			function has(col, done){
				var has = col.has();
				if(has){
					var where = {}
					  , key = has.key;
					where[key] = ids;
					has.table.instance()
						.where(where)
						.field(key)
						.group(key)
						.count(function(err, rows){
							if( !err)
								col.dict = dict(rows);
							done(err);
						})
				}else{
					done();
				}
			}, 
			function belong(col, done){
				var belong = col.belong();
				if(belong){
					var where = {}
					  , key = belong.table.primaryKey()
					  , ids = data.map(function(d){
						  return d[col.name];
						}).filter(function(d){
							return !!d;
						});
					if( ids.length ){
						where[key] = ids;
						belong.table.instance()
							.where(where)
							.field(key, belong.display)
							.all(function(err, rows){
								if( !err)
									col.dict = dict(rows, key, belong.display);
								done(err);
							});
					} else {
						col.dict = {};
						done();
					}
				}else{
					done();
				}
			}])
		  , function(err){
			  fn && fn(err);
			});
	}else{
		fn && fn(null);
	}
	return this;
}

/**
 * Load columns schema for database and automatic configuration
 *
 */

table.load = function( fn ){
	var self = this;
	self.db.loadTable( this.name, function(err, columns) {
		if( !err ) {
			columns.forEach( function(column){
				var obj = extend({}, column);
				delete obj.name;
				self.column(column.name).default(obj);
			} );
		}
		fn && fn( err, self );
	} );
	return this;
}

table.inspect = function(){
	var columns = this.columns()
	  , markup = [];
	columns.forEach(function(t){
		t = "  table." + t.inspect().replace(/\n/g, "\n  " );
		markup.push( t );
	});
	markup = markup.length ? ", function( table ){\n"+markup.join("\n") + "\n}" : "";
	return "table( '"+this.name+"', "+util.inspect(this.settings || {}, {
		depth: null
	})+markup+" );";
}

module.exports._dict = dict;
module.exports._pair = pair;
/**
 * 
 * pair([{a:1,b:1,c:1},{a:2,b:2,c:"c"}]) => [[1,1,1], [2,2,"c"]]
 * pair([{a:1,b:1,c:1},{a:2,b:2,c:"c"}], "b", "c") => [[1,1], [2,"c"]]
 */

function pair(rows) {
	if(!Array.isArray(rows)){
		return [];
	}
	var fields = Array.prototype.slice.call(arguments,1);
	fields = fields.length ? fields : null;
	return rows.map(function( row ) {
		fields = fields || Object.keys(row);
		return fields.map(function(f){
			return row[f];
		});
	});
}

/**
 * 
 * dict([{a:1,b:1,c:1},{a:2,b:2,c:"c"}], "a", "c") => {"1": "1", "2": "c"}
 * dict([[1,"c"], [2,"c"]]) => {"1": "c", "2": "c"}
 */

function dict(rows){
	var obj = {};
	var fields = Array.prototype.slice.call(arguments,1);
	if(!Array.isArray(rows)){
		return obj;
	}
	if( fields.length ) {
		rows.forEach(function( row ) {
			obj[row[fields[0]]] = row[fields[1]];
		});
	}else{
		var keys;
		rows.forEach(function( row ) {
			keys = keys || (Array.isArray(row) ? [0,1] : Object.keys(row));
			obj[row[keys[0]]] = row[keys[1]];
		});
	}
	return obj;
}



