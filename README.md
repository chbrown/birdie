## Birdie

Birdie is meant as a fine-grained [bower], particularly, one that is not a mess.

### Getting started

First, install birdie

    npm install -g birdie

You'll need to add a section to your `package.json`, or a `package.json` file, if you don't node.

    birdie init

Add resources to the newly created "staticDependencies" hash in your `package.json` file as needed, something like:

    {
      "staticDependencies": {
        "jquery": "2.0.0",
        "backbone": "*",
        "handlebars": "*",
        "bootstrap": "*"
      }
    }

Then fetch them!

    birdie install

## resources/*

Every resource is an arbitrary javascript file that returns a function as `module.exports`.

Function signature:

    function (version, callback) {
      // compute a dictionary mapping filenames to lists of urls
      // each of the urls should return an identical file
      // the urls can be fully specified git paths
      if (version === '2.0.0') {
        callback({
          'jquery.min.js': [
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js',
            'http://code.jquery.com/jquery-2.0.0.min.js'
          ],
          'jquery.max.js': [
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.js',
            'http://code.jquery.com/jquery-2.0.0.js'
          ]
        })
      }
      else {
        callback(new Error('Cannot find version = ' + version));
      }
    }

The callback is not guaranteed to be async (e.g., `setImmediate` or requiring some fetch).

### Contributing

Fork and send a pull request.
I won't haphazardly accept all requests, but I do want this to cover a lot of packages.
Please be sure, though, that:

1. Your addition is not a duplicate of an existing resource.
2. Someone else might conceivably want to use the resource.

## License

Copyright 2013 Christopher Brown

MIT Licensed
