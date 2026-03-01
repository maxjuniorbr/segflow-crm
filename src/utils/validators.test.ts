import { describe, it, expect } from 'vitest';
import { isValidCPF, isValidCNPJ, isValidEmail } from './validators';

describe('isValidCPF', () => {
    it('accepts valid CPFs', () => {
        expect(isValidCPF('529.982.247-25')).toBe(true);
        expect(isValidCPF('52998224725')).toBe(true);
        expect(isValidCPF('111.444.777-35')).toBe(true);
    });

    it('rejects all-same-digit CPFs', () => {
        expect(isValidCPF('111.111.111-11')).toBe(false);
        expect(isValidCPF('00000000000')).toBe(false);
        expect(isValidCPF('99999999999')).toBe(false);
    });

    it('rejects invalid check digits', () => {
        expect(isValidCPF('529.982.247-26')).toBe(false);
        expect(isValidCPF('12345678901')).toBe(false);
    });

    it('rejects wrong length', () => {
        expect(isValidCPF('1234567890')).toBe(false);
        expect(isValidCPF('123456789012')).toBe(false);
        expect(isValidCPF('')).toBe(false);
    });

    it('rejects null/undefined', () => {
        expect(isValidCPF(null as unknown as string)).toBe(false);
        expect(isValidCPF(undefined as unknown as string)).toBe(false);
    });
});

describe('isValidCNPJ', () => {
    it('accepts valid CNPJs', () => {
        expect(isValidCNPJ('11.222.333/0001-81')).toBe(true);
        expect(isValidCNPJ('11222333000181')).toBe(true);
    });

    it('rejects all-same-digit CNPJs', () => {
        expect(isValidCNPJ('11111111111111')).toBe(false);
        expect(isValidCNPJ('00000000000000')).toBe(false);
    });

    it('rejects invalid check digits', () => {
        expect(isValidCNPJ('11.222.333/0001-82')).toBe(false);
        expect(isValidCNPJ('12345678000100')).toBe(false);
    });

    it('rejects wrong length', () => {
        expect(isValidCNPJ('1234567800018')).toBe(false);
        expect(isValidCNPJ('123456780001811')).toBe(false);
        expect(isValidCNPJ('')).toBe(false);
    });

    it('rejects null/undefined', () => {
        expect(isValidCNPJ(null as unknown as string)).toBe(false);
        expect(isValidCNPJ(undefined as unknown as string)).toBe(false);
    });
});

describe('isValidEmail', () => {
    it('accepts valid emails', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('a@b.co')).toBe(true);
    });

    it('rejects invalid emails', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('@no-local.com')).toBe(false);
        expect(isValidEmail('no-domain@')).toBe(false);
        expect(isValidEmail('')).toBe(false);
    });

    it('rejects null/undefined', () => {
        expect(isValidEmail(null as unknown as string)).toBe(false);
        expect(isValidEmail(undefined as unknown as string)).toBe(false);
    });
});
