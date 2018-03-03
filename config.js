var json = require('./lib/json');
var {DependencyList} = require('./dependency');

var defaults = {
  staticPattern: 'static/{resource}/{file}',
};
exports.defaults = defaults;

/**
Combine package.json and pattern/dependencies specified in the CLI command

package_filepath: String
cli_pattern: String | undefined
cli_strings: [String]
callback: function(Error) | function(null, dependencies, pattern, package_object)
  dependencies: DependencyList
  pattern: String
  package_object: Object
    The package.json representation, if available, or {}.
*/
function read(package_filepath, cli_pattern, cli_strings, callback) {
  json.readFile(package_filepath, {}, function(err, config) {
    if (err) return callback(err);

    // dependencies requires some merging
    var dependencies = DependencyList.merge([
      DependencyList.parse(config.staticDependencies),
      DependencyList.parse(cli_strings),
    ]);

    // the pattern is easy.
    // the staticPattern option defers to 1) the command line argument, if specified.
    // otherwise, it will use 2) the pattern specified by the config file, or, if
    // neither is specified, the default, 3) "static/{resource}/{file}"
    var pattern = cli_pattern || config.staticPattern || defaults.staticPattern;

    callback(null, dependencies, pattern, config);
  });
}
exports.read = read;
