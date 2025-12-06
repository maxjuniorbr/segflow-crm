import { z } from 'zod';
import { isValidCPF, isValidCNPJ } from '../utils/validators.js';

export const registerSchema = z.object({
    name: z.string()
        .min(1, 'Nome é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    cpf: z.string()
        .min(1, 'CPF é obrigatório')
        .max(14, 'CPF deve ter no máximo 14 caracteres'),
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres'),
    password: z.string()
        .min(6, 'Senha deve ter no mínimo 6 caracteres'),
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
    name: z.string()
        .min(1, 'Nome é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    personType: z.enum(['Física', 'Jurídica']).default('Física'),
    cpf: z.string().max(14).nullable().optional(),
    cnpj: z.string().max(18).nullable().optional(),
    rg: z.string()
        .max(20, 'RG deve ter no máximo 20 caracteres')
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
        .min(1, 'Email é obrigatório'),
    phone: z.string()
        .min(1, 'Telefone é obrigatório')
        .max(15, 'Telefone deve ter no máximo 15 caracteres'),
    address: z.object({
        street: z.string()
            .min(1, 'Rua é obrigatória')
            .max(200, 'Logradouro deve ter no máximo 200 caracteres'),
        number: z.string()
            .min(1, 'Número é obrigatório')
            .max(20, 'Número deve ter no máximo 20 caracteres'),
        complement: z.string()
            .max(100, 'Complemento deve ter no máximo 100 caracteres')
            .optional(),
        neighborhood: z.string()
            .min(1, 'Bairro é obrigatório')
            .max(100, 'Bairro deve ter no máximo 100 caracteres'),
        city: z.string()
            .min(1, 'Cidade é obrigatória')
            .max(100, 'Cidade deve ter no máximo 100 caracteres'),
        state: z.string()
            .min(1, 'Estado é obrigatório')
            .max(2, 'Estado deve ter 2 caracteres'),
        zipCode: z.string()
            .min(1, 'CEP é obrigatório')
            .max(9, 'CEP deve ter no máximo 9 caracteres'),
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
    company: z.string()
        .min(1, 'Seguradora é obrigatória'),
    documentNumber: z.string()
        .max(50, 'Número deve ter no máximo 50 caracteres')
        .nullable()
        .optional(),
    startDate: z.string()
        .min(1, 'Data de início é obrigatória'),
    endDate: z.string()
        .min(1, 'Data de fim é obrigatória'),
    status: z.string()
        .min(1, 'Status é obrigatório'),
    attachmentName: z.string().nullable().optional(),
    notes: z.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
        .nullable()
        .optional(),
});

export const userSchema = z.object({
    name: z.string()
        .min(1, 'Nome é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    cpf: z.string()
        .min(1, 'CPF é obrigatório')
        .max(14, 'CPF deve ter no máximo 14 caracteres'),
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres'),
    password: z.string()
        .min(6, 'Senha deve ter no mínimo 6 caracteres')
        .optional()
        .nullable(),
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
    corporateName: z.string()
        .min(1, 'Razão social é obrigatória')
        .max(200, 'Razão social deve ter no máximo 200 caracteres'),
    tradeName: z.string()
        .min(1, 'Nome fantasia é obrigatório')
        .max(200, 'Nome fantasia deve ter no máximo 200 caracteres'),
    cnpj: z.string()
        .min(1, 'CNPJ é obrigatório')
        .max(18, 'CNPJ deve ter no máximo 18 caracteres'),
    susepCode: z.string()
        .max(20, 'Código SUSEP deve ter no máximo 20 caracteres')
        .nullable()
        .optional(),
    contactName: z.string()
        .min(1, 'Contato é obrigatório')
        .max(200, 'Contato deve ter no máximo 200 caracteres'),
    email: z.string()
        .email('Email inválido')
        .max(254, 'Email deve ter no máximo 254 caracteres')
        .min(1, 'Email é obrigatório'),
    phone: z.string()
        .min(1, 'Telefone é obrigatório')
        .max(20, 'Telefone deve ter no máximo 20 caracteres'),
    mobile: z.string()
        .min(1, 'Celular é obrigatório')
        .max(20, 'Celular deve ter no máximo 20 caracteres'),
}).superRefine((data, ctx) => {
    if (!isValidCNPJ(data.cnpj)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cnpj'],
            message: 'CNPJ inválido',
        });
    }
});

