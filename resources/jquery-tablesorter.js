'use strict'; /*jslint node: true, es5: true, indent: 2 */
var cdn = require('../cdn');
module.exports = function(version, callback) {
  version = {'*': '2.10.8'}[version] || version;

  // the versions that cloudflare exposes are weird, 2.5.2 and 2.9.1, but since
  // the homepage doesn't expose versioned sources, I go with the CDN.
  var cloudflare = cdn.cloudflare('jquery.tablesorter')(version);
  var github_base = cdn.github('Mottie/tablesorter');
  var github_js = github_base('v' + version + '/js');
  var github_images = github_base('v' + version + '/css/images');
  var cdns = [github_js, cloudflare];

  // cdnjs doesn't provide the css or gifs, unfortunately
  var filename_urls = {
    'jquery-tablesorter.js': cdn.mapApply(cdns, 'jquery.tablesorter.js'),
    'jquery-tablesorter.min.js': cdn.mapApply(cdns, 'jquery.tablesorter.min.js'),
    'jquery-tablesorter-widgets.js': cdn.mapApply(cdns, 'jquery.tablesorter.widgets.js'),
    'jquery-tablesorter-widgets.min.js': cdn.mapApply(cdns, 'jquery.tablesorter.widgets.min.js'),
  };

  [
    'black-desc.gif',
    'black-unsorted.gif',
    'dropbox-asc-hovered.png',
    'dropbox-asc.png',
    'dropbox-desc-hovered.png',
    'dropbox-desc.png',
    'green-asc.gif',
    'green-desc.gif',
    'green-header.gif',
    'green-unsorted.gif',
    'ice-asc.gif',
    'ice-desc.gif',
    'ice-unsorted.gif',
    'white-asc.gif',
    'white-desc.gif',
    'white-unsorted.gif',
  ].forEach(function(image_name) {
    filename_urls['img/' + image_name] = [github_images(image_name)];
  });

  callback(null, filename_urls);
};
