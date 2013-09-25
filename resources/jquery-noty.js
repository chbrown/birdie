'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions = [
  '2.0.3',
];

exports.resolve = function(version, callback) {
  var cloudflare = birdy.cdn.cloudflare('jquery-noty')(version);
  var github = birdy.cdn.github('needim/noty')('v' + version);

  var filename_urls = {
    'jquery-noty.js': [cloudflare('jquery.noty.js'), github('js/noty/jquery.noty.js')],
    'jquery-noty.theme.js': [github('js/noty/themes/default.js')]
  };
  var layouts = ['bottom', 'bottomCenter', 'bottomLeft', 'bottomRight',
    'center', 'centerLeft', 'centerRight', 'inline', 'top', 'topCenter',
    'topLeft', 'topRight'];
  layouts.forEach(function(layout) {
    var path = 'layouts/' + layout + '.js';
    filename_urls[path] = [github('js/noty/' + path)];
  });

  callback(null, filename_urls);
};
