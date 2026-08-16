import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TaskCategory, TaskSort, TaskStatus } from '../../../models/task/task.model';

export interface TaskFilterState { readonly category: TaskCategory | 'All'; readonly status: TaskStatus; readonly search: string; readonly sort: TaskSort; }

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [FormsModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-filters.html',
  styleUrl: './task-filters.css',
})
export class TaskFiltersComponent {
  readonly filtersChanged = output<TaskFilterState>();
  readonly categories: readonly (TaskCategory | 'All')[] = ['All', 'FrontEnd', 'BackEnd', 'Docs'];
  readonly category = signal<TaskCategory | 'All'>('All');
  readonly status = signal<TaskStatus>('Todos');
  readonly search = signal('');
  readonly sort = signal<TaskSort>('Fecha límite');
  readonly statuses: TaskStatus[] = ['Todos', 'Pendientes', 'Completadas'];
  readonly sortOptions: TaskSort[] = ['Fecha de creación', 'Fecha límite', 'Prioridad'];

  emit(): void { this.filtersChanged.emit({ category: this.category(), status: this.status(), search: this.search(), sort: this.sort() }); }
}
