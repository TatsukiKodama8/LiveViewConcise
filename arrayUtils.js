class ArrayUtils {
    /**
     * Compare two arrays and return a binary array representing the presence of elements from arrB in arrA.
     * @param {Array} arr - The first array.
     * @param {Array} arrFixed - The second array.
     * @returns {Array} A binary array where 1 represents presence of arrB's element in arrA, 0 otherwise.
     */
    static twoArraysConsistency(arr, arrFixed) {
        return arrFixed.map(itemFixed => arr.includes(itemFixed) ? 1 : 0);
    }

    /**
     * Convert an array of binary numbers to a binary string.
     * @param {Array} arr - The array of binary numbers.
     * @returns {String} The binary string.
     */
    static arrayToBinaryString(arr) {
        return arr.join('');
    }

    /**
     * Convert a binary string to a hexadecimal string.
     * @param {String} binaryString - The binary string.
     * @returns {String} The hexadecimal string.
     */
    static binaryStringToHex(binaryString) {
        return parseInt(binaryString, 2).toString(16);
    }

    /**
     * Convert two arrays to a hexadecimal string representing their consistency.
     * @param {Array} arr - The first array.
     * @param {Array} arrFixed - The second array.
     * @returns {String} The hexadecimal string.
     */
    static twoArraysToHex(arr, arrFixed) {
        const arrTemp = ArrayUtils.twoArraysConsistency(arr, arrFixed);
        const bin = ArrayUtils.arrayToBinaryString(arrTemp);
        return ArrayUtils.binaryStringToHex(bin);
    }

    /**
     * Convert a hexadecimal string to a binary string.
     * @param {String} hexString - The hexadecimal string.
     * @returns {String} The binary string.
     */
    static hexStringToBinary(hexString) {
        return parseInt(hexString, 16).toString(2);
    }

    /**
     * Pad a binary string with leading zeros to a specified length.
     * @param {String} stringNum - The binary string.
     * @param {Number} paddingOrder - The length to pad to.
     * @returns {String} The padded binary string.
     */
    static zeroPaddingString(stringNum, paddingOrder = 0) {
        return stringNum.padStart(paddingOrder, '0');
    }

    /**
     * Convert a binary string to an array of numbers.
     * @param {String} binaryString - The binary string.
     * @returns {Array} The array of numbers.
     */
    static binaryStringToArray(binaryString) {
        return binaryString.split('').map(Number);
    }

    /**
     * Find the index of the first matching element between two arrays.
     * @param {Array} arrA - The first array.
     * @param {Array} arrB - The second array.
     * @returns {Number} The index of the first matching element.
     */
    static twoArraysInitMatch(arrA, arrB) {
        return arrA.findIndex(a => arrB.some(b => a === b));
    }

    /**
     * Convert a hexadecimal string to an array of binary numbers.
     * @param {String} hex - The hexadecimal string.
     * @param {Number} paddingOrder - The length to pad the binary string to.
     * @returns {Array} The array of binary numbers.
     */
    static hexToArray(hex, paddingOrder) {
        const bin = ArrayUtils.hexStringToBinary(hex);
        const binPadding = ArrayUtils.zeroPaddingString(bin, paddingOrder);
        return ArrayUtils.binaryStringToArray(binPadding);
    }

    /**
     * Filter an array based on a binary array of the same length.
     * @param {Array} arrZeroOne - The binary array.
     * @param {Array} arrFixed - The array to be filtered.
     * @returns {Array} The filtered array.
     * @throws {Error} If the lengths of the two arrays are not equal.
     */
    static filterByIndex(arrZeroOne, arrFixed) {
        if (arrZeroOne.length !== arrFixed.length) {
            throw new Error("The lengths of the two arrays must be equal.");
        }

        return arrZeroOne.reduce((arr, val, i) => {
            if (val === 1) arr.push(arrFixed[i]);
            return arr;
        }, []);
    }
}

module.exports = ArrayUtils;


// test
const hex = '1A'; // hexadecimal
const paddingOrder = 8; // paddingOrder

// test of hexToArray
const result = ArrayUtils.hexToArray(hex, paddingOrder);
console.log(result); // [0, 0, 0, 1, 1, 0, 1, 0]