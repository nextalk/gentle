
var url = require("url")
  , route = module.exports = {};

route.index = function(req, res, next){
	res.render('index');
}

route.list = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	res.format({
		html: function(){
			res.locals.success = req.flash('success').join('<br />');
			res.locals.error = req.flash('error').join('<br />');
			res.render("list");
		}
	});
}

route.new = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	res.locals._next = req.originalUrl;
	res.locals._referrer = ref(req);
	res.format({
		html: function(){
			res.locals.success = req.flash('success').join('<br />');
			res.render("new");
		}
	});
}

route.create = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	if( res.createError ) {
		res.locals._next = req.param("_next");
		res.locals._referrer = ref(req);
		res.locals.error = res.createError.message;
		res.format({
			html: function(){
				res.render("new");
			}
		});
	} else {
		req.flash("success", res.__("Create `%s` success", req.table.alias));
		//TODO: _next url need param referrer
		res.redirect(req.param("_next") || req.param("_referrer") || res.url(req.table));
	}
}

route.edit = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	res.locals._referrer = ref(req);
	res.format({
		html: function(){
			res.render("edit");
		}
	});
}

route.update = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	if( res.updateError ) {
		res.locals._referrer = ref(req);
		res.locals.error = res.updateError.message;
		res.format({
			html: function(){
				res.render("edit");
			}
		});
	} else {
		req.flash("success", res.__("Update `%s` success", req.table.alias));
		res.redirect(req.param("_referrer") || res.url(req.table));
	}
}

route.del = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	if( res.deleteError ){
		req.flash("error", res.deleteError.message);
	} else {
		req.flash("success", res.__("Delete `%s` success", req.table.alias));
	}
	res.redirect(ref(req) || res.url(req.table));
}

route.action = function(multi) {
	return function(req, res, next){
		if( !req.action )
			return next();
		if( res.actionSuccess ){
			req.flash("success", res.__("%s `%s` success", req.action.alias, req.table.alias));
			return res.redirect(req.param("_referrer") || res.url(req.table));
		}

		res.locals._referrer = ref(req);

		if( res.actionError ) {
			res.locals.error = res.actionError.message;
		}

		res.format({
			html: function(){
				res.render(multi ? "multi-action" : "action");
			}
		});
	}
}

function ref(req){
	var ref = req.param("_referrer");
	if(ref)
		return ref;
	if((req.method == "GET" || req.method == "DELETE") && (ref = req.get("Referrer"))){
		var path = url.parse(ref).pathname;
		if(path && !endsWith(path, req.path)){
			return ref;
		}
	}
}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
