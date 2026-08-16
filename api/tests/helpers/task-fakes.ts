import type { Task, TaskRepository } from '../../src/modules/tasks/domain/task.js';

export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '507f1f77bcf86cd799439011',
  title: 'Default task',
  category: 'FrontEnd',
  priority: 'Media',
  completed: false,
  visible: true,
  dateLimit: null,
  deletedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

export const makeTaskRepository = (overrides: Partial<TaskRepository> = {}): TaskRepository => ({
  create: async (_userId, input) => makeTask(input),
  findMany: async () => ({ items: [], total: 0 }),
  findById: async () => null,
  update: async () => null,
  delete: async () => false,
  restore: async () => null,
  ...overrides,
});
