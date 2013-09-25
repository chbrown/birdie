'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '0.7.2',
];

exports.resolve = function(version, callback) {
  var github = birdy.cdn.github('bebraw/colorjoe')('v' + version);

  callback(null, {
    'colorjoe.js': [github('dist/colorjoe.js')],
    'colorjoe.min.js': [github('dist/colorjoe.min.js')],
    'colorjoe.css': [github('css/colorjoe.css')]
  });
};
