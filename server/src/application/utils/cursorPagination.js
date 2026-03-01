const CURSOR_VERSION = 1;

export const encodeCursor = ({ createdAt, id }) => {
    if (!createdAt || !id) {
        return null;
    }
    const payload = JSON.stringify({ v: CURSOR_VERSION, createdAt, id });
    return Buffer.from(payload).toString('base64url');
};

export const decodeCursor = (cursor) => {
    if (!cursor || typeof cursor !== 'string') {
        return null;
    }

    try {
        const raw = Buffer.from(cursor, 'base64url').toString('utf8');
        const data = JSON.parse(raw);
        if (data?.v !== CURSOR_VERSION) {
            return null;
        }
        if (typeof data.createdAt !== 'string' || typeof data.id !== 'string') {
            return null;
        }
        const date = new Date(data.createdAt);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        return { createdAt: date.toISOString(), id: data.id };
    } catch {
        return null;
    }
};
