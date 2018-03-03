var async = require('async');

var {Dependency, DependencyList} = require('./dependency');

function install(dependency_list, pattern, callback) {
  var dependencies;
  if (dependency_list instanceof DependencyList) {
    dependencies = dependency_list.dependencies;
  }
  else {
    dependencies = dependency_list;
  }

  async.each(dependencies, function(dependency, callback) {
    dependency.fetch(pattern, callback);
  }, callback);
}

module.exports = {Dependency, DependencyList, install};
