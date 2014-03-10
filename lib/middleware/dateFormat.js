var format = require('dateformat');

module.exports = function dateFormat(req, res, next){
	res.dateFormat = res.locals.dateFormat = format;
	next();
}
