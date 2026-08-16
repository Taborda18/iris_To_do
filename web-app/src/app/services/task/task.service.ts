import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TaskApiService } from './task-api.service';
import { mapTaskDto } from './task.mapper';
import { CreateTaskInput, Task } from '../../models/task/task.model';
import type { UpdateTaskRequestDto } from '../../models/task/task.dto';
import { AlertService } from '../../shared/services/alert.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly taskApi = inject(TaskApiService);
  private readonly alertService = inject(AlertService);
  private readonly tasksState = signal<readonly Task[]>([]);
  private readonly trashState = signal<readonly Task[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly togglingTaskIds = signal<ReadonlySet<string>>(new Set());
  readonly tasks = this.tasksState.asReadonly();
  readonly trash = this.trashState.asReadonly();

  async loadTasks(): Promise<void> {
    await this.run(async () => {
      const response = await firstValueFrom(this.taskApi.getTasks());
      this.tasksState.set(response.data.map(mapTaskDto));
    }, true);
  }

  async loadTrash(): Promise<void> {
    await this.run(async () => {
      const response = await firstValueFrom(this.taskApi.getTrash());
      this.trashState.set(response.data.map(mapTaskDto));
    });
  }

  async addTask(input: CreateTaskInput): Promise<void> {
    const title = input.title.trim();
    if (!title) return;

    const succeeded = await this.run(async () => {
      const response = await firstValueFrom(this.taskApi.createTask({ ...input, title }));
      this.tasksState.update((tasks) => [...tasks, mapTaskDto(response.data)]);
    });
    if (succeeded) this.alertService.success('La tarea fue creada correctamente.', 'Tarea creada');
  }

  async restoreTask(id: string): Promise<void> {
    const succeeded = await this.run(async () => {
      const response = await firstValueFrom(this.taskApi.restoreTask(id));
      this.trashState.update((tasks) => tasks.filter((task) => task.id !== id));
      this.tasksState.update((tasks) => [...tasks, mapTaskDto(response.data)]);
    });
    if (succeeded) this.alertService.success('La tarea fue restaurada correctamente.', 'Tarea restaurada');
  }

  async toggleTask(id: string): Promise<void> {
    const task = this.tasksState().find((item) => item.id === id);
    if (!task || this.togglingTaskIds().has(id)) return;

    this.setToggling(id, true);
    try {
      const succeeded = await this.run(async () => {
        const response = await firstValueFrom(this.taskApi.updateTask(id, { completed: !task.completed }));
        this.tasksState.update((tasks) => tasks.map((item) => item.id === id ? mapTaskDto(response.data) : item));
      });
      if (succeeded) this.alertService.success('El estado de la tarea fue actualizado.', 'Tarea actualizada');
    } finally {
      this.setToggling(id, false);
    }
  }

  async updateTask(id: string, input: UpdateTaskRequestDto): Promise<boolean> {
    const succeeded = await this.run(async () => {
      const response = await firstValueFrom(this.taskApi.updateTask(id, input));
      this.tasksState.update((tasks) => tasks.map((task) => task.id === id ? mapTaskDto(response.data) : task));
    });
    if (succeeded) this.alertService.success('La tarea fue actualizada correctamente.', 'Tarea actualizada');
    return succeeded;
  }

  async deleteTask(id: string): Promise<void> {
    const succeeded = await this.run(async () => {
      await firstValueFrom(this.taskApi.deleteTask(id));
      this.tasksState.update((tasks) => tasks.filter((task) => task.id !== id));
    });
    if (succeeded) this.alertService.success('La tarea fue eliminada correctamente.', 'Tarea eliminada');
  }

  private async run(operation: () => Promise<void>, showLoading = false): Promise<boolean> {
    if (showLoading) this.loading.set(true);
    this.error.set(null);
    try {
      await operation();
      return true;
    } catch (error: unknown) {
      const message = this.getErrorMessage(error);
      this.error.set(message);
      this.alertService.error(message);
      return false;
    } finally {
      if (showLoading) this.loading.set(false);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'No fue posible conectar con el servidor.';
      if (error.status === 400 || error.status === 422) return 'Los datos enviados no son válidos.';
      if (error.status === 404) return 'La tarea solicitada no fue encontrada.';
      if (error.status >= 500) return 'Ocurrió un error interno en el servidor.';
      const serverMessage = this.readServerMessage(error.error);
      if (serverMessage) return serverMessage;
    }
    return 'No fue posible completar la solicitud.';
  }

  private readServerMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object' || !('message' in payload)) return null;
    const message = payload.message;
    return typeof message === 'string' ? message : null;
  }

  private setToggling(id: string, value: boolean): void {
    this.togglingTaskIds.update((ids) => {
      const next = new Set(ids);
      if (value) next.add(id); else next.delete(id);
      return next;
    });
  }
}
