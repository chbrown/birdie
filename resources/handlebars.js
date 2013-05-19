var cdn = require('../cdn');
module.exports = function(version, callback) {
  version = {'*': '1.0.11'}[version] || version;
  var github = cdn.github('wycats/handlebars.js')('v' + version);
  callback(null, {
    'handlebars.js': [github('dist/handlebars.js')],
    'handlebars.runtime.js': [github('dist/handlebars.runtime.js')]
  });
};
