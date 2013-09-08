var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = [
    '1.10.3',
    '1.10.2', '1.10.1', '1.10.0', '1.9.2', '1.9.1', '1.9.0', '1.8.24',
    '1.8.23', '1.8.22', '1.8.21', '1.8.20', '1.8.19', '1.8.18', '1.8.17',
    '1.8.16', '1.8.15', '1.8.14', '1.8.13', '1.8.12', '1.8.11', '1.8.10',
    '1.8.9', '1.8.8', '1.8.7', '1.8.6', '1.8.5', '1.8.4', '1.8.2', '1.8.1',
    '1.8.0', '1.7.3', '1.7.2', '1.7.1', '1.7.0', '1.6.0', '1.5.3', '1.5.2'];
  version = {'*': versions[0]}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error('That version is not officially supported.');

  var cloudflare = cdn.cloudflare('jqueryui')(version);
  var google = cdn.google('jqueryui')(version);
  var http = cdn.http('code.jquery.com/ui')(version);

  callback(null, {
    'jquery-ui.min.js': cdn.mapApply([cloudflare, google, http], 'jquery-ui.min.js'),
    'jquery-ui.js': cdn.mapApply([cloudflare, google, http], 'jquery-ui.js')
  });
};
