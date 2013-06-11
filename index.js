#!/usr/bin/env node
'use strict'; /*jslint node: true, es5: true, indent: 2 */
var async = require('async');
var child_process = require('child_process');
var fs = require('fs');
var glob = require('glob');
var logger = require('winston');
var mkdirp = require('mkdirp');
var path = require('path');
var request = require('request');
var temp = require('temp');

// default_staticPattern must not be an optimist default so that we have the order of priority:
// argv.pattern || package_json.staticPattern || default_staticPattern;
var default_staticPattern = 'static/{resource}/{file}';

function parseJSON(s) {
  try {
    return JSON.parse(s);
  }
  catch (exc) {
    return exc;
  }
}

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
    fs.readFile(argv.config, function (err, data) {
      if (err) {
        if (err.code == 'ENOENT') {
          logger.info('Creating new ' + argv.config);
        }
        else {
          logger.error(err);
        }
      }

      var package_json = parseJSON(data);
      if (package_json instanceof Error) {
        logger.error('Could not parse ' + argv.config + ', "' + data + '". ' +
          'Error: ' + package_json.toString());
      }
      else {
        var resources = package_json.staticDependencies || {};
        package_strings.forEach(function(package_string) {
          var parts = package_string.split(/==?/);
          // 1) if a particular version is specified, use that.
          // or 2) if there is already a version specified in the package.json, use
          // it instead. 3) default to '*' in all other cases
          resources[parts[0]] = parts[1] || resources[parts[0]] || '*';
        });

        package_json.staticDependencies = resources;
        package_json.staticPattern = package_json.staticPattern || argv.pattern || default_staticPattern;
        fs.writeFile(argv.config, JSON.stringify(package_json, null, '  '), function (err) {
          if (err)
            logger.error(err);
          else
            logger.info('Saved package.json');
        });
      }
    });
  },
  install: function(argv) {
    fs.readFile(argv.config, function (err, data) {
      var package_json = JSON.parse(data || '{}');
      var pattern = argv.pattern || package_json.staticPattern || default_staticPattern;
      var resources = package_json.staticDependencies || {};

      // the first argument was the command. the others are packages
      var package_strings = argv._.slice(1);
      package_strings.forEach(function(package_string) {
        var parts = package_string.split(/==?/);
        resources[parts[0]] = parts[1] || resources[parts[0]] || '*';
      });

      downloadResources(pattern, resources);
    });
  },
  search: function(argv) {
    var query = argv._.slice(1).join(' ');
    var resources_path = path.normalize(path.join(__dirname, 'resources'));
    var resources_glob = query ? ('*' + query + '*.js') : '*.js';
    glob(resources_glob, {cwd: resources_path, nocase: true}, function(err, resource_names) {
      if (err) logger.error(err);
      async.each(resource_names, function(resource_js, callback) {
        var resource_name = resource_js.replace(/\.js$/, '');
        var resource_module = require('./resources/' + resource_name);
        resource_module('*', function(err, filename_urls) {
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
  },
};

if (require.main === module) {
  var argv = require('optimist')
    .usage([
      '',
      'Usage: birdy <command> [--pattern=static/{resource}/{file}]',
      '',
      '  init [jquery==2.0.0] [backbone]',
      '    create package.json or add "staticDependencies" hash to it,',
      '    prefilled with the given packages',
      '',
      '  install [jquery] [underscore]',
      '    fetch the packages specified in "staticDependencies" in your',
      '    package.json, as well as at the command line, and install them',
      '    into the specified folder.',
      '',
      '  search [query]',
      '    list available resources (filtering by query, if specified)',
    ].join('\n'))
    .default({
      config: 'package.json'
    })
    .boolean(['help', 'verbose'])
    .check(function(argv) {
      if (argv.help || commands[argv._[0]] === undefined)
        throw new Error('You must specify a command.');
    })
    .argv;

  logger.level = argv.verbose ? 'debug' : 'info';
  var command = argv._[0];
  commands[command](argv);
}
