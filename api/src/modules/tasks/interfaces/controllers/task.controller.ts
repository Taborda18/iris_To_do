import type { Request, Response } from 'express';
import { AppError } from '../../../../shared/errors.js';
import { CreateTask, DeleteTask, GetTask, ListTasks, RestoreTask, UpdateTask } from '../../application/tasks.js';
import { presentTask } from '../task-presenter.js';
import { createTaskSchema, idSchema, listTasksSchema, updateTaskSchema } from '../schemas/task.schemas.js';

export class TaskController {
  constructor(private readonly createTask: CreateTask, private readonly listTasks: ListTasks, private readonly getTask: GetTask, private readonly updateTask: UpdateTask, private readonly deleteTask: DeleteTask, private readonly restoreTask: RestoreTask) {}

  readonly list = async (req: Request, res: Response): Promise<void> => {
    const query = listTasksSchema.parse(req.query);
    const result = await this.listTasks.execute(this.userId(req), { ...query, completed: query.completed === undefined ? undefined : query.completed === 'true', visible: query.visible === 'true' });
    res.json({ data: result.items.map(presentTask), pagination: result.pagination });
  };

  readonly create = async (req: Request, res: Response): Promise<void> => {
    const task = await this.createTask.execute(this.userId(req), createTaskSchema.parse(req.body));
    res.status(201).json({ data: presentTask(task) });
  };

  readonly get = async (req: Request, res: Response): Promise<void> => {
    res.json({ data: presentTask(await this.getTask.execute(this.userId(req), idSchema.parse(req.params.id))) });
  };

  readonly update = async (req: Request, res: Response): Promise<void> => {
    const task = await this.updateTask.execute(this.userId(req), idSchema.parse(req.params.id), updateTaskSchema.parse(req.body));
    res.json({ data: presentTask(task) });
  };

  readonly remove = async (req: Request, res: Response): Promise<void> => {
    await this.deleteTask.execute(this.userId(req), idSchema.parse(req.params.id));
    res.status(204).send();
  };

  readonly restore = async (req: Request, res: Response): Promise<void> => {
    const task = await this.restoreTask.execute(this.userId(req), idSchema.parse(req.params.id));
    res.json({ data: presentTask(task) });
  };

  private userId(req: Request): string {
    if (!req.userId) throw new AppError(401, 'Authentication required');
    return req.userId;
  }
}
