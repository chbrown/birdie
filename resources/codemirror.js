var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = ['3.12', '3.11', '3.1', '3.02', '3.01', '3.0', '2.38',
    '2.37', '2.36', '2.35', '2.34', '2.33', '2.32', '2.31', '2.3', '2.25',
    '2.24', '2.23', '2.22', '2.21', '2.2', '2.18', '2.17', '2.16', '2.15',
    '2.14', '2.13', '2.12', '2.11', '2.1', '2.02', '2.01', '2.0', '2', '1'];
  version = {'*': '3.12'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error("That version is not officially supported.");

  // cloudflare actually only has 3.12.0 and 2.36.0
  var cloudflare = cdn.cloudflare('codemirror')(version + '.0');
  var github = cdn.github('marijnh/CodeMirror')('v' + version);
  callback(null, {
    'codemirror.min.js': [cloudflare('codemirror.min.js')],
    'codemirror.js': [github('lib/codemirror.js'), cloudflare('codemirror.js')],
    'codemirror.css': [github('lib/codemirror.css'), cloudflare('codemirror.css')]
  });
};
