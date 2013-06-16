var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = [
    '1.3.1', '1.3.0', '1.2.1', '1.2.0', '1.1.1', '1.1.0', '1.0.1', '1.0.0',
    '0.10.0', '0.9.2', '0.9.1', '0.9.0', '0.8.2', '0.8.1', '0.8.0', '0.7.0',
    '0.6.1', '0.6.0', '0.5.2', '0.5.1', '0.5.0', '0.4.2', '0.4.1', '0.4.0',
    '0.3.2', '0.3.1', '0.3.0', '0.2.2', '0.2.1', '0.2.0', '0.1.0'];
  version = {'*': '1.3.1'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error('That version is not officially supported.');

  var cloudflare = cdn.cloudflare('lodash.js')(version);
  var github = cdn.github('bestiejs/lodash')('v' + version);
  callback(null, {
    'lodash.min.js': [cloudflare('lodash.min.js'), github('dist/lodash.min.js')],
    'lodash.js': [cloudflare('lodash.js'), github('dist/lodash.js')]
  });
};
