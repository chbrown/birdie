#!/usr/bin/env node
'use strict'; /*jslint node: true, es5: true, indent: 2 */
var logger = require('loge');

var optimist = require('optimist')
  .usage([
    'Usage: birdy <command> [<options>]',
    '',
    '  init [jquery==2.0.0] [backbone]',
    '    create package.json or add "staticDependencies" hash to it,',
    '    prefilled with the given packages',
    '',
    '  install [jquery] [underscore==1.5.2]',
    '    fetch the packages specified in "staticDependencies" in your',
    '    package.json, as well as at the command line, and install them',
    '    into the specified folder.',
    '',
    '  search [query]',
    '    list resources that birdy supports, filtering by query, if',
    '    specified',
  ].join('\n'))
  .describe({
    help: 'print this help message',
    version: 'print birdy version and exit',
    verbose: 'print extra output',
    config: 'JSON config file with staticPattern and staticDependencies fields.',
    pattern: 'naming scheme for local files - defaults to "static/{resource}/{file}"',
  })
  .boolean(['help', 'verbose', 'version'])
  .default({
    config: 'package.json',
  })
  .alias({
    pattern: 'staticPattern',
  });

var argv = optimist.argv;
logger.level = argv.verbose ? 'debug' : 'info';

if (argv.help) {
  optimist.showHelp();
}
else if (argv.version) {
  // read birdy's own package.json for the current version
  console.log(require('../package').version);
}
else {
  var commands = require('./birdy-commands');
  argv = optimist.check(function(argv) {
    var command = argv._[0];
    if (commands[command] === undefined) {
      throw new Error('You must specify a valid command.');
    }
  }).argv;

  var command = argv._[0];
  commands[command](argv);
}
