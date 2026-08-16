import type { Task as PrismaTask } from '@prisma/client';
import { prisma } from '../../../infrastructure/prisma.js';
import type { Task, TaskCategory, TaskPriority, TaskRepository } from '../domain/task.js';

const categories = new Set<TaskCategory>(['FrontEnd', 'BackEnd', 'Docs']);
const priorities = new Set<TaskPriority>(['Baja', 'Media', 'Urgente']);

const mapCategory = (value: unknown): TaskCategory => typeof value === 'string' && categories.has(value as TaskCategory) ? value as TaskCategory : 'FrontEnd';
const mapPriority = (value: unknown): TaskPriority => typeof value === 'string' && priorities.has(value as TaskPriority) ? value as TaskPriority : 'Media';
const mapTask = (task: PrismaTask): Task => ({ ...task, visible: task.visible ?? true, dateLimit: task.dateLimit ?? null, deletedAt: task.deletedAt ?? null, category: mapCategory(task.category), priority: mapPriority(task.priority) });

export class PrismaTaskRepository implements TaskRepository {
  async create(userId: string, input: { title: string; category: Task['category']; priority: Task['priority']; completed?: boolean; dateLimit?: Date | null }): Promise<Task> {
    return mapTask(await prisma.task.create({ data: { userId, title: input.title, category: input.category, priority: input.priority, completed: input.completed ?? false, visible: true, dateLimit: input.dateLimit ?? null } }));
  }

  async findMany(userId: string, input: { completed?: boolean; visible?: boolean; skip: number; take: number }) {
    const visibility = input.visible === false ? { visible: false } : { OR: [{ visible: true }, { visible: { isSet: false } }] };
    const where = { userId, ...visibility, ...(input.completed === undefined ? {} : { completed: input.completed }) };
    const [items, total] = await Promise.all([
      prisma.task.findMany({ where, skip: input.skip, take: input.take, orderBy: { createdAt: 'desc' } }),
      prisma.task.count({ where }),
    ]);
    return { items: items.map(mapTask), total };
  }

  async findById(userId: string, id: string) {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    return task ? mapTask(task) : null;
  }

  async update(userId: string, id: string, input: { title?: string; category?: Task['category']; priority?: Task['priority']; completed?: boolean; dateLimit?: Date | null; visible?: boolean; deletedAt?: Date | null }) {
    try {
      const task = await prisma.task.findFirst({ where: { id, userId } });
      return task ? mapTask(await prisma.task.update({ where: { id }, data: input })) : null;
    } catch (error) {
      if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') return null;
      throw error;
    }
  }

  async delete(userId: string, id: string) {
    try {
      const task = await prisma.task.findFirst({ where: { id, userId } });
      if (!task) return false;
       await prisma.task.update({ where: { id }, data: { visible: false, deletedAt: new Date() } });
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') return false;
      throw error;
    }
  }

  async restore(userId: string, id: string) {
    const task = await prisma.task.findFirst({ where: { id, userId, visible: false } });
    return task ? mapTask(await prisma.task.update({ where: { id }, data: { visible: true, deletedAt: null } })) : null;
  }
}
