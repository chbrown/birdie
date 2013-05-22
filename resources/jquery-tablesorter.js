var cdn = require('../cdn');
module.exports = function(version, callback) {
  version = {'*': '2.9.1'}[version] || version;

  // the versions that cloudflare exposes are weird, 2.5.2 and 2.9.1, but since
  // the homepage doesn't expose versioned sources, I go with the CDN.
  var cloudflare = cdn.cloudflare('jquery.tablesorter')(version);

  // cdnjs doesn't provide the css or gifs, unfortunately
  var filename_urls = {
    'jquery-tablesorter.js': [cloudflare('jquery.tablesorter.js')],
    'jquery-tablesorter.min.js': [cloudflare('jquery.tablesorter.min.js')],
    'jquery-tablesorter.widgets.js': [cloudflare('jquery.tablesorter.widgets.js')],
    'jquery-tablesorter.widgets.min.js': [cloudflare('jquery.tablesorter.widgets.min.js')]
  };
  callback(null, filename_urls);
};
