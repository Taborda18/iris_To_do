import { AppError, notFound } from '../../../shared/errors.js';
import type { Task, TaskCategory, TaskPriority, TaskRepository } from '../domain/task.js';

export class CreateTask {
  constructor(private readonly repository: TaskRepository) {}

  async execute(userId: string, input: { title: string; category: TaskCategory; priority: TaskPriority; completed?: boolean; dateLimit?: Date | null }): Promise<Task> {
    const title = input.title.trim();
    if (!title) throw new AppError(400, 'Task title cannot be empty');
    return this.repository.create(userId, { title, category: input.category, priority: input.priority, completed: input.completed, dateLimit: input.dateLimit });
  }
}

export class ListTasks {
  constructor(private readonly repository: TaskRepository) {}

  execute(userId: string, input: { completed?: boolean; visible?: boolean; page: number; limit: number }) {
    const skip = (input.page - 1) * input.limit;
    return this.repository.findMany(userId, { completed: input.completed, visible: input.visible, skip, take: input.limit }).then((result) => ({
      items: result.items,
      pagination: { page: input.page, limit: input.limit, total: result.total, totalPages: Math.ceil(result.total / input.limit) },
    }));
  }
}

export class GetTask {
  constructor(private readonly repository: TaskRepository) {}

  async execute(userId: string, id: string): Promise<Task> {
    const task = await this.repository.findById(userId, id);
    if (!task) throw notFound('Task');
    return task;
  }
}

export class UpdateTask {
  constructor(private readonly repository: TaskRepository) {}

  async execute(userId: string, id: string, input: { title?: string; category?: TaskCategory; priority?: TaskPriority; completed?: boolean; dateLimit?: Date | null }): Promise<Task> {
    const update = { ...input, ...(input.title !== undefined ? { title: input.title.trim() } : {}) };
    if (update.title !== undefined && !update.title) throw new AppError(400, 'Task title cannot be empty');
    const task = await this.repository.update(userId, id, update);
    if (!task) throw notFound('Task');
    return task;
  }
}

export class DeleteTask {
  constructor(private readonly repository: TaskRepository) {}

  async execute(userId: string, id: string): Promise<void> {
    if (!(await this.repository.delete(userId, id))) throw notFound('Task');
  }
}

export class RestoreTask {
  constructor(private readonly repository: TaskRepository) {}

  async execute(userId: string, id: string): Promise<Task> {
    const task = await this.repository.restore(userId, id);
    if (!task) throw notFound('Task');
    return task;
  }
}
