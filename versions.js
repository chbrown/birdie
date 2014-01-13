'use strict'; /*jslint node: true, es5: true, indent: 2 */
var _ = require('underscore');

var Range = function(begin, end) {
  this.begin = begin;
  this.end = end;
};
Range.fromString = function(string) {
  var num = Number(string);
  return new Range(num, num);
};
Range.merge = function(ranges) {
  // immutable. return null if ranges are not mergeable
  var result = null;
  if (ranges.length === 2) {
    var a = ranges[0], b = ranges[1];
    if (a.end === b.begin || a.end + 1 === b.begin) {
      result = new Range(a.begin, b.end);
    }
  }
  return result;
};
Range.prototype.toString = function() {
  if (this.begin === this.end) {
    return this.begin.toString();
  }
  return '{' + this.begin + '..' + this.end + '}';
};

var Version = function(ranges) {
  this.ranges = ranges;
};
Version.fromString = function(string) {
  return new Version(string.split('.').map(Range.fromString));
};
Version.merge = function(versions) {
  // immutable. return null if versions are not mergeable
  // Kind of assumes that at least b has some ranges.
  var result = null;
  if (versions.length === 2) {
    var a = versions[0], b = versions[1];
    if (a.ranges === undefined) {
      // handle empties in kind of a weird way, but at least it's immutable!
      result = Version.merge([b, b]);
    }
    else if (a.ranges.length == b.ranges.length) {
      var merged_ranges = _.zip(a.ranges, b.ranges).map(Range.merge);
      if (merged_ranges.every(_.identity)) {
        var expansions = merged_ranges.filter(function(range) {
          return range.begin !== range.end;
        }).length;
        // limit to one expansion total:
        if (expansions <= 1) {
          result = new Version(merged_ranges);
        }
      }
    }
  }
  return result;
};
Version.prototype.toString = function() {
  return this.ranges.map(function(range) { return range.toString(); }).join('.');
};

function expandEach(version) {
  // only supports one range per string
  var match = version.match(/^(.*)\{(\d)..(\d+)\}(.*)$/);
  // match: [prefix, begin, end, postfix]
  if (match) {
    return _.range(Number(match[2]), Number(match[3]) + 1).map(function(part) {
      return match[1] + part + match[4];
    });
  }
  return [version];
}

var expand = exports.expand = function(versions) {
  return Array.prototype.concat.apply([], versions.map(expandEach));
};

var collapse = exports.collapse = function(versions) {
  // given a list of expanded versions, provide list of collapsed representations
  // _.flatten(expand, true)
  var result = [];
  var buffer = new Version();
  // for (var i = 0, version; (version = versions[i]); i++) {
  versions.map(Version.fromString).forEach(function(version) {
    // Version.merge
    var merged = Version.merge([buffer, version]);
    if (merged === null) {
      // they aren't mergeable
      result.push(buffer.toString());
      // maybe this could be just `merged = version` (?)
      merged = Version.merge([new Version(), version]);
    }
    // trying to be immutable, at least partly
    buffer = merged;
  });
  result.push(buffer.toString());
  return result;
};
