
var route = module.exports = {};

route.list = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	res.format({
		html: function(){
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
	res.format({
		html: function(){
			res.render("new");
		}
	});
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
	res.format({
		html: function(){
			res.render("edit");
		}
	});
}

route.del = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	res.format({
		html: function(){
			res.redirect("list");
		}
	});
}

