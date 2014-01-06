'use strict'; /*jslint node: true, es5: true, indent: 2 */
var async = require('async');
var fs = require('fs');
var glob = require('glob');
var minimatch = require('minimatch');
var path = require('path');
var request = require('request');
var logger = require('loge');

var fsp = require('./lib/fsp');
var git = require('./lib/git');

var defaults = exports.defaults = {
  staticPattern: 'static/{resource}/{file}',
  staticDependencies: {},
};

var fetch = exports.fetch = function(uri, callback) {
  /** fetch the given `uri` based on its protocol, redirecting to the github
  raw url for git:// uri's, raising an error for other git:// urls, and
  simply retrieving the content from http: and https: urls as a buffer.

  `callback`: function(Error | null, data) */
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
    request({uri: uri, encoding: null}, function(err, response, body) {
      if (err) return callback(err);

      if (response.statusCode != 200) {
        var message = 'HTTP ' + response.statusCode + ' ' + uri;
        return callback(new Error(message), body);
      }

      callback(null, body);
    });
  }
};

var installFromUrls = exports.installFromUrls = function(filename_urls, pattern, done) {
  /** download all files and save them to the local filesystem using the given
  pattern. `filename_urls` is a hash from filenames to a list of urls, each
  of which _should_ respond with the same content.

  `done`: function(Error | null) */
  async.each(Object.keys(filename_urls), function(filename, callback) {
    var urls = filename_urls[filename];
    // just use the first url, for now
    var url = urls[0];
    fetch(url, function(err, data) {
      if (err) return callback(err);

      var filepath = pattern.replace(/\{file\}/g, filename);
      fsp.writeFile(filepath, data, function(err) {
        if (err) return callback(err);

        logger.info('%s < %s', filepath, url);
        callback();
      });
    });
  }, done);
};

var installFromGit = exports.installFromGit = function(git_url, resource_pattern, callback) {
  /** Clone a remote git repository to a temporary directory and copy the files over from the temporary location.

  TODO: cleanup after finishing the download.
  */
  git.clone(git_url, function(err, git_dir) {
    // if there is a package.json, see if it has a staticIgnore field, and ignore those paths if it does.
    var git_package_json_filepath = path.join(git_dir, 'package.json');

    fs.readFile(git_package_json_filepath, function(err, data) {
      var package_json = JSON.parse(data || '{}');
      var ignore_patterns = (package_json.staticIgnore || []).map(function(raw) {
        // we expand trailing /* into /** (since we are only copying over files)
        var pattern = raw.replace(/\/\*$/, '/**');
        logger.debug('ignoring glob: %s', pattern);
        return pattern;
      });

      // {mark: true} ensures that matching directories will end with a slash, like 'folder/'
      glob('**', {cwd: git_dir, mark: true, dot: true}, function(err, matches) {
        if (err) return callback(err);

        var files = matches.filter(function(file) {
          // ignore directories
          var isdir = file.match(/\/$/);
          // and things that match the staticIgnore flag in the target package
          var ignored = ignore_patterns.some(function(pattern) {
            return minimatch(file, pattern, {matchBase: true});
          });
          // and typical source repository folders
          var isversioncontrol = file.match(/^(\.git|\.hg|\.svn|\.bzr|_darcs|CVS)/);

          return !(isdir || ignored || isversioncontrol);
        });
        // files is a list of partial filepaths (i.e., files in directories, but not absolute)
        async.each(files, function(file, callback) {
          var temppath = path.join(git_dir, file);
          var filepath = resource_pattern.replace(/\{file\}/g, file);
          fsp.link(temppath, filepath, function(err) {
            if (err) return callback(err);

            logger.info('%s < %s/%s', filepath, git_url, file);
            callback();
          });
        }, callback);
      });
    });
  });
};

exports.downloadResources = function(pattern, resources, done) {
  async.each(Object.keys(resources), function(resource_name, callback) {
    logger.debug('Downloading resource: %s', resource_name);
    var version = resources[resource_name];
    logger.info('%s version: %s', resource_name, version);

    // we partially fill the pattern as we go along.
    var resource_pattern = pattern.replace(/\{resource\}/g, resource_name);

    if (version.match(/^git:/)) {
      // the version-as-git-url thing works differently than the github resource url;
      // in this case, we actually clone the whole repo and copy it over
      installFromGit(version, resource_pattern, callback);
    }
    else {
      try {
        // a circular require except that the required module will never call downloadResources
        var resource_module = require('./resources/' + resource_name);
        var versions = resource_module.versions;

        if (versions !== undefined) {
          // set the special '*' version to the last offical version
          if (version == '*') {
            version = versions[versions.length - 1];
          }
          else if (versions.indexOf(version) < 0) {
            logger.error('That version is not officially supported: %s', version);
          }
        }

        resource_module.resolve(version, function(err, filename_urls) {
          // filename_urls is a dictionary from filenames to lists of urls
          installFromUrls(filename_urls, resource_pattern, callback);
        });
      }
      catch (exc) {
        // if the resource does not exist (no module there)
        callback(exc);
      }
    }
  }, function(err) {
    if (err) return logger.error(err.toString());

    logger.info('Installed');
  });
};

// a few miscellaneous helpers:

// every entry in the exports dictionary should have the following type:
//   function(project -> version -> file) { return "some://uri"; }
// but, well, curried.
var resolver = function(base) {
  return function(project) {
    return function(version) {
      return function(file) {
        return base + [project, version, file].join('/');
      };
    };
  };
};

// for github, @project is the full "author/repo" combo, @file is the fullpath, @version is a tag / branch
exports.cdn = {
  github: resolver('git://github.com/'),
  http: resolver('http://'),
  cloudflare: resolver('https://cdnjs.cloudflare.com/ajax/libs/'),
  google: resolver('https://ajax.googleapis.com/ajax/libs/'),
};

// just a little helper I hack in to this class, which most of the resources will have around anyway.
exports.mapApply = function(fns, x) {
  return fns.map(function(fn) {
    return fn(x);
  });
};
