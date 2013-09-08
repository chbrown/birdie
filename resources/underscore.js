var cdn = require('../cdn');
// http://underscorejs.org/#changelog
module.exports = function(version, callback) {
  var versions = [
    '1.5.2',
    '1.5.1', '1.5.0', '1.4.4', '1.4.3', '1.4.2', '1.4.1', '1.4.0', '1.3.3',
    '1.3.2', '1.3.1', '1.3.0', '1.2.4', '1.2.3', '1.2.2', '1.2.1', '1.2.0',
    '1.1.7', '1.1.6', '1.1.5', '1.1.4', '1.1.3', '1.1.2', '1.1.1', '1.1.0',
    '1.0.4', '1.0.3', '1.0.2', '1.0.1', '1.0.0', '0.6.0', '0.5.7', '0.5.5',
    '0.5.4', '0.5.3', '0.5.2', '0.5.1', '0.5.0', '0.4.7', '0.4.6', '0.4.5',
    '0.4.4', '0.4.3', '0.4.2', '0.4.1', '0.4.0', '0.3.3', '0.3.2', '0.3.1',
    '0.3.0', '0.2.0', '0.1.1', '0.1.0'];
  version = {'*': '1.5.1'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error('That version is not officially supported.');

  var cloudflare = cdn.cloudflare('underscore.js')(version);
  var github = cdn.github('documentcloud/underscore')(version);
  callback(null, {
    'underscore.min.js': cdn.mapApply([cloudflare, github], 'underscore-min.js'),
    'underscore.js': cdn.mapApply([cloudflare, github], 'underscore.js')
  });
};
