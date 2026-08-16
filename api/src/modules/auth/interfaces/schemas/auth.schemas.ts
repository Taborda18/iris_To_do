import { z } from 'zod';

export const registerSchema = z.object({ fullName: z.string().trim().min(2).max(100).regex(/^\p{L}+(?: +\p{L}+)*$/u, 'Full name can only contain letters and spaces'), email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()), password: z.string().min(8).max(128) }).strict();
export const loginSchema = z.object({ email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()), password: z.string().min(8).max(128) }).strict();
