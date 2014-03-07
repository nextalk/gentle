/**
 * From: https://github.com/dreamerslab/node.inflection/blob/master/lib/inflection.js
 */

var uncountable_words = [
	'equipment', 'information', 'rice', 'money', 'species',
	'series', 'fish', 'sheep', 'moose', 'deer', 'news'
];

var singular_rules = [

	// do not replace if its already a singular word
	[ new RegExp( '(m)an$',                 'gi' )],
	[ new RegExp( '(pe)rson$',              'gi' )],
	[ new RegExp( '(child)$',               'gi' )],
	[ new RegExp( '^(ox)$',                 'gi' )],
	[ new RegExp( '(ax|test)is$',           'gi' )],
	[ new RegExp( '(octop|vir)us$',         'gi' )],
	[ new RegExp( '(alias|status)$',        'gi' )],
	[ new RegExp( '(bu)s$',                 'gi' )],
	[ new RegExp( '(buffal|tomat|potat)o$', 'gi' )],
	[ new RegExp( '([ti])um$',              'gi' )],
	[ new RegExp( 'sis$',                   'gi' )],
	[ new RegExp( '(?:([^f])fe|([lr])f)$',  'gi' )],
	[ new RegExp( '(hive)$',                'gi' )],
	[ new RegExp( '([^aeiouy]|qu)y$',       'gi' )],
	[ new RegExp( '(x|ch|ss|sh)$',          'gi' )],
	[ new RegExp( '(matr|vert|ind)ix|ex$',  'gi' )],
	[ new RegExp( '([m|l])ouse$',           'gi' )],
	[ new RegExp( '(quiz)$',                'gi' )],

	// original rule
	[ new RegExp( '(m)en$', 'gi' ),                                                       '$1an' ],
	[ new RegExp( '(pe)ople$', 'gi' ),                                                    '$1rson' ],
	[ new RegExp( '(child)ren$', 'gi' ),                                                  '$1' ],
	[ new RegExp( '([ti])a$', 'gi' ),                                                     '$1um' ],
	[ new RegExp( '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$','gi' ), '$1$2sis' ],
	[ new RegExp( '(hive)s$', 'gi' ),                                                     '$1' ],
	[ new RegExp( '(tive)s$', 'gi' ),                                                     '$1' ],
	[ new RegExp( '(curve)s$', 'gi' ),                                                    '$1' ],
	[ new RegExp( '([lr])ves$', 'gi' ),                                                   '$1f' ],
	[ new RegExp( '([^fo])ves$', 'gi' ),                                                  '$1fe' ],
	[ new RegExp( '([^aeiouy]|qu)ies$', 'gi' ),                                           '$1y' ],
	[ new RegExp( '(s)eries$', 'gi' ),                                                    '$1eries' ],
	[ new RegExp( '(m)ovies$', 'gi' ),                                                    '$1ovie' ],
	[ new RegExp( '(x|ch|ss|sh)es$', 'gi' ),                                              '$1' ],
	[ new RegExp( '([m|l])ice$', 'gi' ),                                                  '$1ouse' ],
	[ new RegExp( '(bus)es$', 'gi' ),                                                     '$1' ],
	[ new RegExp( '(o)es$', 'gi' ),                                                       '$1' ],
	[ new RegExp( '(shoe)s$', 'gi' ),                                                     '$1' ],
	[ new RegExp( '(cris|ax|test)es$', 'gi' ),                                            '$1is' ],
	[ new RegExp( '(octop|vir)i$', 'gi' ),                                                '$1us' ],
	[ new RegExp( '(alias|status)es$', 'gi' ),                                            '$1' ],
	[ new RegExp( '^(ox)en', 'gi' ),                                                      '$1' ],
	[ new RegExp( '(vert|ind)ices$', 'gi' ),                                              '$1ex' ],
	[ new RegExp( '(matr)ices$', 'gi' ),                                                  '$1ix' ],
	[ new RegExp( '(quiz)zes$', 'gi' ),                                                   '$1' ],
	[ new RegExp( 'ss$', 'gi' ),                                                          'ss' ],
	[ new RegExp( 's$', 'gi' ),                                                           '' ]
];

function _apply_rules( str, rules, skip, override ){
	if( override ){
		str = override;
	}else{
		var ignore = skip.indexOf(str.toLowerCase()) > -1;
		if( !ignore ){
			var i = 0;
			var j = rules.length;

			for( ; i < j; i++ ){
				if( str.match( rules[ i ][ 0 ])){
					if( rules[ i ][ 1 ] !== undefined ){
						str = str.replace( rules[ i ][ 0 ], rules[ i ][ 1 ]);
					}
					break;
				}
			}
		}
	}
	return str;
}


module.exports = function(str, singular){
	return _apply_rules( str, singular_rules, uncountable_words, singular );
}

