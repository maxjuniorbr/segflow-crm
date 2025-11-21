import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const clientSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    personType: z.enum(['Física', 'Jurídica']).default('Física'),
    cpf: z.string().nullable().optional(),
    cnpj: z.string().nullable().optional(),
    rg: z.string().nullable().optional(),
    rgDispatchDate: z.string().nullable().optional(),
    rgIssuer: z.string().nullable().optional(),
    birthDate: z.string().nullable().optional(),
    maritalStatus: z.string().nullable().optional(),
    email: z.string().email().optional().or(z.literal('')).or(z.null()),
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
    notes: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
    if (data.personType === 'Física') {
        if (!data.cpf) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['cpf'],
                message: 'CPF é obrigatório para Pessoa Física',
            });
        }
    } else if (data.personType === 'Jurídica') {
        if (!data.cnpj) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['cnpj'],
                message: 'CNPJ é obrigatório para Pessoa Jurídica',
            });
        }
    }
});

export const documentSchema = z.object({
    id: z.string().optional(),
    clientId: z.string(),
    type: z.string(),
    company: z.string().optional(),
    documentNumber: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string(),
    attachmentName: z.string().optional(),
    notes: z.string().optional(),
});
