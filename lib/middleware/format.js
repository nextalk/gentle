var mime = require("express").mime;

mime.define({
	"text/plain": ["ajax"]
});

module.exports = function(req, res, next, format) {
	format = req.params.format || format;
	if( format ) {
		var accept = mime.lookup( format );
		req.headers.accept = accept;
	}
	next();
}

