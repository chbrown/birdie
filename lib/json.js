var fs = require('fs');
var logger = require('loge');

/**
Variadic:
readFile(filepath, callback) -> readFile(filepath, undefined, callback)
*/
function readFile(filepath, default_result, callback) {
  if (callback === undefined && default_result !== undefined) {
    return readFile(filepath, undefined, default_result);
  }
  // if opts.default is supplied, ENOENT will be ignored.
  fs.readFile(filepath, function(err, data) {
    if (err) {
      // quickly return with the given default if the file is missing
      if (err.code == 'ENOENT' && default_result !== undefined) {
        return callback(null, default_result);
      }
      // otherwise it's a legitimate error
      return callback(err);
    }

    var error = null;
    var result = null;
    try {
      // data is a Buffer, but JSON.parse can handle a Node.js Buffer just fine
      result = JSON.parse(data);
    }
    catch (exc) {
      logger.error('Could not parse "%s"; file contents are not valid JSON: %s', filepath, exc);
      logger.debug(data.toString());
      if (default_result !== undefined) {
        result = default_result;
      }
      else {
        error = exc;
      }
    }
    callback(error, result);
  });
}
exports.readFile = readFile;
