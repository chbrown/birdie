'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '0.1',
];

exports.resolve = function(version, callback) {
  var github = birdy.cdn.github('dtao/lazy.js')('v' + version);
  callback(null, {
    'lazy.min.js': [github('lazy.min.js')],
    'lazy.js': [github('lazy.js')]
  });
};
