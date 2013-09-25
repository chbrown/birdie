'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '1.0.0',
  '1.0.1',
  '1.0.2',
  '1.1.0',
  '1.1.1',
  '1.1.2',
  '2.0.0',
  '2.0.1',
  '2.1.0',
  '2.1.1',
  '2.1.2',
];

exports.resolve = function(version, callback) {
  var github = birdy.cdn.github('necolas/normalize.css')('v' + version);
  var cloudflare = birdy.cdn.cloudflare('normalize')(version);
  callback(null, {
    'normalize.css': birdy.mapApply([github, cloudflare], 'normalize.css')
  });
};
