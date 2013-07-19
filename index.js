'use strict'; /*jslint node: true, es5: true, indent: 2 */
var async = require('async');
var child_process = require('child_process');
var fs = require('fs');
var glob = require('glob');
var logger = require('winston');
var mkdirp = require('mkdirp');
var path = require('path');
var request = require('request');
var temp = require('temp');

var defaults = exports.defaults = {
  staticPattern: 'static/{resource}/{file}',
  staticDependencies: {}
};

var copyFile = exports.copyFile = function(srcpath, dstpath, callback) {
  /** copy the file at `srcpath` to `dstpath`, removing the file at `dstpath`
    if it exists, and creating directories up to `dstpath` if needed.

    `callback` signature: function(err) */
  var dirpath = path.dirname(dstpath);
  mkdirp(dirpath, function(err) {
    if (err) {
      callback(err);
    }
    else {
      fs.unlink(dstpath, function(err) {
        if (err && err.code != 'ENOENT') {
          // ignore error if the file doesn't already exist
          callback(err);
        }
        else {
          fs.link(srcpath, dstpath, callback);
        }
      });
    }
  });
};

var writeFile = exports.writeFile = function(filepath, data, callback) {
  /** create any required directories up to `filepath`, and write data to
    `filepath` with the default encoding.

    `callback` signature: function(err) */
  var dirpath = path.dirname(filepath);
  mkdirp(dirpath, function(err) {
    if (err) {
      callback(err);
    }
    else {
      fs.writeFile(filepath, data, callback);
    }
  });
};

var fetch = exports.fetch = function(uri, callback) {
  /** fetch the given `uri` based on its protocol, redirecting to the github
    raw url for git:// uri's, raising an error for other git:// urls, and
    simply retrieving the content from http: and https: urls as a buffer.

    `callback` signature: function(err, data) */
  if (uri.match(/^git:\/\/github.com/)) {
    // github is really nice in that it exposes all files on all branches/tags
    // over http and https at unique urls. so great!
    uri = uri.replace(/^git:\/\//, 'https://raw.');
  }

  if (uri.match(/^git:/)) {
    // for now, we only support github git addresses
    var message = 'The git:// protocol is not currently supported except for github urls.';
    callback(new Error(message));
  }
  else {
    // set encoding: null so that we get a buffer back as the body.
    request({uri: uri, encoding: null}, function (err, response, body) {
      if (err) {
        callback(err);
      }
      else if (response.statusCode != 200) {
        var message = 'HTTP ' + response.statusCode + ' ' + uri;
        callback(new Error(message), body);
      }
      else {
        callback(null, body);
      }
    });
  }
};

var downloadFiles = exports.downloadFiles = function(filename_urls, pattern, done) {
  /** download all files and save them to the local filesystem using the given
    pattern. `filename_urls` is a hash from filenames to a list of urls, each
    of which _should_ respond with the same content.

    `done` signature: function(err) */
  async.each(Object.keys(filename_urls), function(filename, callback) {
    var urls = filename_urls[filename];
    // just use the first url, for now
    var url = urls[0];
    fetch(url, function(err, data) {
      if (err) {
        callback(err);
      }
      else {
        var filepath = pattern.replace(/\{file\}/g, filename);
        writeFile(filepath, data, function (err) {
          if (!err)
            logger.info(filepath + ' < ' + url);
          callback(err);
        });
      }
    });
  }, done);
};

var gitClone = exports.gitClone = function(pattern, git_url, callback) {
  // callback signature: function(err)
  temp.mkdir(null, function(err, git_dir) {
    logger.debug('git clone ' + git_url + ' ' + git_dir);
    child_process.spawn('git', ['clone', git_url, git_dir])
    .on('close', function (code) {
      // for each file in the git dir, besides .git/**, copy it as file
      if (code !== 0) {
        logger.error('git clone exited with code ' + code);
      }
      glob('**', {cwd: git_dir, mark: true}, function(err, matches) {
        // filter off the empty string for the root directory
        var files = matches.filter(function(m) { return !m.match(/\/$/); });
        // files is a list of partial filepaths (i.e., files in directories, but not absolute)
        async.each(files, function(file, callback) {
          var temppath = path.join(git_dir, file);
          var filepath = pattern.replace(/\{file\}/g, file);
          copyFile(temppath, filepath, function(err) {
            if (!err)
              logger.info(filepath + ' < ' + git_url + '/' + file);
            callback(err);
          });
        }, callback);
      });
    });
  });
};

var downloadResources = exports.downloadResources = function(pattern, resources, done) {
  async.each(Object.keys(resources), function (resource_name, callback) {
    logger.debug('Downloading resource: %s', resource_name);
    var version = resources[resource_name];
    logger.info(resource_name + ' version: ' + version);

    // we partially fill the pattern as we go along.
    var resource_pattern = pattern.replace(/\{resource\}/g, resource_name);

    if (version.match(/^git:/)) {
      gitClone(resource_pattern, version, callback);
    }
    else {
      try {
        var resource_module = require('./resources/' + resource_name);
        resource_module(version, function(err, filename_urls) {
          // filename_urls is a dictionary from filenames to lists of urls
          downloadFiles(filename_urls, resource_pattern, callback);
        });
      }
      catch (exc) {
        // if the resource does not exist (no module there)
        callback(exc);
      }
    }
  }, function(err) {
    if (err) {
      logger.error(err.toString());
    }
    else {
      logger.info('Installed');
    }
  });
};
