var cdn = require('../cdn');
module.exports = function(version, callback) {
  version = {'*': '0.7.2'}[version] || version;

  var github = cdn.github('bebraw/colorjoe')('v' + version);

  callback(null, {
    'colorjoe.js': [github('dist/colorjoe.js')],
    'colorjoe.min.js': [github('dist/colorjoe.min.js')],
    'colorjoe.css': [github('css/colorjoe.css')]
  });
};
