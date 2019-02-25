const fs = require('fs');
const { pick, promisify } = require('./utils');

const PICK = ['constants', 'createReadStream', 'createWriteStream'];
const ASYNC_FUNCTIONS = ['access', 'mkdir', 'readFile', 'stat', 'writeFile'];

/**
 * Copy functions, listed in `PICK`, from `fs` into `exports`.
 */
Object.assign(exports, pick(fs, PICK));

/**
 * Promisify the functions listed in `ASYNC_FUNCTIONS` and add them to `exports`.
 */
ASYNC_FUNCTIONS.forEach((key) => {
	exports[key] = promisify(fs[key]);
});