// @ts-check

/**
 * @param {any} err
 * @param {Array<[string, string, string]>} fieldMap - [dbColumn, fieldPath, message]
 * @returns {{ status: number, payload: { error: Array<{ path: string[], message: string }> } } | null}
 */
export const mapUniqueConstraintError = (err, fieldMap) => {
    if (err.code !== '23505') return null;
    const detail = (err.detail || '').toLowerCase();
    const match = fieldMap.find(([column]) => detail.includes(column));
    if (!match) {
        return { status: 400, payload: { error: [{ path: ['unknown'], message: 'Registro duplicado' }] } };
    }
    return { status: 400, payload: { error: [{ path: [match[1]], message: match[2] }] } };
};
