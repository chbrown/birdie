var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = ['1.0.0', '0.9.9', '0.9.2', '0.9.1', '0.9.0', '0.5.3', '0.5.2',
    '0.5.1', '0.5.0', '0.3.3', '0.3.2', '0.3.1', '0.3.0', '0.2.0', '0.1.2',
    '0.1.1', '0.1.0'];
  version = {'*': '1.0.0'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error("That version is not officially supported.");

  var cloudflare = cdn.cloudflare('backbone.js')(version);
  var github = cdn.github('documentcloud/backbone')(version);
  callback(null, {
    'backbone.min.js': cdn.mapApply([cloudflare, github], 'backbone-min.js'),
    'backbone.js': cdn.mapApply([cloudflare, github], 'backbone.js')
  });
};
