#!/usr/bin/env node

const path = require('path');
const meow = require('meow');
const { default: createESModule } = require('infuse.host/lib/createESModule');
const fs = require('../src/fs');
const { isPattern, pick, readStream, searchFiles } = require('../src/utils');

const { R_OK: READABLE } = fs.constants;
const INPUT_ERROR = 'The input must be a pattern or a file or directory that exists and is readable.';
const OUTPUT_ERROR = 'The output must be a directory if the input is a pattern or a directory.';

const cli = meow(`
  Usage
    html-esm [options] <input> [output]
    cat <input> | html-esm [options] > output

  Options
    --help          Show this help message.
    --cwd 
    -e, --encoding 
    -r, --recursive 
    --configs-path

  Examples
`, {
	description: 'Parse templates in HTML files and generate ES Module files.',
	flags: {
		configsPath: {
			type: 'string',
		},
		directory: {
			type: 'string',
		},
		encoding: {
			alias: 'e',
			default: 'utf8',
			type: 'string',
		},
		recursive: {
			alias: 'r',
			default: false,
			type: 'boolean',
		},
	},
});

const globOptions = pick(cli.flags, ['cwd']);
const infuseOptions = pick(cli.flags, ['configsPath']);
const flags = pick(cli.flags, ['encoding', 'recursive']);

/**
 * Parses the HTML templates in the given `input` and writes a generated ES Module to the
 * specified `output`.
 *
 * @function generateModule
 * @param {(string|stream.Readable)} input A path to an input file or a readable stream.
 * @param {(string|stream.Writable)} output A path to an output file or a writable stream.
 */
async function generateModule(input, output) {
	let dest = output;
	const { encoding } = flags;
	const source = typeof input === 'string' ? fs.createReadStream(input, encoding) : input;
	const html = await readStream(source, encoding);
	const esm = createESModule(html, infuseOptions);

	/**
	 * If `dest` is a string (a path to the destination file) create its containing directory (in
	 * case it doesn't exist) and create a writable stream.
	 */
	if (typeof dest === 'string') {
		await fs.mkdir(path.dirname(dest), { recursive: true });
		dest = fs.createWriteStream(dest, encoding);
	}

	dest.end(esm, encoding);
}

async function run() {
	let input;
	// The input and output arguments.
	const [inputArg, outputArg] = cli.input;

	if (!inputArg) {
		// If no input argument was given, use the STDIN as `input`.
		input = process.stdin;
	} else {
		let pattern;

		if (isPattern(inputArg)) {
			// If the input argument is a pattern, use it as `pattern` below.
			pattern = inputArg;

			// If a --cwd flag was not used, use `process.cwd()` as default.
			if (!globOptions.cwd) {
				globOptions.cwd = process.cwd();
			}
		} else {
			// If the input argument is NOT a pattern, check if it's a path to a directory.

			let stats;

			/**
			 * Make sure the input argument exists and it's a readable file or directory. Exit with
			 * an error message if it's not.
			 */
			try {
				// Make sure it exists and it's readable and get its file stats.
				await fs.access(inputArg, READABLE);
				stats = await fs.stat(inputArg);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(INPUT_ERROR);
				return process.exit(1);
			}

			/**
			 * If the input argument is a path to a directory, use it as the working directory for
			 * the file search below and use the --recursive flag to determine the pattern.
			 */
			if (stats.isDirectory()) {
				globOptions.cwd = path.resolve(inputArg);
				pattern = flags.recursive ? '**/*.html' : '*.html';
			}
		}

		/**
		 * If `pattern` was set above, use it to search for files an generate seperate ES Modules
		 * for each file that is found.
		 */
		if (pattern) {
			let outputDir;

			try {
				outputDir = path.resolve(outputArg);
			} catch (ex) {
				// eslint-disable-next-line no-console
				console.error(OUTPUT_ERROR);
				return process.exit(1);
			}

			const { cwd } = globOptions;
			const files = await searchFiles(pattern, globOptions);

			const promises = files.map((file) => {
				// Determine the full paths to the input and output files.
				const source = path.resolve(cwd, file);
				const dest = path.resolve(outputDir, file);

				return generateModule(source, dest);
			});

			// Wait until all files are processed before ending execution.
			return Promise.all(promises);
		}

		/**
		 * If the input argument is not a pattern nor a path to a directory, use it as a path to
		 * an input file.
		 */
		input = inputArg;
	}

	/**
	 * Generate the ES Module. If an output argument was given, use it as the path to the output
	 * file, otherwise output the generated ES Module to STDOUT.
	 */
	return generateModule(input, outputArg || process.stdout);
}

run();