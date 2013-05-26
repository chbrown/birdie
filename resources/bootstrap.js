var cdn = require('../cdn');
module.exports = function(version, callback) {
  var versions = ['2.3.2', '2.3.1'];
  version = {'*': '2.3.1'}[version] || version;
  if (versions.indexOf(version) < 0)
    console.error("That version is not officially supported.");

  var cloudflare = cdn.cloudflare('twitter-bootstrap')(version);
  var bootstrapcdn = cdn.http('netdna.bootstrapcdn.com/twitter-bootstrap')(version);

  // bootstrap.css expects glyphicons at ../img/glyphicons-halflings.png
  // despite this being reasonable, this unfortunately means we have to
  // broach the usual flat directory structure policy and put both css/
  // and img/ resources in subfolders
  var files = {
    'css/bootstrap-responsive.css': 'css/bootstrap-responsive.css',
    'css/bootstrap-responsive.min.css': 'css/bootstrap-responsive.min.css',
    'css/bootstrap.css': 'css/bootstrap.css',
    'css/bootstrap.min.css': 'css/bootstrap.min.css',
    'bootstrap.js': 'js/bootstrap.js',
    'bootstrap.min.js': 'js/bootstrap.min.js',
    'img/glyphicons-halflings-white.png': 'img/glyphicons-halflings-white.png',
    'img/glyphicons-halflings.png': 'img/glyphicons-halflings.png'
  };

  var filename_urls = {};
  for (var file in files) {
    filename_urls[file] = cdn.mapApply([cloudflare, bootstrapcdn], files[file]);
  }

  callback(null, filename_urls);
};
