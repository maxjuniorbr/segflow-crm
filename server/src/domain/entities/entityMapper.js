export const getRowValue = (row, keys, defaultValue = undefined) => {
    if (!row) {
        return defaultValue;
    }

    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
            const value = row[key];
            if (value !== undefined) {
                return value;
            }
        }
    }

    return defaultValue;
};
