var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = ['1.0', '0.8', '0.7', '0.6'];
  version = {'*': '1.0'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error('That version is not officially supported.');

  var cloudflare = cdn.cloudflare('zepto')(version);
  // github doesn't actually hold the builds!
  // var github = cdn.github('madrobby/zepto')('v' + version);
  callback(null, {
    'zepto.min.js': [cloudflare('zepto.min.js')],
    'zepto.js': [cloudflare('zepto.js')]
  });
};
