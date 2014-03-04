
var route = module.exports = {};

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
	res.format({
		html: function(){
			res.render("new");
		}
	});
}

route.create = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	if( res.createError ) {
		res.locals.error = res.createError.message;
		res.format({
			html: function(){
				res.render("new");
			}
		});
	} else {
		req.flash("success", res.__("Create `%s` success", req.table.alias));
		res.redirect(res.url(req.table));
	}
}

route.edit = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
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
		res.locals.error = res.updateError.message;
		res.format({
			html: function(){
				res.render("edit");
			}
		});
	} else {
		req.flash("success", res.__("Update `%s` success", req.table.alias));
		res.redirect(res.url(req.table));
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
	res.redirect(res.url(req.table));
}

