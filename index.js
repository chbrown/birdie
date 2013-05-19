#!/usr/bin/env node
'use strict'; /*jslint node: true, indent: 2, vars: true, es5: true */
var fs = require('fs');
var path = require('path');
var semver = require('semver');
var optimist = require('optimist');
var async = require('async');
var request = require('request');
var logger = require('winston');

var config_filename = 'package.json';

function mkdirp(path, callback) {
  // kind of like mkdir -p in that we don't report directory-already-exists errors.
  // but we don't recursively create the directory
  // fs.mkdir callback signature: function(err)
  fs.mkdir(path, function(err) {
    // swallow existing directory (EEXIST) errors
    if (err && err.code == 'EEXIST') err = null;
    callback(err);
  });
}

function downloadFiles(destination, filename_urls, done) {
  // callback signature: function(err)
  async.each(Object.keys(filename_urls), function(filename, callback) {
    var urls = filename_urls[filename];
    // console.log('filename', filename, urls);
    // just use the first url, for now
    var url = urls[0];
    // should assert that url starts with https?:// or do some sanity check
    request(url, function (err, response, body) {
      if (err) console.error(err);
      // if (response.statusCode == 200)
      // console.log(body);
      var filepath = path.join(destination, filename);
      fs.writeFile(filepath, body, function (err) {
        if (!err)
          logger.info('  ' + filename + ' < ' + url);
        callback(err);
      });
    });
  }, done);
}

function downloadResources(destination, resources) {
  // console.log('downloadResources', destination, resources);
  async.each(Object.keys(resources), function (resource_name, callback) {
    var version = resources[resource_name];
    logger.info(resource_name + ': ' + version);
    require('./resources/' + resource_name)(version, function(err, filename_urls) {
      // files is a dictionary from filenames to lists of urls
      var resource_destination = path.join(destination, resource_name);
      mkdirp(resource_destination, function(err) {
        if (err) {
          logger.error(err);
        }
        else {
          downloadFiles(resource_destination, filename_urls, callback);
        }
      });
    });
  }, function(err) {
    if (err) console.error(err);
    console.log('Installed');
  });
}

var commands = {
  init: function(argv) {
    var package_strings = argv._.slice(1);
    fs.readFile(config_filename, function (err, data) {
      if (err) {
        if (err.code == 'ENOENT')
          console.log('Creating new package.json');
        else
          console.error(err);
      }

      var package_json = JSON.parse(data || '{}');
      var resources = package_json.staticDependencies || {};

      package_strings.forEach(function(package_string) {
        var parts = package_string.split(/==?/);
        // 1) if a particular version is specified, use that.
        // or 2) if there is already a version specified in the package.json, use
        // it instead. 3) default to '*' in all other cases
        resources[parts[0]] = parts[1] || resources[parts[0]] || '*';
      });

      package_json.staticDependencies = resources;
      fs.writeFile(config_filename, JSON.stringify(package_json, null, '  '), function (err) {
        if (err)
          console.error(err);
        else
          console.log('Saved package.json');
      });
    });
  },
  install: function(argv) {
    var destination = argv.folder || 'static';
    // console.log(argv);

    mkdirp(destination, function(err) {
      if (err) {
        console.error(err);
      }
      else {
        var package_strings = argv._.slice(1);

        fs.readFile(config_filename, function (err, data) {
          var package_json = JSON.parse(data || '{}');
          var resources = package_json.staticDependencies || {};

          package_strings.forEach(function(package_string) {
            var parts = package_string.split(/==?/);
            resources[parts[0]] = parts[1] || resources[parts[0]] || '*';
          });

          downloadResources(destination, resources);
        });
      }
    });
  }
};

if (require.main === module) {
  var argv = optimist
    .usage([
      'Install external resources locally. Commands:',
      '',
      '  init [jquery===2.0.0] [backbone]',
      '    create package.json or add "staticDependencies" hash to it,',
      '    prefilled with the given packages',
      '',
      '  install [--folder=static] [jquery] [underscore]',
      '    fetch the packages specified in "staticDependencies" in your',
      '    package.json, as well as at the command line, and install them',
      '    into the specified folder.'
    ].join('\n'))
    .check(function(argv) {
      // console.log(argv._[0] in commands);
      if (!(argv._[0] in commands))
        throw new Error('Invalid command');
    })
    .argv;

  var command = argv._[0];
  commands[command](argv);
}

