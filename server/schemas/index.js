import { z } from 'zod';
import { isValidCPF, isValidCNPJ } from '../utils/validators.js';

export const registerSchema = z.object({
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres'),
    password: z.string()
        .min(6, 'Senha deve ter no mínimo 6 caracteres'),
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
    name: z.string()
        .min(1, 'Nome é obrigatório')
        .max(255, 'Nome deve ter no máximo 255 caracteres'),
    personType: z.enum(['Física', 'Jurídica']).default('Física'),
    cpf: z.string().nullable().optional(),
    cnpj: z.string().nullable().optional(),
    rg: z.string()
        .max(12, 'RG deve ter no máximo 12 caracteres')
        .nullable()
        .optional(),
    rgDispatchDate: z.string().nullable().optional(),
    rgIssuer: z.string()
        .max(20, 'Órgão expedidor deve ter no máximo 20 caracteres')
        .nullable()
        .optional(),
    birthDate: z.string().nullable().optional(),
    maritalStatus: z.string().nullable().optional(),
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres')
        .optional()
        .or(z.literal(''))
        .or(z.null()),
    phone: z.string().nullable().optional(),
    address: z.object({
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }).nullable().optional(),
    createdAt: z.string().optional(),
    notes: z.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
        .nullable()
        .optional(),
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

    // Check if CNPJ is required and valid
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
    clientId: z.string()
        .min(1, 'Cliente é obrigatório'),
    type: z.string()
        .min(1, 'Tipo é obrigatório'),
    company: z.string().optional(),
    documentNumber: z.string()
        .max(30, 'Número deve ter no máximo 30 caracteres')
        .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string()
        .min(1, 'Status é obrigatório'),
    attachmentName: z.string().optional(),
    notes: z.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
        .optional(),
});
