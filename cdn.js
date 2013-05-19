// every entry in the exports dictionary should have the following type:
//   function(project -> version -> file) { return "some://uri"; }
// but, well, curried.
function _cdn(base) {
  return function(project) {
    return function(version) {
      return function(file) {
        return base + [project, version, file].join('/');
      };
    };
  };
}
// for github, @project is the full "author/repo" combo, @file is the fullpath, @version is a tag / branch
exports.github = _cdn('git://github.com/');
exports.http = _cdn('http://');
exports.cloudflare = _cdn('https://cdnjs.cloudflare.com/ajax/libs/');
exports.google = _cdn('https://ajax.googleapis.com/ajax/libs/');

// just a little helper I hack in to this class, which most of the resources will have around anyway.
exports.mapApply = function(fns, x) {
  return fns.map(function(fn) {
    return fn(x);
  });
};
