module.exports = function brand(req, res, next) {
	var app = req.app;
	if (app.enabled('x-powered-by')) 
		res.setHeader('X-Powered-By', 'Gentle');

	if(!res.locals.brand_name)
		res.locals.brand_name = "Gentle";	

	next();
};
