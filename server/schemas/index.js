import { z } from 'zod';
import { isValidCPF, isValidCNPJ } from '../utils/validators.js';
import {
    requiredString,
    requiredNonEmptyString,
    optionalNullableStringMax,
    optionalNullableString,
    emailField,
    optionalPasswordField,
    addressSchema,
    optionalDateField,
    requiredDateField
} from './common.js';

const PWD_MSG = 'Senha deve ter ao menos 10 caracteres, incluindo maiúsculas, minúsculas e números';

const strongPasswordField = (min) =>
    z.string()
        .min(min, PWD_MSG)
        .max(72, 'Senha deve ter no máximo 72 caracteres')
        .refine(val => /[a-z]/.test(val), { message: PWD_MSG })
        .refine(val => /[A-Z]/.test(val), { message: PWD_MSG })
        .refine(val => /\d/.test(val), { message: PWD_MSG });

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
    password: strongPasswordField(10),
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
        .min(1, 'Senha é obrigatória')
        .max(1000, 'Senha inválida'),
});

export const changePasswordSchema = z.object({
    currentPassword: requiredNonEmptyString('Senha atual é obrigatória'),
    newPassword: strongPasswordField(10),
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
    rgDispatchDate: optionalDateField(),
    rgIssuer: optionalNullableStringMax(20, 'Órgão expedidor deve ter no máximo 20 caracteres'),
    birthDate: optionalDateField(),
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
    clientId: requiredString({ requiredMessage: 'Cliente é obrigatório', max: 255, maxMessage: 'Cliente inválido' }),
    type: requiredString({ requiredMessage: 'Tipo é obrigatório', max: 100, maxMessage: 'Tipo deve ter no máximo 100 caracteres' }),
    company: requiredString({ requiredMessage: 'Seguradora é obrigatória', max: 200, maxMessage: 'Seguradora deve ter no máximo 200 caracteres' }),
    documentNumber: optionalNullableStringMax(50, 'Número deve ter no máximo 50 caracteres'),
    startDate: requiredDateField({ requiredMessage: 'Data de início é obrigatória' }),
    endDate: requiredDateField({ requiredMessage: 'Data de fim é obrigatória' }),
    status: z.enum(['Proposta', 'Apólice', 'Endosso', 'Cancelado', 'Vencido'], {
        required_error: 'Status é obrigatório',
        invalid_type_error: 'Status inválido',
    }),
    attachmentName: optionalNullableString(),
    notes: optionalNullableStringMax(1000, 'Observações devem ter no máximo 1000 caracteres'),
}).superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endDate'],
            message: 'Data de fim deve ser posterior à data de início',
        });
    }
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
    status: z.enum(['Proposta', 'Apólice', 'Endosso', 'Cancelado', 'Vencido']).optional(),
    search: optionalNullableStringMax(200, 'Busca inválida'),
    cursor: optionalNullableStringMax(500, 'Cursor inválido'),
    limit: numberQueryField(z.number().int().min(1).max(200)).optional(),
    offset: numberQueryField(z.number().int().min(0).max(10000)).optional()
});

export const clientListQuerySchema = z.object({
    search: optionalNullableStringMax(200, 'Busca inválida'),
    personType: z.enum(['Física', 'Jurídica']).optional(),
    cursor: optionalNullableStringMax(500, 'Cursor inválido'),
    limit: numberQueryField(z.number().int().min(1).max(200)).optional(),
    offset: numberQueryField(z.number().int().min(0).max(10000)).optional()
});

export const brokerListQuerySchema = z.object({
    limit: numberQueryField(z.number().int().min(1).max(200)).optional(),
});

export const userListQuerySchema = z.object({
    limit: numberQueryField(z.number().int().min(1).max(200)).optional(),
});

export const idParamSchema = z.object({
    id: z.string()
        .min(1, 'ID é obrigatório')
        .max(255, 'ID deve ter no máximo 255 caracteres')
});

export const userIdParamSchema = z.object({
    id: z.string()
        .min(1, 'ID é obrigatório')
        .regex(/^\d+$/, 'ID inválido')
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
    password: optionalPasswordField(10, PWD_MSG),
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

export const registerBrokerSchema = z.object({
    // Broker data
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
    phone: optionalNullableStringMax(20, 'Telefone deve ter no máximo 20 caracteres'),
    mobile: optionalNullableStringMax(20, 'Celular deve ter no máximo 20 caracteres'),
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres'),
    // Admin user data
    contactName: requiredString({
        requiredMessage: 'Nome do responsável é obrigatório',
        max: 200,
        maxMessage: 'Nome do responsável deve ter no máximo 200 caracteres'
    }),
    cpf: requiredString({
        requiredMessage: 'CPF é obrigatório',
        max: 14,
        maxMessage: 'CPF deve ter no máximo 14 caracteres'
    }),
    password: strongPasswordField(10),
}).superRefine((data, ctx) => {
    if (!isValidCNPJ(data.cnpj)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cnpj'],
            message: 'CNPJ inválido',
        });
    }
    if (!isValidCPF(data.cpf)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cpf'],
            message: 'CPF inválido',
        });
    }
});
