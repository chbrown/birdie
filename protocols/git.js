'use strict'; /*jslint node: true, es5: true, indent: 2 */
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var glob = require('glob');
var minimatch = require('minimatch');
var path = require('path');
var logger = require('loge');

var fsp = require('../lib/fsp');
var git = require('../lib/git');
var json = require('../lib/json');

function isDirectory(filepath) {
  return filepath.match(/\/$/);
}

function isVersionControl(filepath) {
  return filepath.match(/^(\.git|\.hg|\.svn|\.bzr|_darcs|CVS)/);
}

// function get_staticIgnore_test(package_filepath) {}

var fetch = exports.fetch = function(url, staticPattern, filter, callback) {
  /**
  1. Clone a remote git repository to a temporary directory,
  2. Copy the files over from the temporary location.

  filter: Array | null
    If not null, only allow files that occur in `filter`

  TODO: cleanup after finishing the download.
  */
  var isSelected = function(filepath) {
    if (!filter) {
      return true;
    }
    return _.contains(filter, filepath);
  };

  git.clone(url, function(err, git_dir) {
    if (err) return callback(err);

    // if there is a package.json, see if it has a staticIgnore field.
    // if it doesn, ignore the paths listed as ignored.
    var package_filepath = path.join(git_dir, 'package.json');
    json.readFile(package_filepath, {}, function(err, config) {
      if (err) return callback(err);

      var ignore_patterns = (config.staticIgnore || []).map(function(raw) {
        // we expand trailing /* into /** (since we are only copying over files)
        return raw.replace(/\/\*$/, '/**');
      });

      var isIgnored = function(filepath) {
        return ignore_patterns.some(function(pattern) {
          return minimatch(filepath, pattern, {matchBase: true});
        });
      };

      // {mark: true} ensures that matching directories will end with a slash, like 'folder/'
      glob('**', {cwd: git_dir, mark: true, dot: true}, function(err, matches) {
        if (err) return callback(err);

        var files = _.chain(matches)
          // filter out directories
          .reject(isDirectory)
          // and typical source repository folders
          .reject(isVersionControl)
          // and things that match the staticIgnore flag in the target package
          .reject(isIgnored)
          // but only keep files matching filter, if `filter` is specified
          .select(isSelected)
          .value();

        // files is a list of partial filepaths (i.e., files in directories, but not absolute)
        async.each(files, function(file, callback) {
          var temppath = path.join(git_dir, file);
          var filepath = staticPattern.replace(/\{file\}/g, file);
          fsp.link(temppath, filepath, function(err) {
            if (err) return callback(err);

            logger.info('%s < %s/%s', filepath, url, file);
            callback();
          });
        }, callback);
      });
    });
  });
};
