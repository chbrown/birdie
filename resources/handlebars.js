var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = [
    '1.0.12', // HEAD
    '1.0.11',
    '1.0.10',
    '1.0.9',
    '1.0.8',
    '1.0.7',
    '1.0.6-2',
    '1.0.6',
    '1.0.rc.2',
    '1.0.rc.1',
    '1.0.0-rc.4',
    '1.0.0-rc.3',
    '1.0.0'];
  version = {'*': versions[0]}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error('That version is not officially supported.');

  var github = cdn.github('wycats/handlebars.js')('v' + version);
  callback(null, {
    'handlebars.js': [github('dist/handlebars.js')],
    'handlebars.runtime.js': [github('dist/handlebars.runtime.js')]
  });
};
