exports.eventCenter = require('./eventCenter')
exports.log = require('./log')

/**
 *
 * @param max {number}
 * @param min {number}
 * @return {number}
 */
exports.rand = function rand (max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 *
 * @param {number} seed
 * @return {function(max:number, min?:number): number}
 * @constructor
 */
exports.PRNG = function (seed) {
    return function (max, min = 0) {
        const m = 2 ** 32;
        seed = (seed * 9301 + 49297) % m;
        return min + (seed / m) * (max - min);
    }
}
