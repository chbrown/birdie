'use strict'; /*jslint node: true, es5: true, indent: 2 */
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var glob = require('glob');
var minimatch = require('minimatch');
var path = require('path');
var request = require('request');
var logger = require('loge');
var yaml = require('js-yaml');

var fsp = require('../lib/fsp');
var versions = require('../versions');

function escapeRegExp(string){
  // from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

var replaceByKeys = function(string, ctx) {
  var regex = new RegExp(Object.keys(ctx).map(escapeRegExp).join('|'), 'g');
  // console.log('replaceByKeys', regex, '~=', string, string.match(regex));
  return string.replace(regex, function(match) {
    return ctx[match];
  });
};

var set_re = /^\$\w+$/g;
var interpolate = function(obj, ctx) {
  if (_.isArray(obj)) {
    return obj.map(function(item) {
      return interpolate(item, ctx);
    });
  }
  else if (_.isObject(obj)) {
    for (var key in obj) {
      obj[key] = interpolate(obj[key], ctx);
      if (key.match(/^\$\w+$/g)) {
        ctx[key] = obj[key];
      }
    }
    return obj;
  }
  else if (_.isString(obj)) {
    return replaceByKeys(obj, ctx);
  }
  else {
    return obj;
  }
};

var psuedo_protocols = {
  // github is really nice in that it exposes all files on all branches/tags over http and https at unique urls. so great!
  'github:/': 'https://raw.github.com',
  'cdnjs:/': 'https://cdnjs.cloudflare.com/ajax/libs',
  'google:/': 'https://ajax.googleapis.com/ajax/libs',
  'ms:/': 'http://ajax.aspnetcdn.com',
};

var download = function(url, filepath, callback) {
  /**
  callback: function(Error | null)
  */
  var real_url = replaceByKeys(url, psuedo_protocols);
    // set encoding: null so that we get a buffer back as the body.
  request({url: real_url, encoding: null}, function(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode != 200) {
      var message = 'HTTP ' + response.statusCode + ' ' + real_url;
      return callback(new Error(message));
    }

    fsp.writeFile(filepath, body, function(err) {
      if (err) return callback(err);

      logger.info('%s < %s', filepath, real_url);
      callback();
    });
  });
};

var queryRegistry = function(name, version, callback) {
  // callback: function(Error | null, files: Object | null)
  var yaml_filepath = path.join(__dirname, '..', 'registry', name + '.yaml');
  fs.readFile(yaml_filepath, {encoding: 'utf8'}, function(err, data) {
    if (err) return callback(err);

    var spec = yaml.load(data);
    var registry_versions = versions.expand(spec.versions);

    var ctx = {$version: version};
    if (registry_versions.length) {
      // set the special '*' version to the last official version
      if (version == '*') {
        ctx.$version = _.last(registry_versions);
      }
      else if (registry_versions.indexOf(version) < 0) {
        logger.error('Version not officially supported: %s', version);
      }
    }

    interpolate(spec, ctx);
    // errrm, refactor this?:
    var files = spec.files;
    for (var file in spec.files) {
      files[file] = interpolate(files[file], {$file: file});
    }
    callback(null, files);
  });
};

var fetch = exports.fetch = function(url, version, staticPattern, callback) {
  /** download all files and save them to the local filesystem using the given pattern.

  `callback`: function(Error | null)
  */
  var registry_name = url.match(/registry:\/\/(.+)/)[1];
  queryRegistry(registry_name, version, function(err, files) {
    if (err) return callback(err);

    // `files` is a hash from filenames to a list of urls, each of which _should_ respond with the same content.
    var filenames = Object.keys(files);
    async.each(filenames, function(filename, callback) {
      var urls = files[filename];
      // just use the first url, for now
      var url = urls[0];
      var filepath = staticPattern.replace(/\{file\}/g, filename);
      download(url, filepath, function(err) {
        if (err) {
          logger.error('registry.fetch error: Could not download %s due to %s', url, err);
          return callback(err);
        }
        callback();
      });
    }, callback);
  });
};
