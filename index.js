/**
 * load-project-config
 * https://github.com/cedaro/load-project-config
 *
 * @copyright Copyright (c) 2015 Cedaro, LLC
 * @license MIT
 */

'use strict';

var _ = require('lodash');
var path = require('path');

function Project(grunt, config) {
  if (!(this instanceof Project)) {
    return new Project(grunt, config);
  }

  var loader = {};
  var settings = {};
  var taskMap = {};

  this.loader = function(options) {
    options && _.merge(loader, options);
    return loader || {};
  };

  this.settings = function(options) {
    options && _.merge(settings, options);
    return settings || {};
  };

  this.taskMap = function(map) {
    map && _.merge(taskMap, map);
    return taskMap || {};
  };

  this.grunt = grunt;
  config = _.isFunction(config) ? config() : config;
  config.loader && this.loader(config.loader);
  delete config.loader;
  config.taskMap && this.taskMap(config.taskMap);
  delete config.taskMap;
  this.settings(config);
}

Project.prototype.getConfigPaths = function() {
  var settings = this.settings();
  var paths = [];

  // Global config path.
  if (settings.paths.global.config) {
    paths.push(settings.paths.global.grunt);
  }

  // Local config path.
  if (settings.paths.config) {
    paths.push(path.join(process.cwd(), settings.paths.grunt));
  }

  return paths;
};

Project.prototype.init = function(options) {
  var settings;

  if (options && options.loader) {
    this.loader(options.loader);
    delete options.loader;
  }

  if (options && options.taskMap) {
    this.taskMap(options.taskMap);
    delete options.taskMap;
  }

  settings = this.settings(options);

  require('time-grunt')(this.grunt);

  var loader = _.merge({
    configPath: this.getConfigPaths(),
    data: settings,
    jitGrunt: {
      customTasksDir: settings.paths.grunt + '/tasks',
      staticMappings: this.taskMap()
    }
  }, this.loader());

  require('load-grunt-config')(this.grunt, loader);

  return this;
};

module.exports = Project;
