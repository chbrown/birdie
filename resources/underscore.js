'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

// http://underscorejs.org/#changelog
exports.versions = [
  '0.1.0',
  '0.1.1',
  '0.2.0',
  '0.3.0',
  '0.3.1',
  '0.3.2',
  '0.3.3',
  '0.4.0',
  '0.4.1',
  '0.4.2',
  '0.4.3',
  '0.4.4',
  '0.4.5',
  '0.4.6',
  '0.4.7',
  '0.5.0',
  '0.5.1',
  '0.5.2',
  '0.5.3',
  '0.5.4',
  '0.5.5',
  '0.5.7',
  '0.6.0',
  '1.0.0',
  '1.0.1',
  '1.0.2',
  '1.0.3',
  '1.0.4',
  '1.1.0',
  '1.1.1',
  '1.1.2',
  '1.1.3',
  '1.1.4',
  '1.1.5',
  '1.1.6',
  '1.1.7',
  '1.2.0',
  '1.2.1',
  '1.2.2',
  '1.2.3',
  '1.2.4',
  '1.3.0',
  '1.3.1',
  '1.3.2',
  '1.3.3',
  '1.4.0',
  '1.4.1',
  '1.4.2',
  '1.4.3',
  '1.4.4',
  '1.5.0',
  '1.5.1',
  '1.5.2',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('underscore.js')(version);
  var github = birdy.cdn.github('documentcloud/underscore')(version);
  callback(null, {
    'underscore.min.js': birdy.mapApply([cloudflare, github], 'underscore-min.js'),
    'underscore.js': birdy.mapApply([cloudflare, github], 'underscore.js')
  });
};
