'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '1',
  '2',
  '2.0',
  '2.01',
  '2.02',
  '2.1',
  '2.11',
  '2.12',
  '2.13',
  '2.14',
  '2.15',
  '2.16',
  '2.17',
  '2.18',
  '2.2',
  '2.21',
  '2.22',
  '2.23',
  '2.24',
  '2.25',
  '2.3',
  '2.31',
  '2.32',
  '2.33',
  '2.34',
  '2.35',
  '2.36',
  '2.37',
  '2.38',
  '3.0',
  '3.01',
  '3.02',
  '3.1',
  '3.11',
  '3.12',
];

exports.resolve = function(version, callback) {
  // cloudflare actually only has 3.12.0 and 2.36.0, btw
  var cloudflare = birdy.cdn.cloudflare('codemirror')(version + '.0');
  var github = birdy.cdn.github('marijnh/CodeMirror')('v' + version);
  callback(null, {
    'codemirror.min.js': [cloudflare('codemirror.min.js')],
    'codemirror.js': [github('lib/codemirror.js'), cloudflare('codemirror.js')],
    'codemirror.css': [github('lib/codemirror.css'), cloudflare('codemirror.css')]
  });
};
