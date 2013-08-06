#!/usr/bin/env node
'use strict'; /*jslint node: true, es5: true, indent: 2 */
var async = require('async');
var birdy = require('./');
var fs = require('fs');
var glob = require('glob');
var logger = require('winston');
var path = require('path');

function parseJSON(s) {
  /** run JSON.parse on the input string `s`, but catch and return any errors
    instead of raising them directly */
  try {
    return JSON.parse(s);
  }
  catch (exc) {
    return exc;
  }
}

var commands = module.exports = {};

commands.init = function(argv) {
  var package_strings = argv._.slice(1);
  fs.readFile(argv.config, function (err, data) {
    if (err && err.code != 'ENOENT') {
      throw err;
    }

    var package_json = {};
    if (err && err.code == 'ENOENT') {
      logger.info('Creating new ' + argv.config);
    }
    else {
      package_json = parseJSON(data);
      if (package_json instanceof Error) {
        logger.error('Could not parse ' + argv.config + ', "' + data + '". ' +
          'Error: ' + package_json.toString());
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
    fs.writeFile(argv.config, JSON.stringify(package_json, null, '  '), function (err) {
      if (err)
        logger.error(err);
      else
        logger.info('Saved package.json');
    });
  });
};

commands.install = function(argv) {
  fs.readFile(argv.config, function (err, data) {
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

commands.search = function(argv) {
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
};

function main() {
  var basic = require('optimist').boolean(['help', 'verbose', 'version']);
  var argv = basic.argv;

  var full = basic
    .usage([
      'Usage: birdy <command> [<options>]',
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
      '    list resources that birdy supports, filtering by query, if',
      '    specified',
    ].join('\n'))
    .default({
      config: 'package.json',
    })
    .describe({
      help: 'print this help message',
      version: 'print birdy version and exit',
      verbose: 'print extra output',
      config: 'JSON config file with staticPattern and staticDependencies fields.',
      pattern: 'naming scheme for local files - defaults to static/{resource}/{file}',
    })
    .alias({
      pattern: 'staticPattern',
    })
    .check(function(argv) {
      var command = argv._[0];
      if (commands[command] === undefined) {
        throw new Error('You must specify a valid command.');
      }
    });

  if (argv.help) {
    full.showHelp();
    process.exit(0);
  }
  else if (argv.version) {
    // read birdy's own package.json for the current version
    console.log(require('./package').version);
  }
  else {
    argv = full.argv;
    logger.level = argv.verbose ? 'debug' : 'info';

    var command = argv._[0];
    commands[command](argv);
  }
}

if (require.main === module) { main(); }
