'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');
var tap = require('tap');

tap.test('import', function(t) {
  t.ok(birdy, 'birdy should load from test/.. directory');
  t.end();
});
