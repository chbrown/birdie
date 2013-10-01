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
  '3.13.0',
  '3.14.0',
  '3.15.0',
  '3.16.0',
  '3.17.0',
  '3.18.0',
];

exports.resolve = function(version, callback) {
  // cloudflare actually only has 3.16.0, 3.12.0, and 2.36.0, btw
  var cloudflare_version = version.match(/\d+\.\d+\.\d+/) ? version : version + '.0';
  var cloudflare = birdy.cdn.cloudflare('codemirror')(cloudflare_version);
  // yeah this versioning is stupid
  var github_version = version.match(/\d+\.\d+\.\d+/) ? version : 'v' + version;
  var github = birdy.cdn.github('marijnh/CodeMirror')(github_version);
  callback(null, {
    'codemirror.min.js': [cloudflare('codemirror.min.js')],
    'codemirror.js': [github('lib/codemirror.js'), cloudflare('codemirror.js')],
    'codemirror.css': [github('lib/codemirror.css'), cloudflare('codemirror.css')]
  });
};
