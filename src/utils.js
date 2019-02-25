const glob = require('glob');

/**
 * Promisifies a function.
 *
 * @function promisify
 * @param {Function} fn The function to promisify.
 * @return {Function} The promisified function.
 */
exports.promisify = function promisify(fn) {
	return (...args) => new Promise((resolve, reject) => {
		fn(...args, (error, result) => (error ? reject(error) : resolve(result)));
	});
};

/**
 * Copies attributes listed in `keys` from the given `object` into a new object.
 *
 * @function pick
 * @param {Object} object The object from which to copy the attributes.
 * @param {string[]} keys The attributes keys to include in the returned object.
 * @return {Object} The new object.
 */
exports.pick = function pick(object, keys) {
	return keys.reduce((result, key) => {
		if (object[key] !== undefined) {
			// eslint-disable-next-line no-param-reassign
			result[key] = object[key];
		}
		return result;
	}, {});
};

/**
 * Reads the entire contents of the given stream into a string.
 *
 * @function readStream
 * @param {stream.Readable} stream A readable stream.
 * @param {string} encoding The character encoding to use when reading the stream.
 * @return {Promise<string>} When the entire stream is read, the returned promise is resolved using
 *     the contents of the stream.
 */
exports.readStream = function readStream(stream, encoding) {
	return new Promise((resolve, reject) => {
		let data = '';

		stream.setEncoding(encoding);
		stream.on('readable', () => {
			let chunk;
			while ((chunk = stream.read()) !== null) {
				data += chunk;
			}
		});
		stream.on('end', () => resolve(data));
		stream.on('error', reject);
	});
};

/**
 * Use the [`hasMagic`](https://www.npmjs.com/package/glob#globhasmagicpattern-options) function
 * from the glob library to determine if a given string is a pattern.
 *
 * @function isPattern
 */
exports.isPattern = glob.hasMagic;

/**
 * Create a promisified version of the
 * [`glob`](https://www.npmjs.com/package/glob#globpattern-options-cb) function, which will be used
 * to search for files that match a given pattern.
 *
 * @function searchFiles
 */
exports.searchFiles = exports.promisify(glob);