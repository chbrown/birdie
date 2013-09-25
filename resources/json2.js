'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.resolve = function(version, callback) {
  // haha, we just ignore the version.
  callback(null, {
    'json2.js': ['git://github.com/douglascrockford/JSON-js/master/json2.js']
  });
};
