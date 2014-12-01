var fs = require( 'fs' ),
	_ = require( 'lodash-node' ),
	when = require( 'when' ),
	spawn = require( 'child_process' ).spawn,
	StringDecoder = require( 'string_decoder' ).StringDecoder,
	nodefn = require( 'when/node' ),
	whenFs = nodefn.liftAll( fs ),
	whenKeys = require( 'when/keys' );

var tools = {};

// sync
// Select files from array which have ".html" extension.
// Location: tools.
tools.selectFilesSync = function( filesArr ) {
	return _.filter( filesArr, function( fileName ) {
		return fileName.match( /.html$/i ) != null;
	} );
};

// Tools.
tools.curryExec = function( command, args, silent ) {
	silent = ( silent === true );

	return function() {
		return when.promise( function( resolve, reject ) {
			var cmd = spawn( command, args );

			//VERBOSE && console.log( 'Executing: ', command, args.join( ' ' ) );

			if ( !silent ) {
				cmd.stdout.on( 'data', consoleBuffer );
				cmd.stderr.on( 'data', consoleBuffer );
			}

			function consoleBuffer( data ) {
				var decoder = new StringDecoder( 'utf8' );
				//console.log( decoder.write( data ) );
			}

			cmd.on( 'exit', function( code ) {
				cmd.stdin.end();

				if ( code === 0 ) {
					resolve();
				} else {
					reject( code );
				}
			} );
		} );
	}
};

/**
 * In first param key is a file name and value is file content.
 *
 * @param {Object} data
 * @returns {Promise}
 */
// Tools
tools.saveFiles = function( data ) {
	var filesReadPromises = _.map( data, function( fileContent, fileName ) {
		var promise = whenFs.writeFile( fileName, fileContent, 'utf8' );

		return [ fileName, promise ];
	} );

	filesReadPromises = _.object( filesReadPromises );

	return whenKeys.all( filesReadPromises );
};

tools.handleFileSync = function( path, handler ) {
	var content = fs.readFileSync( path, 'utf8' ),
	result = handler( content );

	( typeof result === 'string' ) && fs.writeFileSync( path, result, 'utf8' );
};

module.exports = tools;