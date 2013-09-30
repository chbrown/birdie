## Birdy

Birdy is a fast, fine-grained static asset management tool.
It intends to replace [bower](https://github.com/bower/bower) for common uses,
although it is not as flexible (it does not include the kitchen sink).

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

First, install Birdy

    npm install -g birdy

You'll need to add a section to your `package.json`, or a `package.json` file to your project, if you don't node.

    birdy init

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
you happen to run `birdy install`, and all necessary directories will be created.

It has two special values, which are replaced as the script proceeds.

* `{resource}`: The resource name, e.g., "jquery"
* `{file}`: The file name, which may be several files, as specified by the
  resource in `resources/{resource}.js`.

So if you want something like `bower`, you could use:

    { "staticPattern": "components/{resource}/{file}" }

Or if you want everything in one directory:

    { "staticPattern": "static/{file}" }

Most filenames denote their resource, but not specifying `{resource}` might
end up overwriting some files. `birdy install` will not inform you of such
conflicts, so be careful.

Then fetch them!

    birdy install

### Command line options

You can specify all these options at the command line, instead of `package.json`.
But I led with `package.json` because that's the sane way.

Run `birdy --help` to see what flags to use.

## resources/*

Every resource is an arbitrary javascript file that exposes a function as `module.exports`.

Function signature:

    function(version, callback) {
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
3. Cache locally like `bower` does, something like `~/.birdy/`?
4. Look for a config file when including a tarball / git repo (`package.json`?)
   * Inside that config file, look for a field describing ignored files (`staticIgnore`?)
   * Do not copy over filepaths that match those globs / filenames
5. Use multiple urls when available. Ideas:
   * Randomize which url gets picked.
   * Check that they're all the same.
   * Fall back to other urls if any of them error out with a 404 / 500.
6. Add more libraries!
   - [D3.js](http://d3js.org/) (at v3)
   - [HeadJS](http://headjs.com/) (at v0.99)
   - [mousetrap](http://craig.is/killing/mice)
   - [jquery.fileupload](http://blueimp.github.io/jQuery-File-Upload/)
   - [jsSHA](https://github.com/Caligatio/jsSHA)
7. Maybe add these, too (lower priority):
   - [Hogan.js](http://twitter.github.io/hogan.js/) (although we have handlebars already)
   - [LESS](http://lesscss.org/) (less.js)
   - [date.js](http://www.datejs.com/) (although, it's a dead project, and we have moment.js now)
   - [jquery.mustache](https://github.com/jonnyreeves/jquery-Mustache) (again, we have handlebars)


<!-- 1. http://stackoverflow.com/questions/2466735/checkout-only-one-file-from-git -->
<!-- 2. http://schacon.github.io/git/git-read-tree.html#_sparse_checkout -->

## License

Copyright © 2013 Christopher Brown. [MIT Licensed](LICENSE).
