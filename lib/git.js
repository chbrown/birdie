'use strict'; /*jslint node: true, es5: true, indent: 2 */
var async = require('async');
var child_process = require('child_process');
var path = require('path');
var temp = require('temp');

var logger = require('./logger');
var fsp = require('./fsp');

exports.clone = function(git_url, callback) {
  /** clone(): call `git clone [git_url]`

  callback: function(Error | null, String | null)
      The String argument is a temporary directory.
  */
  temp.mkdir(null, function(err, git_dir) {
    if (err) return callback(err);

    logger.debug('git clone %s %s', git_url, git_dir);

    child_process.spawn('git', ['clone', git_url, git_dir])
    .on('error', function(err) {
      callback(err);
    })
    .on('close', function(code) {
      // for each file in the git dir, besides .git/**, copy it as file
      if (code !== 0) {
        return callback(new Error('git clone exited with code: ' + code));
      }

      callback(null, git_dir);
    });
  });
};

