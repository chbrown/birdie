'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '0.1.0',
  '0.1.1',
  '0.1.2',
  '0.2.0',
  '0.3.0',
  '0.3.1',
  '0.3.2',
  '0.3.3',
  '0.5.0',
  '0.5.1',
  '0.5.2',
  '0.5.3',
  '0.9.0',
  '0.9.1',
  '0.9.2',
  '0.9.9',
  '1.0.0',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('backbone.js')(version);
  var github = birdy.cdn.github('documentcloud/backbone')(version);
  callback(null, {
    'backbone.min.js': birdy.mapApply([cloudflare, github], 'backbone-min.js'),
    'backbone.js': birdy.mapApply([cloudflare, github], 'backbone.js')
  });
};
