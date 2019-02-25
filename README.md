## Usage

	infuse [options] <input> [output]
	cat <input> | infuse [options] > output

The input argument can be:
  * A path to an HTML file.
  * A path to a directory. An ES Module will be created for each HTML file in the directory.
    Use the --recursive option to search for HTML files recursively. If the input argument is a
    directory, the output argument must also be a directory.
  * A glob pattern. An ES Module will be created for each file that matches the given pattern.
    Use the --cwd option to limit the search to an specified directory.
  * If omitted, the STDIN will be used as input.

The output argument:
  * Can be a path to an output file, but only when the input argument is a file or when STDIN is
    used as input.
  * Must be a path to a directory if the input argument is a directory or a glob pattern.
  * If omitted, the generated ES Module will be written to STDOUT.

## Options
	--help          Show this help message.
	--cwd           The current working directory in which to search for files. Only applicable
	                when the input argument is a pattern. Defaults to process.cwd().
	-e, --encoding  Character encoding to use when reading and writing files. Defaults to "utf8".
	-r, --recursive Recursively search for files. Only applicable when the input argument is a
	                path to a directory.

### Infuse.host Configuration Options

Additional details for these options can be found at https://infuse.host/

	--configs-path        Generated ES Modules will use this path to import the configs module (from
	                      infuse.host) in the client side. Defaults to "infuse.host/src/configs.js".
	--camel-case-events   If present, event handler names that contain dashes will be camel cased.
	--constant-exp        The prefix or a regular expression used to determine if an attribute is a
	                      custom constant. Defaults to "const-". To use a regular expression, this
	                      option must start and end with a slash and contain parenthesis. For
	                      instance:
	                        --constant-exp "/^(\\w+)-const$/"
	--context-function-id Attribute name that identifies context functions. Defaults to "data-cid".
	--event-handler-exp   The prefix or a regular expression used to determine if an attribute is
	                      an event handler. Defaults to "/^on-?(\\w[\\w:-]+)$/". To use a regular
	                      expression, this option must start and end with a slash and contain
	                      parenthesis. For instance:
	                        --event-handler-exp "/^when-(\\w+)-run$/"
	--event-name          Name for event variables. Defaults to "event".
	--placeholder-id      Attribute name that identifies placeholder templates. Defaults to
	                      "data-pid".
	--sweep-flag          Name for the sweep boolean attribute. Defaults to "data-sweep".
	--tags                Tag names that are used in the templates. This can be a single tag name
	                      or a comma separated list of tag names. Alternatively, multiple tag names
	                      can be specified by using --tags multiple times (once for each tag name).
	--tags-name           Name of the variable that contains all tag functions. Defaults to "tags".
	--template-id         Attribute name that identifies templates. Defaults to "data-tid".
	--watch-exp           The prefix or a regular expression used to determine if an attribute is a
	                      watch. Defaults to "watch-". To use a regular expression, this option
	                      must start and end with a slash and contain parenthesis. For instance:
	                        --watch-exp "/^(\\w+)-watch$/"

## Examples

Parse template.html and write the generated ES Module to template.js:

	infuse template.html template.js

The following is identical to the previous example but using STDIN and STDOUT:

	cat template.html | infuse > tempalte.js

Convert all HTML files in src/html (recursively) and write them all to the dist directory:

	infuse --recursive src/html dist

The following example uses a pattern to achieve the same result as the previous example:

	infuse --cwd src/html "**/*.html" dist

All generated modules will import the configs module from "/modules/infuse.host/src/configs.js":

	infuse --configs-path "/modules/infuse.host/src/configs.js" src/html dist