'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '1.0.0',
  '1.1.0',
  '1.2.0',
  '1.3.0',
  '1.4.0',
  '1.5.0',
  '1.6.0',
  '1.7.0',
  '1.7.1',
  '1.7.2',
  '1.7.3',
  '1.7.4',
  '1.7.5',
  '1.7.6',
  '1.8.0',
  '1.8.1',
  '1.8.2',
  '1.8.3',
  '1.8.4',
  '1.8.5',
  '1.8.6',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('js-url')(version);
  var github = birdy.cdn.github('websanova/js-url')('v' + version);

  callback(null, {
    'js-url.min.js': birdy.mapApply([github, cloudflare], 'url.min.js'),
    'js-url.js': birdy.mapApply([github, cloudflare], 'url.js')
  });
};
