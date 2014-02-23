
var route = module.exports = {};

route.list = function(req, res, next){
	if( ! req.table ) {
		return next();
	}
	res.format({
		html: function(){
			res.render("list");
		}
	  , xls: function(){
		  res.render("index");
		}
	  , ajax: function(){
		  res.render("list");
		}
	});
}


