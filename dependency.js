var _ = require('underscore');
var logger = require('loge');
var gitProtocol = require('./protocols/git');
var registryProtocol = require('./protocols/registry');

function allEqual(list) {
  // http://stackoverflow.com/questions/10110510/underscore-js-determine-if-all-values-in-an-array-of-arrays-match/21081866#21081866
  return _.every(list.slice(1), _.partial(_.isEqual, list[0]));
}

/**
Dependency:

A dependency is the relationship between a name and some filepaths.

// Provider: and the urls that represent that name and the contents of those filepaths
//The `./registry` directory provides a way to resolve a name and a version to a dependency.

For example, a jQuery dependency may be the following mapping:

    jquery: ["jquery.js", "jquery.min.js"]

The following "staticDependencies" declarations are equivalent:

Shorthand:

    {
      "angular": "*",
      "misc-js": "git://github.com/chbrown/misc-js.git",
    }

Expanded:

    [
      {
        name: "angular",
        url: "registry://angular",
        version: "*"
      },
      {
        name: "misc-js",
        url: "git://github.com/chbrown/misc-js.git",
        version: "*"
      }
    }

Properties:

name: String
  Required. Usually interpolated into the staticPattern setting, and may be used in the url value.
url: String | null
  Defaults to "registry://" + "name" if no url is specified.
version: String
  Defaults to "*"

And maybe others, like:

filter: [String]
  Restrict imported files to those specified in an array

*/
class Dependency {
  constructor(options) {
    var {name, url = 'registry://' + name, version = '*', filter} = options;
    this.name = name;
    this.url = url;
    this.version = version;
    this.filter = filter;
  }

  /**
  parse can handle several different kinds of input

  dependencySpec can be one of the following:
    String | [String] | [String, String] | [String, Object] | Dependency

  Example results:
    "jquery==2.0.0"     -> Dependency(name="jquery", version="2.0.0")
    "jquery=2.0.0"      -> Dependency(name="jquery", version="2.0.0")
    ["jquery", "2.0.0"] -> Dependency(name="jquery", version="2.0.0")
    "jquery"            -> Dependency(name="jquery", version="*")
    ["jquery", "*"]     -> Dependency(name="jquery", version="*")

  returns a single Dependency object
  */
  static parse(dependencySpec) {
    if (dependencySpec instanceof Dependency) {
      // idempotent -- but maybe even make a copy?
      return dependencySpec;
    }

    var dependencyArray;
    if (Array.isArray(dependencySpec)) {
      dependencyArray = dependencySpec;
    }
    else {
      // first step is to parse any given string into a tuple
      dependencyArray = dependencySpec.split(/\s*==?\s*/);
    }

    // now it's sure to be an array like ["jquery", {version: "1.10.2"}]
    //                                or ["jquery", "1.10.2"]
    //                                or ["jquery"] (dependencyArray[1] may be undefined)
    var raw = {name: dependencyArray[0]};
    var opts = dependencyArray[1];
    if (_.isString(opts)) {
      if (/^\w+:\/\//.test(opts)) {
        // protocol-like: url
        raw.url = opts;
      }
      else {
        // otherwise, assume any string is the version
        raw.version = opts;
      }
    }
    else {
      // could be undefined or an object, so since _.extend(obj, undefined) is a no-op:
      _.extend(raw, opts);
    }
    return new Dependency(raw);
  }

  /**
  Currently only handles the version property
  Use the latest occuring non-"*" version among the dependencies;

  returns new Dependency object, or
          undefined if the dependencies cannot be merged.
  */
  static merge(dependenciesArray) {
    var dependencies = dependenciesArray.filter(dependency => dependency);
    var names = _.pluck(dependencies, 'name');
    var urls = _.pluck(dependencies, 'url');
    if (dependencies.length && allEqual(names) && allEqual(urls)) {
      var raw = _.clone(dependencies[0]);

      var versions = _.pluck(dependencies, 'version');
      var specific_versions = versions.filter(function(version) {
        return version != '*';
      });
      raw.version = _.last(specific_versions) || '*';

      return new Dependency(raw);
    }
  }

  /** fetch the given `uri` based on its protocol, redirecting to the github
  raw url for git:// uri's, raising an error for other git:// urls, and
  simply retrieving the content from http: and https: urls as a buffer.

  `callback`: function(Error | null, data)
  */
  fetch(staticPattern, callback) {
    var short_name = this.name + (this.version == '*' ? '' : '==' + this.version);
    logger.info('Fetching %s', short_name);

    // partially fill the pattern as we go along.
    var staticPatternWithResource = staticPattern.replace(/\{resource\}/g, this.name);

    if (this.url.match(/^git:/)) {
      // support version here, somehow?
      gitProtocol.fetch(this.url, staticPatternWithResource, this.filter, callback);
    }
    else if (this.url.match(/^registry:/)) {
      registryProtocol.fetch(this.url, this.version, staticPatternWithResource, this.filter, callback);
    }
    else {
      var message = 'Protocol not recognized: ' + this.url;
      callback(new Error(message));
    }
  }
}
exports.Dependency = Dependency;

/** not much more than an array of Dependency objects with a helper method or two */
class DependencyList {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  /** parse can handle the following types:

      {String: String}
      {String: Object}
      [[String]]
      [String]

    returns DependencyList object
  */
  static parse(dependencyListSpec) {
    var dependencyListArray;
    if (Array.isArray(dependencyListSpec)) {
      dependencyListArray = dependencyListSpec;
    }
    else {
      // if it's an Object, reduce it to a list of key-value pairs
      dependencyListArray = _.pairs(dependencyListSpec || {});
    }
    return new DependencyList(dependencyListArray.map(Dependency.parse));
  }

  /** Merge array of DependencyList objects.

  If there are conflicts, preference is given to versions in later dependencies if they are more specific than "*"

  This operation ought not to have side effects (but better double check).

  returns DependencyList object
  */
  static merge(dependency_lists) {
    // map is an object that basically just maps dependency#name Strings to the dependency
    var map = {};
    dependency_lists.forEach(function(dependency_list) {
      dependency_list.dependencies.forEach(function(dependency) {
        var existing = map[dependency.name];
        var merged = Dependency.merge([existing, dependency]);
        if (merged === undefined) {
          throw new Error('Cannot merge dependencies: ' + existing.toString() + ' and ' + dependency.toString());
        }
        map[dependency.name] = merged;
      });
    });
    return new DependencyList(_.values(map));
  }

  toJSON() {
    var map = {};
    for (var i = 0; i < this.dependencies.length; i++) {
      var dependency = this.dependencies[i];
      var value = null;
      if (dependency.url == ('registry://' + dependency.name)) {
        value = dependency.version;
      }
      else {
        value = {url: dependency.url};
        if (dependency.version != '*') {
          value.version = dependency.version;
        }
      }
      map[dependency.name] = value;
    }
    return map;
  }
}
exports.DependencyList = DependencyList;
