## resources/

Each module in `resources/*.js` exposes at least one method:

* `resolve(version, callback)`: a function that takes a version string and returns an object that maps filenames to a list of urls where the canonical version of that file of the resource can be found. You might use it like this:

        resource.resolve(version, function(err, urls) {
          if (err) console.error('Resource.resolve error:', err);

          console.log('This resource supplies these files:', Object.keys(urls)):
        });

Each module can also expose another property:

* `versions`: a list of valid version strings.
  The **last** of these should be the `*` version.
  This will usually correspond to the latest stable version to use when the user specifies .
  By using the last, we can add new versions easily.

  This property is optional. If no `versions` list is exported, `*` will be used as the literal version.

  `resolve()` should not use or rely on `versions`.


### template

Use this resource template for all resources:

```javascript
'use strict'; /*jslint node: true, es5: true, indent: 2 */
var birdy = require('..');

exports.versions =[];

exports.files = function(version, callback) {
  callback(null, {
    ...
  });
};
```
