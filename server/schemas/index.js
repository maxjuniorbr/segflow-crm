import { z } from 'zod';
import { isValidCPF, isValidCNPJ } from '../utils/validators.js';
import {
    requiredString,
    requiredNonEmptyString,
    optionalNullableStringMax,
    optionalNullableString,
    emailField,
    optionalPasswordField,
    addressSchema
} from './common.js';

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const passwordMessage = 'Senha deve ter ao menos 8 caracteres, incluindo letras e números';

export const registerSchema = z.object({
    name: requiredString({
        requiredMessage: 'Nome é obrigatório',
        max: 200,
        maxMessage: 'Nome deve ter no máximo 200 caracteres'
    }),
    cpf: requiredString({
        requiredMessage: 'CPF é obrigatório',
        max: 14,
        maxMessage: 'CPF deve ter no máximo 14 caracteres'
    }),
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres'),
    password: z.string()
        .min(8, passwordMessage)
        .regex(passwordPattern, passwordMessage),
}).superRefine((data, ctx) => {
    if (!isValidCPF(data.cpf)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cpf'],
            message: 'CPF inválido',
        });
    }
});

export const loginSchema = z.object({
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres'),
    password: z.string()
        .min(1, 'Senha é obrigatória'),
});

export const clientSchema = z.object({
    id: z.string().optional(),
    name: requiredString({
        requiredMessage: 'Nome é obrigatório',
        max: 200,
        maxMessage: 'Nome deve ter no máximo 200 caracteres'
    }),
    personType: z.enum(['Física', 'Jurídica']).default('Física'),
    cpf: optionalNullableStringMax(14, 'CPF deve ter no máximo 14 caracteres'),
    cnpj: optionalNullableStringMax(18, 'CNPJ deve ter no máximo 18 caracteres'),
    rg: optionalNullableStringMax(20, 'RG deve ter no máximo 20 caracteres'),
    rgDispatchDate: optionalNullableString(),
    rgIssuer: optionalNullableStringMax(20, 'Órgão expedidor deve ter no máximo 20 caracteres'),
    birthDate: optionalNullableString(),
    maritalStatus: optionalNullableString(),
    email: emailField({ requiredMessage: 'Email é obrigatório' }),
    phone: requiredString({
        requiredMessage: 'Telefone é obrigatório',
        max: 15,
        maxMessage: 'Telefone deve ter no máximo 15 caracteres'
    }),
    address: addressSchema.nullable().optional(),
    createdAt: z.string().optional(),
    notes: optionalNullableStringMax(1000, 'Observações devem ter no máximo 1000 caracteres'),
}).superRefine((data, ctx) => {
    if (data.personType === 'Física') {
        if (!data.cpf || data.cpf.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['cpf'],
                message: 'CPF é obrigatório para Pessoa Física',
            });
        } else if (!isValidCPF(data.cpf)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['cpf'],
                message: 'CPF inválido',
            });
        }
    }

    if (data.personType === 'Jurídica') {
        if (!data.cnpj || data.cnpj.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['cnpj'],
                message: 'CNPJ é obrigatório para Pessoa Jurídica',
            });
        } else if (!isValidCNPJ(data.cnpj)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['cnpj'],
                message: 'CNPJ inválido',
            });
        }
    }
});

export const documentSchema = z.object({
    id: z.string().optional(),
    clientId: requiredNonEmptyString('Cliente é obrigatório'),
    type: requiredNonEmptyString('Tipo é obrigatório'),
    company: requiredNonEmptyString('Seguradora é obrigatória'),
    documentNumber: optionalNullableStringMax(50, 'Número deve ter no máximo 50 caracteres'),
    startDate: requiredNonEmptyString('Data de início é obrigatória'),
    endDate: requiredNonEmptyString('Data de fim é obrigatória'),
    status: requiredNonEmptyString('Status é obrigatório'),
    attachmentName: optionalNullableString(),
    notes: optionalNullableStringMax(1000, 'Observações devem ter no máximo 1000 caracteres'),
});

const numberQueryField = (schema) =>
    z.preprocess((value) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        const parsed = Number(value);
        return Number.isNaN(parsed) ? value : parsed;
    }, schema);

export const documentListQuerySchema = z.object({
    clientId: optionalNullableStringMax(255, 'Cliente inválido'),
    status: optionalNullableStringMax(50, 'Status inválido'),
    search: optionalNullableStringMax(200, 'Busca inválida'),
    limit: numberQueryField(z.number().int().min(1).max(200)).optional(),
    offset: numberQueryField(z.number().int().min(0).max(10000)).optional()
});

export const userSchema = z.object({
    name: requiredString({
        requiredMessage: 'Nome é obrigatório',
        max: 200,
        maxMessage: 'Nome deve ter no máximo 200 caracteres'
    }),
    cpf: requiredString({
        requiredMessage: 'CPF é obrigatório',
        max: 14,
        maxMessage: 'CPF deve ter no máximo 14 caracteres'
    }),
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres'),
    password: optionalPasswordField(8, passwordMessage, passwordPattern, passwordMessage),
}).superRefine((data, ctx) => {
    if (!isValidCPF(data.cpf)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cpf'],
            message: 'CPF inválido',
        });
    }
});

export const brokerSchema = z.object({
    id: z.string().optional(),
    corporateName: requiredString({
        requiredMessage: 'Razão social é obrigatória',
        max: 200,
        maxMessage: 'Razão social deve ter no máximo 200 caracteres'
    }),
    tradeName: requiredString({
        requiredMessage: 'Nome fantasia é obrigatório',
        max: 200,
        maxMessage: 'Nome fantasia deve ter no máximo 200 caracteres'
    }),
    cnpj: requiredString({
        requiredMessage: 'CNPJ é obrigatório',
        max: 18,
        maxMessage: 'CNPJ deve ter no máximo 18 caracteres'
    }),
    susepCode: optionalNullableStringMax(20, 'Código SUSEP deve ter no máximo 20 caracteres'),
    contactName: requiredString({
        requiredMessage: 'Contato é obrigatório',
        max: 200,
        maxMessage: 'Contato deve ter no máximo 200 caracteres'
    }),
    email: emailField({ requiredMessage: 'Email é obrigatório' }),
    phone: requiredString({
        requiredMessage: 'Telefone é obrigatório',
        max: 20,
        maxMessage: 'Telefone deve ter no máximo 20 caracteres'
    }),
    mobile: requiredString({
        requiredMessage: 'Celular é obrigatório',
        max: 20,
        maxMessage: 'Celular deve ter no máximo 20 caracteres'
    }),
}).superRefine((data, ctx) => {
    if (!isValidCNPJ(data.cnpj)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cnpj'],
            message: 'CNPJ inválido',
        });
    }
});

