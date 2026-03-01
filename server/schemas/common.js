import { z } from 'zod';

export const requiredString = ({ requiredMessage, max, maxMessage }) =>
    z.string()
        .min(1, requiredMessage)
        .max(max, maxMessage);

export const requiredNonEmptyString = (requiredMessage) =>
    z.string().min(1, requiredMessage);

export const optionalNullableStringMax = (max, maxMessage) =>
    z.string()
        .max(max, maxMessage)
        .nullable()
        .optional();

export const optionalStringMax = (max, maxMessage) =>
    z.string()
        .max(max, maxMessage)
        .optional();

export const optionalNullableString = () =>
    z.string()
        .nullable()
        .optional();

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FORMAT_MESSAGE = 'Data deve estar no formato AAAA-MM-DD';

const isRealDate = (val) => {
    if (!ISO_DATE_PATTERN.test(val)) return false;
    const [y, m, d] = val.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

export const optionalDateField = () =>
    z.union([
        z.string()
            .regex(ISO_DATE_PATTERN, DATE_FORMAT_MESSAGE)
            .refine(isRealDate, { message: 'Data inválida' }),
        z.literal('')
    ])
    .nullable()
    .optional();

export const requiredDateField = ({ requiredMessage }) =>
    z.string()
        .min(1, requiredMessage)
        .max(10, 'Data inválida')
        .regex(ISO_DATE_PATTERN, DATE_FORMAT_MESSAGE)
        .refine(isRealDate, { message: 'Data inválida' });

export const emailField = ({ requiredMessage }) =>
    z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres')
        .min(1, requiredMessage);

export const optionalPasswordField = (min, message) =>
    z.string()
        .min(min, message)
        .max(72, 'Senha deve ter no máximo 72 caracteres')
        .refine(val => /[a-z]/.test(val), { message })
        .refine(val => /[A-Z]/.test(val), { message })
        .refine(val => /\d/.test(val), { message })
        .optional()
        .nullable();

export const addressSchema = z.object({
    street: requiredString({
        requiredMessage: 'Rua é obrigatória',
        max: 200,
        maxMessage: 'Logradouro deve ter no máximo 200 caracteres'
    }),
    number: requiredString({
        requiredMessage: 'Número é obrigatório',
        max: 20,
        maxMessage: 'Número deve ter no máximo 20 caracteres'
    }),
    complement: optionalStringMax(100, 'Complemento deve ter no máximo 100 caracteres'),
    neighborhood: requiredString({
        requiredMessage: 'Bairro é obrigatório',
        max: 100,
        maxMessage: 'Bairro deve ter no máximo 100 caracteres'
    }),
    city: requiredString({
        requiredMessage: 'Cidade é obrigatória',
        max: 100,
        maxMessage: 'Cidade deve ter no máximo 100 caracteres'
    }),
    state: requiredString({
        requiredMessage: 'Estado é obrigatório',
        max: 2,
        maxMessage: 'Estado deve ter 2 caracteres'
    }),
    zipCode: requiredString({
        requiredMessage: 'CEP é obrigatório',
        max: 9,
        maxMessage: 'CEP deve ter no máximo 9 caracteres'
    })
});
