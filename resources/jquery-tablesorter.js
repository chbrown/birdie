'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '2.0.10', '2.0.11', '2.0.12', '2.0.13', '2.0.14', '2.0.15', '2.0.16', '2.0.17', '2.0.18', '2.0.18.1', '2.0.19', '2.0.20', '2.0.20.1', '2.0.21', '2.0.21.1', '2.0.22', '2.0.23', '2.0.23.1', '2.0.23.2', '2.0.23.3', '2.0.23.4', '2.0.23.5', '2.0.24', '2.0.25', '2.0.25.1', '2.0.25.2', '2.0.26', '2.0.27', '2.0.28', '2.0.28.1', '2.0.29', '2.0.30', '2.0.30.1', '2.0.31', '2.0.6', '2.0.7', '2.0.8', '2.0.9',
  '2.1', '2.1.1', '2.1.10', '2.1.11', '2.1.12', '2.1.13', '2.1.14', '2.1.15', '2.1.16', '2.1.17', '2.1.18', '2.1.19', '2.1.2', '2.1.20', '2.1.3', '2.1.3.1', '2.1.4', '2.1.5', '2.1.6', '2.1.7', '2.1.8', '2.1.9',
  '2.2', '2.2.1', '2.2.2', '2.3',
  '2.3.1', '2.3.10', '2.3.11', '2.3.2', '2.3.3', '2.3.4', '2.3.5', '2.3.6', '2.3.7', '2.3.8', '2.3.9',
  '2.4', '2.4.1', '2.4.3', '2.4.5', '2.4.6', '2.4.7', '2.4.8',
  '2.5', '2.5.1', '2.5.2',
  '2.6', '2.6.1', '2.6.2',
  '2.7', '2.7.1', '2.7.10', '2.7.11', '2.7.12', '2.7.2', '2.7.3', '2.7.4', '2.7.5', '2.7.6', '2.7.7', '2.7.8', '2.7.9',
  '2.8.0', '2.8.1', '2.8.2',
  '2.9.0', '2.9.1',
  '2.10.0', '2.10.1', '2.10.2', '2.10.3', '2.10.4', '2.10.5', '2.10.6', '2.10.7', '2.10.8',
  '2.11.0', '2.11.1',
  '2.12.0',
  '2.13.0', '2.13.1', '2.13.2', '2.13.3',
  '2.14.0', '2.14.1', '2.14.2', '2.14.3',
];

exports.resolve = function(version, callback) {
  // the versions that cloudflare exposes are weird, 2.5.2 and 2.9.1, but since
  // the homepage doesn't expose versioned sources, I go with the birdy.cdn.
  var cloudflare = birdy.cdn.cloudflare('jquery.tablesorter')(version);
  var github_base = birdy.cdn.github('Mottie/tablesorter');
  var github_js = github_base('v' + version + '/js');
  var github_images = github_base('v' + version + '/css/images');
  var cdns = [github_js, cloudflare];

  // cdnjs doesn't provide the css or gifs, unfortunately
  var filename_urls = {
    'jquery-tablesorter.js': birdy.mapApply(cdns, 'jquery.tablesorter.js'),
    'jquery-tablesorter.min.js': birdy.mapApply(cdns, 'jquery.tablesorter.min.js'),
    'jquery-tablesorter-widgets.js': birdy.mapApply(cdns, 'jquery.tablesorter.widgets.js'),
    'jquery-tablesorter-widgets.min.js': birdy.mapApply(cdns, 'jquery.tablesorter.widgets.min.js'),
  };

  [
    'black-asc.gif',
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
