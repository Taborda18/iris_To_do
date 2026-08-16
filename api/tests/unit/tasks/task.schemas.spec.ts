import { describe, expect, it } from 'vitest';
import { createTaskSchema, idSchema, listTasksSchema, updateTaskSchema } from '../../../src/modules/tasks/interfaces/schemas/task.schemas.js';

describe('task schemas', () => {
  it('validates task ids and creates tasks', () => {
    expect(idSchema.parse('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011');
    expect(createTaskSchema.parse({ title: 'Task', category: 'Docs', priority: 'Urgente' })).toEqual({ title: 'Task', category: 'Docs', priority: 'Urgente' });
  });

  it('rejects invalid ids and unknown task fields', () => {
    expect(() => idSchema.parse('not-an-object-id')).toThrow();
    expect(() => createTaskSchema.parse({ title: 'Task', category: 'Docs', priority: 'Media', extra: true })).toThrow();
  });

  it('parses pagination defaults and filters', () => {
    expect(listTasksSchema.parse({ completed: 'true', visible: 'false', page: '2', limit: '10' })).toEqual({ completed: 'true', visible: 'false', page: 2, limit: 10 });
    expect(listTasksSchema.parse({})).toEqual({ visible: 'true', page: 1, limit: 20 });
  });

  it('requires at least one update field', () => {
    expect(() => updateTaskSchema.parse({})).toThrow();
    expect(updateTaskSchema.parse({ completed: true })).toEqual({ completed: true });
  });

  it('validates optional task deadline', () => {
    expect(createTaskSchema.parse({ title: 'Task', category: 'Docs', priority: 'Media', dateLimit: '2099-09-01' }).dateLimit).toBeInstanceOf(Date);
    expect(updateTaskSchema.parse({ dateLimit: null })).toEqual({ dateLimit: null });
  });

  it('rejects past and invalid calendar dates when creating tasks', () => {
    expect(() => createTaskSchema.parse({ title: 'Task', category: 'Docs', priority: 'Media', dateLimit: '2000-01-01' })).toThrow();
    expect(() => createTaskSchema.parse({ title: 'Task', category: 'Docs', priority: 'Media', dateLimit: '2026-02-30' })).toThrow();
  });

  it('rejects past dates when updating tasks', () => {
    expect(() => updateTaskSchema.parse({ dateLimit: '2000-01-01' })).toThrow();
  });
});
