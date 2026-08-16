import type { TaskCategory, TaskPriority } from './task.model';

export interface TaskDto {
  readonly id: string;
  readonly title: string;
  readonly category: TaskCategory;
  readonly priority: TaskPriority;
  readonly completed: boolean;
  readonly visible: boolean;
  readonly dateLimit: string | null;
  readonly deletedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateTaskRequestDto {
  readonly title: string;
  readonly category: TaskCategory;
  readonly priority: TaskPriority;
  readonly completed?: boolean;
  readonly dateLimit?: string | null;
}

export interface UpdateTaskRequestDto {
  readonly title?: string;
  readonly category?: TaskCategory;
  readonly priority?: TaskPriority;
  readonly completed?: boolean;
  readonly dateLimit?: string | null;
}

export interface TaskListResponseDto {
  readonly data: readonly TaskDto[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}
