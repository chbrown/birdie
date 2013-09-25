'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '1.7.6',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('js-url')(version);
  var github = birdy.cdn.github('websanova/js-url')('v' + version);

  callback(null, {
    'js-url.min.js': birdy.mapApply([github, cloudflare], 'js-url.min.js'),
    'js-url.js': birdy.mapApply([github, cloudflare], 'js-url.js')
  });
};
