import { describe, expect, it, vi } from 'vitest';
import { CreateTask, DeleteTask, GetTask, ListTasks, RestoreTask, UpdateTask } from '../../../src/modules/tasks/application/tasks.js';
import { makeTask, makeTaskRepository } from '../../helpers/task-fakes.js';

describe('tasks application', () => {
  it('trims and creates a task for the authenticated user', async () => {
    const create = vi.fn(async (userId: string, input: Parameters<ReturnType<typeof makeTaskRepository>['create']>[1]) => makeTask({ id: userId, ...input }));
    const result = await new CreateTask(makeTaskRepository({ create })).execute('user-1', { title: '  Buy milk  ', category: 'FrontEnd', priority: 'Media' });

    expect(result.title).toBe('Buy milk');
    expect(create).toHaveBeenCalledWith('user-1', expect.objectContaining({ title: 'Buy milk' }));
  });

  it('rejects empty task titles', async () => {
    await expect(new CreateTask(makeTaskRepository()).execute('user-1', { title: '   ', category: 'FrontEnd', priority: 'Media' })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('lists tasks with user scope and pagination', async () => {
    const findMany = vi.fn(async () => ({ items: [makeTask()], total: 21 }));
    const result = await new ListTasks(makeTaskRepository({ findMany })).execute('user-1', { completed: true, page: 3, limit: 10 });

    expect(result.pagination).toEqual({ page: 3, limit: 10, total: 21, totalPages: 3 });
    expect(findMany).toHaveBeenCalledWith('user-1', { completed: true, skip: 20, take: 10 });
  });

  it('gets a task scoped to the authenticated user', async () => {
    const findById = vi.fn(async () => makeTask());
    await expect(new GetTask(makeTaskRepository({ findById })).execute('user-1', 'task-1')).resolves.toEqual(expect.objectContaining({ title: 'Default task' }));
    expect(findById).toHaveBeenCalledWith('user-1', 'task-1');
  });

  it('returns not found when a task belongs to another user', async () => {
    await expect(new GetTask(makeTaskRepository()).execute('user-1', 'task-1')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('trims titles and updates a task', async () => {
    const update = vi.fn(async (_userId, _id, input) => makeTask(input));
    await expect(new UpdateTask(makeTaskRepository({ update })).execute('user-1', 'task-1', { title: '  Updated  ', completed: true })).resolves.toMatchObject({ title: 'Updated', completed: true });
    expect(update).toHaveBeenCalledWith('user-1', 'task-1', { title: 'Updated', completed: true });
  });

  it('rejects empty updated titles', async () => {
    await expect(new UpdateTask(makeTaskRepository()).execute('user-1', 'task-1', { title: ' ' })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('deletes a task for the authenticated user', async () => {
    const remove = vi.fn(async () => true);
    await expect(new DeleteTask(makeTaskRepository({ delete: remove })).execute('user-1', 'task-1')).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith('user-1', 'task-1');
  });

  it('returns not found when deleting another user task', async () => {
    await expect(new DeleteTask(makeTaskRepository()).execute('user-1', 'task-1')).rejects.toMatchObject({ statusCode: 404 });
  });
});
