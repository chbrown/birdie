var cdn = require('../cdn');
module.exports = function(version, callback) {
  version = {'*': '1.0.0'}[version] || version;

  var cloudflare = cdn.cloudflare('ace')(version);
  var github = cdn.github('ajaxorg/ace-builds')('v' + version);

  callback(null, {
    'ace.min.js': [github('src-min/ace.js'), cloudflare('ace.min.js')],
    'ace.js': [github('src/ace.js'), cloudflare('ace.js')]
  });
};
