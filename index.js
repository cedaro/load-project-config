var _ = require( 'lodash' ),
	path = require( 'path' );

function Project( grunt, config ) {
	if ( ! ( this instanceof Project ) ) {
        return new Project( grunt, config );
	}

	var settings = {},
		taskMap = {};

	this.settings = function( options ) {
		options && _.merge( settings, options );
		return settings || {};
	}

	this.taskMap = function( map ) {
		map && _.merge( taskMap, map );
		return taskMap || {};
	}

	this.grunt = grunt;
	config = _.isFunction( config ) ? config() : config;
	config.taskMap && this.taskMap( config.taskMap );
	delete config.taskMap;
	this.settings( config );
}

Project.prototype.getConfigPaths = function() {
	var settings = this.settings(),
		paths = [];

	// Global config path.
	if ( settings.paths.global.config ) {
		paths.push( settings.paths.global.grunt );
	}

	// Local config path.
	if ( settings.paths.config ) {
		paths.push( path.join( process.cwd(), settings.paths.grunt ) );
	}

	return paths;
}

Project.prototype.init = function( options ) {
	var settings = this.settings( options );

	require( 'time-grunt' )( this.grunt );

	require( 'load-grunt-config' )( this.grunt, {
		configPath: this.getConfigPaths(),
		data: settings,
		jitGrunt: {
			customTasksDir: settings.paths.grunt + '/tasks',
			staticMappings: this.taskMap()
		}
	});

	return this;
}

module.exports = Project;
