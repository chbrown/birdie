var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = [
    '2.0.2',
    '2.0.0',
    '1.10.1',
    '1.9.1',
    '1.9.0',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.2',
    '1.7.1',
    '1.7',
    '1.6.4',
    '1.6.2',
    '1.6.1',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.6',
    '1.2.3'];
  version = {'*': '1.10.1'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error('That version is not officially supported.');

  var cloudflare = cdn.cloudflare('jquery')(version);
  var google = cdn.google('jquery')(version);
  callback(null, {
    'jquery.min.js': [
      'http://code.jquery.com/jquery-' + version + '.min.js',
      cloudflare('jquery.min.js'),
      google('jquery.min.js')
    ],
    'jquery.js': [
      'http://code.jquery.com/jquery-' + version + '.js',
      cloudflare('jquery.js'),
      google('jquery.js')
    ]
  });
};
