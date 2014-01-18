'use strict'; /*jslint node: true, es5: true, indent: 2 */
var async = require('async');

var dependency = require('./dependency');
var Dependency = exports.Dependency = dependency.Dependency;
var DependencyList = exports.DependencyList = dependency.DependencyList;

exports.install = function(dependency_list, pattern, callback) {
  if (dependency_list instanceof DependencyList) {
    dependency_list = dependency_list.dependencies;
  }

  async.each(dependency_list, function(dependency, callback) {
    dependency.fetch(pattern, callback);
  }, callback);
};
