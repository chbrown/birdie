## Birdie

Birdie is a fast, fine-grained static asset management tool.
It intends to replace [bower](https://github.com/bower/bower) for common uses,
although it is not as flexible (but does have a certain flexibility that bower
does not).

Goals:

* **Curated repository / database of resources.** More like
  [homebrew](https://github.com/mxcl/homebrew) than [npm](https://npmjs.org/),
  in that it's not publically writable, and all changes are recorded in source
  control.
* **Fast.** Does not clone the entire git repository (which often contains
  tests, benchmarks, etc.), but only the files you (ought to) want.
* **Minimal.**
* **Structured.** Puts the files in a somewhat configurable location. Does not
  require the user to know the structure of the endpoint repository (this
  repository does that work for you, somewhat).


### Getting started

First, install Birdie

    npm install -g birdie

You'll need to add a section to your `package.json`, or a `package.json` file to your project, if you don't node.

    birdie init

Add resources to the newly created "staticDependencies" hash in your `package.json` file as needed, something like:

    {
      ...
      "staticDependencies": {
        "jquery": "2.0.0",
        "backbone": "*",
        "handlebars": "*",
        "bootstrap": "*"
      }
    }

You can also specify in your `package.json` where the files go:

    {
      ...
      "staticPattern": "static/{resource}/{file}",
      "staticDependencies": { ... }
    }

`staticPattern` is resolved relative to your current working directory where
you happen to run `birdie install`, and all necessary directories will be created.

It has two special values, which are replaced as the script proceeds.

* `{resource}`: The resource name, e.g., "jquery"
* `{file}`: The file name, which may be several files, as specified by the
  resource in `resources/{resource}.js`.

So if you want something like `bower`, you could use:

    { "staticPattern": "components/{resource}/{file}" }

Or if you want everything in one directory:

    { "staticPattern": "static/{file}" }

Most filenames denote their resource, but not specifying `{resource}` might
end up overwriting some files. `birdie install` will not inform you of such
conflicts, so be careful.

Then fetch them!

    birdie install

### Command line options

You can specify all these options at the command line, instead of `package.json`.
But I led with `package.json` because that's the sane way.

Run `birdie --help` to see what flags to use.

### Over the top

Birdie also aliases the main script to `birdy`, so `birdie ...` and `birdy ...` do exactly the same thing.

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
Before you send a pull request, please verify that:

1. Your addition is not a duplicate of an existing resource.
2. Someone else might conceivably want to use the resource you are submitting.

## To-do

1. Support git directly, rather than converting to `https://raw.github.com/...` for github
   and dying on everything else.
2. Add option not to overwrite existing files (or even fetch them).
   * Maybe even incorporating the file creation time as a `If-Modified-Since`
     header, and ignoring "304 Not Modified" responses.
3. Cache locally like `bower` does, something like `~/.birdie`?
4. Use multiple urls when available. Ideas:
   * Randomize which url gets picked.
   * Check that they're all the same.
   * Fall back to other urls if any of them error out with a 404 / 500.
5. Add more libraries!
   - d3
   - date.js
   - head.js
   - lesscss
   - mousetrap
   - jquery.fileupload
   - [js-url](https://github.com/websanova/js-url)
   - jquery.mustache

<!-- 1. http://stackoverflow.com/questions/2466735/checkout-only-one-file-from-git -->
<!-- 1. http://schacon.github.io/git/git-read-tree.html#_sparse_checkout -->
<!-- 5. https://github.com/chbrown/static-lib -->

## License

Copyright 2013 Christopher Brown

MIT Licensed
