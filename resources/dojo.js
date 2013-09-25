'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '1.0.1',
  '1.0.2',
  '1.0.3',
  '1.0.4',
  '1.0.5',
  '1.0.6',
  '1.1.3',
  '1.1.4',
];

exports.resolve = function(version, callback) {
  // cloudflare calls it angular.js, google calls it angularjs.
  var cloudflare = birdy.cdn.cloudflare('angular.js')(version);
  var google = birdy.cdn.google('angularjs')(version);
  var http = birdy.cdn.http('code.angularjs.org')(version);
  callback(null, {
    'angular.min.js': birdy.mapApply([cloudflare, google, http], 'angular.min.js'),
    'angular.js': birdy.mapApply([cloudflare, google, http], 'angular.js')
  });
};
