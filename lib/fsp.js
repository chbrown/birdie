/**
This module is just a few extensions to fs (mixing fs and mkdirp)
to emulate `mkdir -p` functionality when a file at some filepath is required.
*/
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

/** copy the file at `srcpath` to `dstpath`, removing the file at `dstpath`
if it exists, and creating directories up to `dstpath` if needed.

`callback`: function(Error | null) */
function link(srcpath, dstpath, callback) {
  var dirpath = path.dirname(dstpath);
  mkdirp(dirpath, function(err) {
    if (err) return callback(err);

    fs.unlink(dstpath, function(err) {
      if (err && err.code != 'ENOENT') return callback(err);
      // ignore failed unlinks (i.e., 'ENOENT') if the file doesn't already exist

      fs.link(srcpath, dstpath, callback);
    });
  });
}
exports.link = link;

/** create any required directories up to `filepath`, and write data to
`filepath` with the default encoding.

`callback`: function(Error | null) */
function writeFile(filepath, data, callback) {
  var dirpath = path.dirname(filepath);
  mkdirp(dirpath, function(err) {
    if (err) return callback(err);

    fs.writeFile(filepath, data, callback);
  });
}
exports.writeFile = writeFile;
