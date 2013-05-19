// this won't work for all cloudflare resources, since their naming scheme is a mess in places
exports.cloudflare = function(name, version, minified) {
  return 'https://cdnjs.cloudflare.com/ajax/libs/' + name + '/' + version + '/' + name + (minified ? '.min.js' : '.js');
};
exports.google = function(name, version, minified) {
  return 'https://ajax.googleapis.com/ajax/libs/' + name + '/' + version + '/' + name + (minified ? '.min.js' : '.js');
};
