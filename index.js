#!/usr/bin/env node
'use strict'; /*jslint node: true, indent: 2, vars: true, es5: true */
var async = require('async');
var child_process = require('child_process');
var fs = require('fs');
var glob = require('glob');
var logger = require('winston');
var mkdirp = require('mkdirp');
var optimist = require('optimist');
var path = require('path');
var request = require('request');
var temp = require('temp');

var config_filename = 'package.json';
var default_pattern = 'static/{resource}/{file}';

function copyFile(srcpath, dstpath, callback) {
  var dirpath = path.dirname(dstpath);
  mkdirp(dirpath, function(err) {
    if (err) {
      callback(err);
    }
    else {
      fs.unlink(dstpath, function(err) {
        if (err && err.code != 'ENOENT') {
          // ignore error if the file doesn't already exist
          callback(err);
        }
        else {
          fs.link(srcpath, dstpath, callback);
        }
      });
    }
  });
}

function writeFile(filepath, data, callback) {
  // callback signature: function(err)
  // given a full filepath, create all required directories
  // but we don't recursively create the directory
  // fs.mkdir callback signature: function(err)
  var dirpath = path.dirname(filepath);
  mkdirp(dirpath, function(err) {
    if (err)
      callback(err);
    else
      fs.writeFile(filepath, data, callback);
  });
}

function fetch(uri, callback) {
  // callback signature: function(err, data)

  if (uri.match(/^git:\/\/github.com/)) {
    // github is really nice in that it exposes all files on all branches/tags
    // over http and https at unique urls. so great!
    uri = uri.replace(/^git:\/\//, 'https://raw.');
  }

  if (uri.match(/^git:/)) {
    // for now, we only support github git addresses
    var message = 'The git:// protocol is not currently supported except for github urls.';
    callback(new Error(message));
  }
  else {
    // set encoding: null so that we get a buffer back as the body.
    request({uri: uri, encoding: null}, function (err, response, body) {
      if (err) {
        callback(err);
      }
      else if (response.statusCode != 200) {
        callback(new Error('HTTP ' + response.statusCode + ' ' + uri), body);
      }
      else {
        callback(null, body);
      }
    });
  }
}

function downloadFiles(pattern, filename_urls, done) {
  // `done` callback signature: function(err)
  async.each(Object.keys(filename_urls), function(filename, callback) {
    var urls = filename_urls[filename];
    // just use the first url, for now
    var url = urls[0];
    fetch(url, function(err, data) {
      if (err) {
        callback(err);
      }
      else {
        var filepath = pattern.replace(/\{file\}/g, filename);
        writeFile(filepath, data, function (err) {
          if (!err)
            logger.info(filepath + ' < ' + url);
          callback(err);
        });
      }
    });
  }, done);
}

function gitClone(pattern, git_url, callback) {
  // callback signature: function(err)
  temp.mkdir(null, function(err, git_dir) {
    logger.debug('git clone ' + git_url + ' ' + git_dir);
    child_process.spawn('git', ['clone', git_url, git_dir])
    .on('close', function (code) {
      // for each file in the git dir, besides .git/**, copy it as file
      if (code !== 0) {
        logger.error('git clone exited with code ' + code);
      }
      glob('**', {cwd: git_dir, mark: true}, function(err, matches) {
        // filter off the empty string for the root directory
        var files = matches.filter(function(m) { return !m.match(/\/$/); });
        // files is a list of partial filepaths (i.e., files in directories, but not absolute)
        async.each(files, function(file, callback) {
          var temppath = path.join(git_dir, file);
          var filepath = pattern.replace(/\{file\}/g, file);
          copyFile(temppath, filepath, function(err) {
            if (!err)
              logger.info(filepath + ' < ' + git_url + '/' + file);
            callback(err);
          });
        }, callback);
      });
    });
  });
}

function downloadResources(pattern, resources) {
  // console.log('downloadResources', destination, resources);
  async.each(Object.keys(resources), function (resource_name, callback) {
    var version = resources[resource_name];
    logger.info(resource_name + ' version: ' + version);
    // we partially fill the pattern as we go along.
    var resource_pattern = pattern.replace(/\{resource\}/g, resource_name);

    if (version.match(/^git:/)) {
      gitClone(resource_pattern, version, callback);
    }
    else {
      try {
        var resource_module = require('./resources/' + resource_name);
        resource_module(version, function(err, filename_urls) {
          // filename_urls is a dictionary from filenames to lists of urls
          downloadFiles(resource_pattern, filename_urls, callback);
        });
      }
      catch (exc) {
        // if the resource does not exist (no module there)
        callback(exc);
      }
    }
  }, function(err) {
    if (err) {
      logger.error(err.toString());
    }
    else {
      logger.info('Installed');
    }
  });
}

var commands = {
  init: function(argv) {
    var package_strings = argv._.slice(1);
    fs.readFile(config_filename, function (err, data) {
      if (err) {
        if (err.code == 'ENOENT')
          logger.info('Creating new package.json');
        else
          logger.error(err);
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
          logger.error(err);
        else
          logger.info('Saved package.json');
      });
    });
  },
  install: function(argv) {
    fs.readFile(config_filename, function (err, data) {
      var package_json = JSON.parse(data || '{}');
      var pattern = argv.pattern || package_json.staticPattern || default_pattern;
      var resources = package_json.staticDependencies || {};

      // the first argument was the command. the others are packages
      var package_strings = argv._.slice(1);
      package_strings.forEach(function(package_string) {
        var parts = package_string.split(/==?/);
        resources[parts[0]] = parts[1] || resources[parts[0]] || '*';
      });

      downloadResources(pattern, resources);
    });
  }
};

if (require.main === module) {
  var argv = optimist
    .usage([
      'Install external resources locally. Commands:',
      '',
      '  init [jquery==2.0.0] [backbone]',
      '    create package.json or add "staticDependencies" hash to it,',
      '    prefilled with the given packages',
      '',
      '  install [--pattern=static/{resource}/{file}] [jquery] [underscore]',
      '    fetch the packages specified in "staticDependencies" in your',
      '    package.json, as well as at the command line, and install them',
      '    into the specified folder.'
    ].join('\n'))
    .check(function(argv) {
      var command = argv._[0];
      if (!commands[command])
        throw new Error('Invalid command: ' + command);
    })
    .argv;

  if (argv.verbose) {
    logger.level = 'debug';
  }

  var command = argv._[0];
  commands[command](argv);
}

