module.exports = function(version, callback) {
  // haha, we just ignore the version.
  callback(null, {
    'json2.js': ['git://github.com/douglascrockford/JSON-js/master/json2.js']
  });
};