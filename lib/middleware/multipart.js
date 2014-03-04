var busboy = require("connect-busboy");

module.exports = function(options) {
	options = options || {};
	options.immediate = false;
	return function(req, res, next){
		req.files = {};
		busboy(options)(req, res, function(){
			if( !req.busboy )
				return next();

			//Handled by urlencoded
			if( mime(req) == 'application/x-www-form-urlencoded' ) {
				delete req.busboy;
				return next();
			}

			var files = {}
			  , body = {};

			req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
				var data = new Buffer(0);
				file.on("data", function(d){
					data = Buffer.concat([data, d]);
				});
				file.on("end", function(){
					file.type = file.mime = mimetype;
					file.name = file.filename = filename;
					file.encoding = encoding;
					file.data = data;
					if( data && data.length )
						ondata(fieldname, file, files);
				});
			});
			req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
				ondata(key, value, body);
			});
			req.busboy.on('finish', function() {
				req.files = files;
				req.body = body;
				next();
			});
			req.pipe(req.busboy);
		});
	}
}

function ondata(name, val, data){
	if (Array.isArray(data[name])) {
		data[name].push(val);
	} else if (data[name]) {
		data[name] = [data[name], val];
	} else {
		data[name] = val;
	}
}

function mime(req) {
	  var str = req.headers['content-type'] || '';
	    return str.split(';')[0];
};
