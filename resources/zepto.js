'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '0.6',
  '0.7',
  '0.8',
  '1.0',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('zepto')(version);
  // github doesn't actually hold the builds!
  // var github = birdy.cdn.github('madrobby/zepto')('v' + version);
  callback(null, {
    'zepto.min.js': [cloudflare('zepto.min.js')],
    'zepto.js': [cloudflare('zepto.js')]
  });
};
