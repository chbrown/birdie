'use strict'; /*jslint node: true, es5: true, indent: 2 */
var fs = require('fs');
var path = require('path');

var tap = require('tap');
var temp = require('temp');
temp.track();

var birdy = require('..');

tap.test('git', function(t) {
  var list = birdy.DependencyList.parse({
    'misc-js': {
      'url': 'git://github.com/chbrown/misc-js.git',
      'filter': ['textarea.js', 'url.js', 'jquery-autocomplete.js']
    },
  });

  temp.mkdir(null, function(err, dir_path) {
    var pattern = path.join(dir_path, '{file}');
    birdy.install(list, pattern, function(err) {
      t.notOk(err, 'birdy.install should not raise an error');

      var expected = ['jquery-autocomplete.js', 'textarea.js', 'url.js'];
      var children = fs.readdirSync(dir_path);

      t.deepEqual(children.sort(), expected, 'Only three files should be cloned');
      t.end();
    });
  });
});
