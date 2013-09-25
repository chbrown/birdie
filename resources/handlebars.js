'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '1.0.0',
  '1.0.0-rc.3',
  '1.0.0-rc.4',
  '1.0.rc.1',
  '1.0.rc.2',
  '1.0.6',
  '1.0.6-2',
  '1.0.7',
  '1.0.8',
  '1.0.9',
  '1.0.10',
  '1.0.11',
  '1.0.12',
];

exports.resolve = function(version, callback) {
  var github = birdy.cdn.github('wycats/handlebars.js')('v' + version);
  callback(null, {
    'handlebars.js': [github('dist/handlebars.js')],
    'handlebars.runtime.js': [github('dist/handlebars.runtime.js')]
  });
};
