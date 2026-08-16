import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateTaskInput } from '../../models/task/task.model';
import type { CreateTaskRequestDto, TaskDto, TaskListResponseDto, UpdateTaskRequestDto } from '../../models/task/task.dto';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/tasks`;

  getTasks(): Observable<TaskListResponseDto> {
    const params = new HttpParams().set('page', 1).set('limit', 100);
    return this.http.get<TaskListResponseDto>(this.endpoint, { params });
  }

  getTrash(): Observable<TaskListResponseDto> {
    const params = new HttpParams().set('page', 1).set('limit', 100).set('visible', false);
    return this.http.get<TaskListResponseDto>(this.endpoint, { params });
  }

  createTask(input: CreateTaskInput): Observable<{ readonly data: TaskDto }> {
    const request: CreateTaskRequestDto = input;
    return this.http.post<{ readonly data: TaskDto }>(this.endpoint, request);
  }

  updateTask(id: string, input: UpdateTaskRequestDto): Observable<{ readonly data: TaskDto }> {
    return this.http.patch<{ readonly data: TaskDto }>(`${this.endpoint}/${id}`, input);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  restoreTask(id: string): Observable<{ readonly data: TaskDto }> {
    return this.http.post<{ readonly data: TaskDto }>(`${this.endpoint}/${id}/restore`, {});
  }
}
