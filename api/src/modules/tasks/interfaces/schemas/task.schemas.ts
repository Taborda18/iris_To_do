import { z } from 'zod';

export const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid task id');
const categorySchema = z.enum(['FrontEnd', 'BackEnd', 'Docs']);
const prioritySchema = z.enum(['Baja', 'Media', 'Urgente']);
const dateLimitSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date limit').transform((value) => new Date(`${value}T12:00:00.000Z`)).nullable();
export const createTaskSchema = z.object({ title: z.string().min(1).max(200), category: categorySchema, priority: prioritySchema, completed: z.boolean().optional(), dateLimit: dateLimitSchema.optional() }).strict();
export const updateTaskSchema = z.object({ title: z.string().min(1).max(200).optional(), category: categorySchema.optional(), priority: prioritySchema.optional(), completed: z.boolean().optional(), dateLimit: dateLimitSchema.optional() }).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required');
export const listTasksSchema = z.object({ completed: z.enum(['true', 'false']).optional(), visible: z.enum(['true', 'false']).default('true'), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
