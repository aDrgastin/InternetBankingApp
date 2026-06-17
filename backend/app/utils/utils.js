/**
 * Parses a given value to a positive number integer
 * @param {*} value value to be parsed
 * @returns parsed value or `null` if it's not a valid integer number
 */
export function parseId(value) {
    const id = Number(value);
    return (!id || !Number.isInteger(id)) ? null : id;
}
