var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = ['1.1.4', '1.1.3', '1.0.6', '1.0.5', '1.0.4', '1.0.3', '1.0.2', '1.0.1'];
  if (version == '*') version = '1.0.6';
  if (versions.indexOf(version) < 0)
    console.error("That version is not officially supported.");

  // cloudflare calls it angular.js, google calls it angularjs.
  var cloudflare = cdn.cloudflare('angular.js')(version);
  var google = cdn.google('angularjs')(version);
  var http = cdn.http('code.angularjs.org')(version);
  callback(null, {
    'angular.min.js': cdn.mapApply([cloudflare, google, http], 'angular.min.js'),
    'angular.js': cdn.mapApply([cloudflare, google, http], 'angular.js')
  });
};
