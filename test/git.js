/*globals describe, it */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var temp = require('temp');
temp.track();

var birdy = require('..');

describe('git', function() {
  it('with filter should clone down exactly two files', function(callback) {

    var list = birdy.DependencyList.parse({
      'misc-js': {
        'url': 'git://github.com/chbrown/misc-js.git',
        'filter': ['cookies.js', 'textarea.js']
      },
    });

    temp.mkdir(null, function(err, dir_path) {
      var pattern = path.join(dir_path, '{file}');
      birdy.install(list, pattern, function(err) {
        if (err) return callback(err);

        var expected = ['cookies.js', 'textarea.js'];
        var children = fs.readdirSync(dir_path);

        assert.deepEqual(children.sort(), expected, 'Only two files should be cloned');
        callback();
      });
    });
  });
});
