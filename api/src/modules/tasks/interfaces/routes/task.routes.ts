import { Router } from 'express';
import { asyncHandler } from '../../../../interfaces/http/async-handler.js';
import type { TaskController } from '../controllers/task.controller.js';

export const taskRouter = (controller: TaskController) => {
  const router = Router();
  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.get));
  router.patch('/:id', asyncHandler(controller.update));
  router.post('/:id/restore', asyncHandler(controller.restore));
  router.delete('/:id', asyncHandler(controller.remove));
  return router;
};
