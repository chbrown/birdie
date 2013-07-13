var cdn = require('../cdn');
// http://danieltao.com/lazy.js/
module.exports = function(version, callback) {
  var versions = ['0.1'];
  version = {'*': '0.1'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error('That version is not officially supported.');

  var github = cdn.github('dtao/lazy.js')('v' + version);
  callback(null, {
    'lazy.min.js': [github('lazy.min.js')],
    'lazy.js': [github('lazy.js')]
  });
};
