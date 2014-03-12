module.exports = function brand(req, res, next) {
	var app = req.app;
	if (app.enabled('x-powered-by')) 
		res.setHeader('X-Powered-By', 'Gentle');

	res.locals.brand_name = app.get("brand") || "Gentle";	

	next();
};
