/**
 * Validation utilities for Brazilian documents (CPF and CNPJ)
 * These functions implement the official validation algorithms
 */

/**
 * Validates CPF using check digit algorithm
 * @param {string} cpf - CPF with or without formatting
 * @returns {boolean} true if valid, false otherwise
 */
export function isValidCPF(cpf) {
    if (!cpf) return false;

    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11) return false;

    // Check for known invalid patterns (all same digits)
    const invalidPatterns = [
        '00000000000', '11111111111', '22222222222',
        '33333333333', '44444444444', '55555555555',
        '66666666666', '77777777777', '88888888888',
        '99999999999'
    ];
    if (invalidPatterns.includes(cpf)) return false;

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let checkDigit1 = 11 - (sum % 11);
    if (checkDigit1 >= 10) checkDigit1 = 0;
    if (checkDigit1 !== parseInt(cpf.charAt(9))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let checkDigit2 = 11 - (sum % 11);
    if (checkDigit2 >= 10) checkDigit2 = 0;
    if (checkDigit2 !== parseInt(cpf.charAt(10))) return false;

    return true;
}

/**
 * Validates CNPJ using check digit algorithm
 * @param {string} cnpj - CNPJ with or without formatting
 * @returns {boolean} true if valid, false otherwise
 */
export function isValidCNPJ(cnpj) {
    if (!cnpj) return false;

    cnpj = cnpj.replace(/[^\d]/g, '');

    if (cnpj.length !== 14) return false;

    // Check for known invalid patterns (all same digits)
    const invalidPatterns = [
        '00000000000000', '11111111111111', '22222222222222',
        '33333333333333', '44444444444444', '55555555555555',
        '66666666666666', '77777777777777', '88888888888888',
        '99999999999999'
    ];
    if (invalidPatterns.includes(cnpj)) return false;

    // Validate first check digit
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit1 !== parseInt(cnpj.charAt(12))) return false;

    // Validate second check digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit2 !== parseInt(cnpj.charAt(13))) return false;

    return true;
}
