'use strict'; /*jslint node: true, es5: true, indent: 2 */
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var logger = require('loge');

var birdy = require('..');
var Dependency = require('../dependency');
var config = require('../config');

exports.init = function(argv) {
  // the first argument was the command. the others are dependencies
  config.read(argv.config, argv.staticPattern, argv._.slice(1), function(err, dependencies, pattern, package_object) {
    if (err) return logger.error('config.read error:', err);

    // logger.debug('dependencies: %j -> %j', dependencies, Dependency.makeMap(dependencies));

    package_object.staticPattern = pattern;
    package_object.staticDependencies = Dependency.makeMap(dependencies);

    // logger.debug('Writing config: %j', package_object);

    fs.writeFile(argv.config, JSON.stringify(package_object, null, '  '), function(err) {
      if (err) return logger.error('fs.writeFile error: %s', err);

      logger.info('Wrote "%s"', argv.config);
    });
  });
};

exports.install = function(argv) {
  config.read(argv.config, argv.staticPattern, argv._.slice(1), function(err, dependency_list, pattern, package_object) {
    // todo: check for --save flag and writeFile like in init?
    // logger.debug('Dependencies:', dependency_list.dependencies);

    async.each(dependency_list.dependencies, function(dependency, callback) {
      dependency.fetch(pattern, callback);
    }, function(err) {
      if (err) return logger.error(err);

      logger.info('Done installing');
    });
  });
};

exports.search = function(argv) {
  var query = argv._.slice(1).join(' ');
  var resources_dirpath = path.normalize(path.join(__dirname, '..', 'resources'));
  var resources_glob = query ? ('*' + query + '*.js') : '*.js';
  glob(resources_glob, {cwd: resources_dirpath, nocase: true}, function(err, resource_names) {
    if (err) return logger.error(err);

    async.each(resource_names, function(resource_js, callback) {
      var resource_name = resource_js.replace(/\.js$/, '');
      var resource_module = require(path.join(resources_dirpath, resource_name));
      resource_module.resolve('*', function(err, filename_urls) {
        if (err) return callback(err);

        // filename_urls is a dictionary from filenames to lists of urls
        console.log(resource_name + ':');
        for (var filename in filename_urls) {
          var urls = filename_urls[filename];
          var line = '  - ' + filename;
          if (argv.verbose) {
            line += ' [' + urls[0].join(', ') + ']';
          }
          console.log(line);
        }
        callback(err);
      });
    }, function(err) {
      logger.debug('Done searching.');
    });
  });
};
