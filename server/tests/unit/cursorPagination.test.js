import { describe, it, expect } from 'vitest';
import { encodeCursor, decodeCursor } from '../../src/application/utils/cursorPagination.js';

describe('encodeCursor', () => {
    it('returns base64url encoded cursor for valid input', () => {
        const result = encodeCursor({ createdAt: '2024-01-01T00:00:00.000Z', id: 'abc-123' });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });

    it('returns null when createdAt is missing', () => {
        expect(encodeCursor({ createdAt: null, id: 'abc' })).toBeNull();
    });

    it('returns null when id is missing', () => {
        expect(encodeCursor({ createdAt: '2024-01-01', id: null })).toBeNull();
    });

    it('returns null when both fields are missing', () => {
        expect(encodeCursor({ createdAt: undefined, id: undefined })).toBeNull();
    });
});

describe('decodeCursor', () => {
    it('decodes a valid cursor back to original values', () => {
        const original = { createdAt: '2024-06-15T12:30:00.000Z', id: 'uuid-42' };
        const encoded = encodeCursor(original);
        const decoded = decodeCursor(encoded);

        expect(decoded).not.toBeNull();
        expect(decoded.createdAt).toBe('2024-06-15T12:30:00.000Z');
        expect(decoded.id).toBe('uuid-42');
    });

    it('returns null for null input', () => {
        expect(decodeCursor(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
        expect(decodeCursor(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
        expect(decodeCursor('')).toBeNull();
    });

    it('returns null for non-string input', () => {
        expect(decodeCursor(123)).toBeNull();
    });

    it('returns null for invalid base64', () => {
        expect(decodeCursor('not-valid-base64!!!')).toBeNull();
    });

    it('returns null for valid base64 but invalid JSON', () => {
        const notJson = Buffer.from('not json at all').toString('base64url');
        expect(decodeCursor(notJson)).toBeNull();
    });

    it('returns null when version does not match', () => {
        const payload = JSON.stringify({ v: 999, createdAt: '2024-01-01T00:00:00.000Z', id: '1' });
        const encoded = Buffer.from(payload).toString('base64url');
        expect(decodeCursor(encoded)).toBeNull();
    });

    it('returns null when createdAt is not a string', () => {
        const payload = JSON.stringify({ v: 1, createdAt: 12345, id: '1' });
        const encoded = Buffer.from(payload).toString('base64url');
        expect(decodeCursor(encoded)).toBeNull();
    });

    it('returns null when id is not a string', () => {
        const payload = JSON.stringify({ v: 1, createdAt: '2024-01-01T00:00:00.000Z', id: 42 });
        const encoded = Buffer.from(payload).toString('base64url');
        expect(decodeCursor(encoded)).toBeNull();
    });

    it('returns null when createdAt is not a valid date', () => {
        const payload = JSON.stringify({ v: 1, createdAt: 'not-a-date', id: '1' });
        const encoded = Buffer.from(payload).toString('base64url');
        expect(decodeCursor(encoded)).toBeNull();
    });

    it('normalizes createdAt to ISO string', () => {
        const original = { createdAt: '2024-06-15T12:30:00Z', id: 'x' };
        const encoded = encodeCursor(original);
        const decoded = decodeCursor(encoded);
        expect(decoded.createdAt).toBe('2024-06-15T12:30:00.000Z');
    });
});

describe('encode-decode roundtrip', () => {
    it('survives roundtrip with various dates', () => {
        const cases = [
            { createdAt: '2020-01-01T00:00:00.000Z', id: '1' },
            { createdAt: '2025-12-31T23:59:59.999Z', id: 'long-uuid-value' },
            { createdAt: '1999-06-15T08:15:30.500Z', id: 'legacy-id' }
        ];

        for (const input of cases) {
            const decoded = decodeCursor(encodeCursor(input));
            expect(decoded).not.toBeNull();
            expect(decoded.id).toBe(input.id);
        }
    });
});
