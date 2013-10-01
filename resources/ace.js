'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '0.1.0',
  '0.1.1',
  '0.1.3',
  '0.1.4',
  '0.1.5',
  '0.1.6',
  '0.2.0',
  '1.0.0',
  '1.1.01',
  '1.1.1',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('ace')(version);
  var github = birdy.cdn.github('ajaxorg/ace-builds')('v' + version);

  callback(null, {
    'ace.min.js': [github('src-min/ace.js'), cloudflare('ace.min.js')],
    'ace.js': [github('src/ace.js'), cloudflare('ace.js')]
  });
};
