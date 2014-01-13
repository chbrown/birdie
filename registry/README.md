## resources/

* `versions`: a list of valid version strings.
  The **last** of these should be the `*` version.
  This will usually correspond to the latest stable version to use when the user specifies .

  This property is optional. If no `versions` list is exported, `*` will be used as the literal version.

### template

Use this resource template for all resources:

`versions` is a list of valid versions. The last of these is the latest standard / production version.

`files` is a dictionary.
* The keys are the filepaths that this registry will insert into the local filesystem
  (they replace the `{file}` variable in the static pattern string).
* The values are lists of urls, which may contain variables (variables start with a '$', );
