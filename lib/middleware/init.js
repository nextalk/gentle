module.exports = function(req, res, next) {
	var app = req.app;
	if (app.enabled('x-powered-by')) 
		res.setHeader('X-Powered-By', 'Gentle');

	if(!res.locals.brand_name)
		res.locals.brand_name = "Gentle";

	var path = req.app.path();
	res.locals.urlFor = function( url ){
		return path == "/" ? url : ( path + url );
	}
	next();
};
