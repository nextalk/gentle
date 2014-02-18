
exports.extend = function(){
	var args = Array.prototype.slice.call(arguments)
	  , obj = args.shift() || {}
	  , from = args.pop();
	if( args.length ) {
		extend.apply( null, [obj].concat( args ) );
	}
	if ( from ) {
		for(var k in from){
			obj[k] = from[k];
		}
	}
	return obj;
}
