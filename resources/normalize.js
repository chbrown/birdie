var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = ['2.1.2', '2.1.1', '2.1.0', '2.0.1', '2.0.0',
    '1.1.2', '1.1.1', '1.1.0', '1.0.2', '1.0.1', '1.0.0'];
  version = {'*': '1.1.2'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error("That version is not officially supported.");

  var github = cdn.github('necolas/normalize.css')('v' + version);
  var cloudflare = cdn.cloudflare('normalize')(version);
  callback(null, {
    'normalize.css': cdn.mapApply([github, cloudflare], 'normalize.css')
  });
};
