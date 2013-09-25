'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '1.2.3',
  '1.2.6',
  '1.3.0',
  '1.3.1',
  '1.3.2',
  '1.4.1',
  '1.4.2',
  '1.4.3',
  '1.4.4',
  '1.6.1',
  '1.6.2',
  '1.6.4',
  '1.7',
  '1.7.1',
  '1.7.2',
  '1.8.0',
  '1.8.1',
  '1.8.2',
  '1.8.3',
  '1.9.0',
  '1.9.1',
  '1.10.1',
  '1.10.2',
  '2.0.0',
  '2.0.2',
  '2.0.3',
  // but default to latest in major version 1.x.x
  '1.10.2',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('jquery')(version);
  var google = birdy.cdn.google('jquery')(version);
  callback(null, {
    'jquery.min.js': [
      'http://code.jquery.com/jquery-' + version + '.min.js',
      cloudflare('jquery.min.js'),
      google('jquery.min.js')
    ],
    'jquery.js': [
      'http://code.jquery.com/jquery-' + version + '.js',
      cloudflare('jquery.js'),
      google('jquery.js')
    ]
  });
};
