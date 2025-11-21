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
    id: z.string().optional(), // UUID is usually generated on frontend or backend
    name: z.string().min(1),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    rgDispatchDate: z.string().optional(),
    rgIssuer: z.string().optional(),
    birthDate: z.string().optional(),
    maritalStatus: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }).optional(),
    createdAt: z.string().optional(),
    notes: z.string().optional(),
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
