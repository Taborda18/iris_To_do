import type { Task } from '../../models/task/task.model';
import type { TaskDto } from '../../models/task/task.dto';

export function mapTaskDto(dto: TaskDto): Task {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category,
    priority: dto.priority,
    completed: dto.completed,
    visible: dto.visible,
    dateLimit: dto.dateLimit,
    deletedAt: dto.deletedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
