/**
 * Escapes special characters (`%`, `_`, `\`) for PostgreSQL LIKE patterns
 * and lowercases the input.
 * @param {string} text
 * @returns {string}
 */
export const sanitizeForLike = (text) => {
    return text.toLowerCase().replaceAll(/[%_\\]/g, String.raw`\$&`);
};

/**
 * Pushes a value into the parameter array and returns the positional placeholder.
 * @param {unknown[]} values
 * @param {unknown} value
 * @returns {string} Positional placeholder like `$1`, `$2`, etc.
 */
export const addParam = (values, value) => {
    values.push(value);
    return `$${values.length}`;
};

/**
 * @param {string[]} conditions
 * @returns {string}
 */
export const buildWhereClause = (conditions) => {
    return conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
};

/**
 * Appends a keyset (cursor-based) pagination condition.
 * @param {string} query
 * @param {unknown[]} values
 * @param {{ createdAt: string, id: string }} cursor
 * @param {boolean} hasWhereClause
 * @param {string} [prefix] Table alias prefix, e.g. `'d.'`
 * @returns {string}
 */
export const appendCursorCondition = (query, values, cursor, hasWhereClause, prefix = '') => {
    const createdAtParam = addParam(values, cursor.createdAt);
    const idParam = addParam(values, cursor.id);
    const conjunction = hasWhereClause ? ' AND' : ' WHERE';
    return query + `${conjunction} (${prefix}created_at < ${createdAtParam} OR (${prefix}created_at = ${createdAtParam} AND ${prefix}id < ${idParam}))`;
};

/**
 * @param {string} query
 * @param {unknown[]} values
 * @param {number|string|null|undefined} limit
 * @returns {string}
 */
export const appendLimit = (query, values, limit) => {
    if (limit == null) return query;
    const n = Number.parseInt(limit, 10);
    if (Number.isNaN(n) || n <= 0) return query;
    values.push(n);
    return query + ` LIMIT $${values.length}`;
};

/**
 * @param {string} query
 * @param {unknown[]} values
 * @param {number|string|null|undefined} offset
 * @returns {string}
 */
export const appendOffset = (query, values, offset) => {
    if (offset == null) return query;
    const n = Number.parseInt(offset, 10);
    if (Number.isNaN(n) || n < 0) return query;
    values.push(n);
    return query + ` OFFSET $${values.length}`;
};

/**
 * Extracts the `total_count` window-function value from the first row.
 * @param {{ rows: Array<{ total_count?: string }> }} result
 * @returns {number}
 */
export const parseTotalCount = (result) => {
    return Number.parseInt(result.rows[0]?.total_count, 10) || 0;
};
