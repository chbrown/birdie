var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = [
    '2.2.1', '2.2.0', '2.1.0', '2.0.0',
    '1.7.2', '1.7.1', '1.7.0', '1.6.2', '1.6.1', '1.6.0', '1.5.1', '1.5.0', '1.4.0', '1.3.0', '1.2.0', '1.1.2', '1.1.1', '1.1.0', '1.0.1',
    '0.6.1', '0.6.0', '0.5.2', '0.5.1', '0.5.0', '0.4.1', '0.4.0', '0.3.2', '0.3.1', '0.3.0'];
  version = {'*': versions[0]}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error('That version is not officially supported.');

  var cloudflare = cdn.cloudflare('moment.js')(version);
  var github = cdn.github('moment/moment')(version);
  callback(null, {
    'moment.min.js': cdn.mapApply([cloudflare], 'moment.min.js'),
    'moment.js': cdn.mapApply([github, cloudflare], 'moment.js')
  });
};
