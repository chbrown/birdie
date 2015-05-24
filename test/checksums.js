/*globals describe, it */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var crypto = require('crypto');
var temp = require('temp');
temp.track();

var birdy = require('..');

function md5(filepath) {
  var hash = crypto.createHash('md5');
  // contents is a Buffer
  var contents = fs.readFileSync(filepath);
  hash.update(contents);
  return hash.digest('hex');
}

describe('registry', function() {
  it('should pull down sources with correct checksums', function(callback) {
    var list = birdy.DependencyList.parse({
      'angular': '1.2.8',
      'jquery': '2.0.3',
      'underscore': '1.5.2',
    });

    temp.mkdir(null, function(err, dir_path) {
      var pattern = path.join(dir_path, '{resource}', '{file}');
      birdy.install(list, pattern, function(err) {
        if (err) return callback(err);

        var files = [
          {path: 'angular/angular.js', md5: '0f90fd6933cb32fd2c25c09973d954e1'},
          {path: 'angular/angular.min.js', md5: 'e23cb8c1bcad0c235a8e8ed68b15a88a'},
          {path: 'jquery/jquery.js', md5: 'b29c22eae459aa715cdd8fa340bb6e29'},
          {path: 'jquery/jquery.min.js', md5: 'ccd0edd113b78697e04fb5c1b519a5cd'},
          {path: 'underscore/underscore.js', md5: '1d4e786b5e92a3c936043bd5d0981000'},
          {path: 'underscore/underscore.min.js', md5: 'ca26dc8cdf5d413cd8d3b62490e28210'},
        ];

        files.forEach(function(file) {
          var filepath = path.join(dir_path, file.path);
          assert.equal(md5(filepath), file.md5, 'Downloaded file should match checksum');
        });

        callback();
      });
    });
  });
});
