/*globals describe, it */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var temp = require('temp');
temp.track();

var {DependencyList, install} = require('..');

describe('git', function() {
  it('with filter should clone down exactly two files', function(callback) {
    var list = DependencyList.parse({
      birdy: {
        url: 'git://github.com/chbrown/birdy.git',
        filter: ['index.js', 'versions.js'],
      },
    });

    temp.mkdir(null, function(err, dir_path) {
      var pattern = path.join(dir_path, '{file}');
      install(list, pattern, function(err) {
        if (err) return callback(err);

        var expected = ['index.js', 'versions.js'];
        var children = fs.readdirSync(dir_path);

        assert.deepEqual(children.sort(), expected, 'Only two files should be cloned');
        callback();
      });
    });
  });
});
