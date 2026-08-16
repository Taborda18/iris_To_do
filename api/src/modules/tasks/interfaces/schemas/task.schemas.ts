import { z } from 'zod';

export const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid task id');
const categorySchema = z.enum(['FrontEnd', 'BackEnd', 'Docs']);
const prioritySchema = z.enum(['Baja', 'Media', 'Urgente']);
const todayInColombia = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date limit').refine((value) => {
  const date = new Date(`${value}T12:00:00.000Z`);
  const [year, month, day] = value.split('-').map(Number);
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
}, 'Invalid date limit');
const dateLimitSchema = dateStringSchema.transform((value) => new Date(`${value}T12:00:00.000Z`)).nullable();
const createDateLimitSchema = dateStringSchema.refine((value) => value >= todayInColombia(), 'Date limit cannot be in the past').transform((value) => new Date(`${value}T12:00:00.000Z`)).nullable();
export const createTaskSchema = z.object({ title: z.string().min(1).max(200), category: categorySchema, priority: prioritySchema, completed: z.boolean().optional(), dateLimit: createDateLimitSchema.optional() }).strict();
export const updateTaskSchema = z.object({ title: z.string().min(1).max(200).optional(), category: categorySchema.optional(), priority: prioritySchema.optional(), completed: z.boolean().optional(), dateLimit: createDateLimitSchema.optional() }).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required');
export const listTasksSchema = z.object({ completed: z.enum(['true', 'false']).optional(), visible: z.enum(['true', 'false']).default('true'), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
