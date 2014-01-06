'use strict'; /*jslint node: true, es5: true, indent: 2 */
var async = require('async');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var logger = require('loge');

var birdy = require('..');

exports.init = function(argv) {
  var package_strings = argv._.slice(1);
  fs.readFile(argv.config, function(err, data) {
    if (err && err.code != 'ENOENT') {
      // die on any error *besides* a missing config file
      throw err;
    }

    var package_json = {};
    if (err && err.code == 'ENOENT') {
      logger.info('Creating "%s"', argv.config);
    }
    else {
      try {
        package_json = JSON.parse(data);
      }
      catch (exc) {
        logger.error('Could not parse "%s" as JSON: %s\n%s', argv.config, exc, package_json);
      }
    }

    var resources = package_json.staticDependencies || {};
    package_strings.forEach(function(package_string) {
      var parts = package_string.split(/==?/);
      // 1) if a particular version is specified, use that.
      // or 2) if there is already a version specified in the package.json, use
      // it instead. 3) default to '*' in all other cases
      resources[parts[0]] = parts[1] || resources[parts[0]] || '*';
    });

    package_json.staticDependencies = resources;
    // the staticPattern option defers to 1) the command line argument, if specified.
    // otherwise, it will use 2) the pattern specified by the config file, or, if
    // neither is specified, the default, 3) "static/{resource}/{file}"
    package_json.staticPattern = argv.staticPattern || package_json.staticPattern || birdy.defaults.staticPattern;
    fs.writeFile(argv.config, JSON.stringify(package_json, null, '  '), function(err) {
      if (err) return logger.error('fs.writeFile error: %s', err);

      logger.info('Saved package.json');
    });
  });
};

exports.install = function(argv) {
  fs.readFile(argv.config, function(err, data) {
    var package_json = JSON.parse(data || '{}');
    var pattern = argv.staticPattern || package_json.staticPattern || birdy.defaults.staticPattern;
    var resources = package_json.staticDependencies || {};

    // the first argument was the command. the others are packages
    var package_strings = argv._.slice(1);
    package_strings.forEach(function(package_string) {
      var parts = package_string.split(/==?/);
      resources[parts[0]] = parts[1] || resources[parts[0]] || '*';
    });

    birdy.downloadResources(pattern, resources);
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
            line += ' [' + urls[0] + ', ...]';
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
