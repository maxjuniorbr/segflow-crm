/**
 * Validation utilities for Brazilian documents (CPF and CNPJ)
 * These functions implement the official validation algorithms
 */

/**
 * Validates CPF using check digit algorithm
 * @param cpf - CPF with or without formatting
 * @returns true if valid, false otherwise
 */
export function isValidCPF(cpf: string): boolean {
    if (!cpf) return false;

    const cleanCpf = cpf.replace(/[^\d]/g, '');

    if (cleanCpf.length !== 11) return false;

    const invalidPatterns = [
        '00000000000', '11111111111', '22222222222',
        '33333333333', '44444444444', '55555555555',
        '66666666666', '77777777777', '88888888888',
        '99999999999'
    ];
    if (invalidPatterns.includes(cleanCpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let checkDigit1 = 11 - (sum % 11);
    if (checkDigit1 >= 10) checkDigit1 = 0;
    if (checkDigit1 !== parseInt(cleanCpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    let checkDigit2 = 11 - (sum % 11);
    if (checkDigit2 >= 10) checkDigit2 = 0;
    if (checkDigit2 !== parseInt(cleanCpf.charAt(10))) return false;

    return true;
}

/**
 * Validates CNPJ using check digit algorithm
 * @param cnpj - CNPJ with or without formatting
 * @returns true if valid, false otherwise
 */
export function isValidCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;

    const cleanCnpj = cnpj.replace(/[^\d]/g, '');

    if (cleanCnpj.length !== 14) return false;

    const invalidPatterns = [
        '00000000000000', '11111111111111', '22222222222222',
        '33333333333333', '44444444444444', '55555555555555',
        '66666666666666', '77777777777777', '88888888888888',
        '99999999999999'
    ];
    if (invalidPatterns.includes(cleanCnpj)) return false;

    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
        sum += parseInt(cleanCnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit1 !== parseInt(cleanCnpj.charAt(12))) return false;

    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
        sum += parseInt(cleanCnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit2 !== parseInt(cleanCnpj.charAt(13))) return false;

    return true;
}
