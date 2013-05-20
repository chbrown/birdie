var cdn = require('../cdn');
module.exports = function(version, callback) {
  version = {'*': '2.0.3'}[version] || version;

  var cloudflare = cdn.cloudflare('jquery-noty')(version);
  var github = cdn.github('needim/noty')('v' + version);

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
