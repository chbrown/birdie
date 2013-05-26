var cdn = require('../cdn');
module.exports = function(version, callback) {
  version = {'*': '1.7.6'}[version] || version;

  var cloudflare = cdn.cloudflare('js-url')(version);
  var github = cdn.github('websanova/js-url')('v' + version);

  callback(null, {
    'js-url.min.js': cdn.mapApply([github, cloudflare], 'js-url.min.js'),
    'js-url.js': cdn.mapApply([github, cloudflare], 'js-url.js')
  });
};
