'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '1.0.0',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('ace')(version);
  var github = birdy.cdn.github('ajaxorg/ace-builds')('v' + version);

  callback(null, {
    'ace.min.js': [github('src-min/ace.js'), cloudflare('ace.min.js')],
    'ace.js': [github('src/ace.js'), cloudflare('ace.js')]
  });
};
