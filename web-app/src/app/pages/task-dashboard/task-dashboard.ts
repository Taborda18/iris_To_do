import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Task, TaskCategory, TaskSort, TaskStatus } from '../../models/task/task.model';
import { TaskService } from '../../services/task/task.service';
import { TaskFiltersComponent, TaskFilterState } from './task-filters/task-filters';
import { TaskCreateDrawerComponent } from './task-create-drawer/task-create-drawer';
import { TaskListComponent } from './task-list/task-list';
import { TaskMetricsComponent } from './task-metrics/task-metrics';
import { IconComponent } from '../../shared/components/icon/icon';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { AuthService } from '../../services/auth/auth.service';
import { TaskTrashDialogComponent } from './task-trash-dialog/task-trash-dialog';
import { TaskEditDialogComponent } from './task-edit-dialog/task-edit-dialog';
import type { UpdateTaskRequestDto } from '../../models/task/task.dto';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [TaskCreateDrawerComponent, TaskFiltersComponent, TaskListComponent, TaskMetricsComponent, IconComponent, NavbarComponent, TaskTrashDialogComponent, TaskEditDialogComponent],
  templateUrl: './task-dashboard.html',
  styleUrl: './task-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDashboard implements OnInit {
  readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly isFormOpen = signal(false);
  readonly isUserMenuOpen = signal(false);
  readonly isTrashOpen = signal(false);
  readonly editingTask = signal<Task | null>(null);
  readonly filters = signal<TaskFilterState>({ category: 'All', status: 'Todos', search: '', sort: 'Fecha límite' });
  readonly tasks = this.taskService.tasks;
  readonly loading = this.taskService.loading;
  readonly togglingTaskIds = this.taskService.togglingTaskIds;
  readonly error = this.taskService.error;
  readonly currentUser = this.authService.currentUser;
  readonly userInitials = computed(() => this.currentUser()?.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? 'IR');
  readonly completed = computed(() => this.tasks().filter((task) => task.completed).length);
  readonly pending = computed(() => this.tasks().length - this.completed());
  readonly progress = computed(() => this.tasks().length ? Math.round((this.completed() / this.tasks().length) * 100) : 0);
  readonly filteredTasks = computed(() => {
    const current = this.filters();
    const search = current.search.toLowerCase().trim();
    const priorityOrder = { Urgente: 1, Media: 2, Baja: 3 } as const;
    const dateValue = (date: string | null | undefined): number => date ? Date.parse(date) : Number.POSITIVE_INFINITY;
    return this.tasks()
      .filter((task) => current.category === 'All' || task.category === current.category)
      .filter((task) => current.status === 'Todos' || (current.status === 'Completadas' ? task.completed : !task.completed))
      .filter((task) => task.title.toLowerCase().includes(search))
      .sort((a, b) => current.sort === 'Prioridad' ? priorityOrder[a.priority] - priorityOrder[b.priority] : current.sort === 'Fecha límite' ? dateValue(a.dateLimit) - dateValue(b.dateLimit) || priorityOrder[a.priority] - priorityOrder[b.priority] : b.createdAt.localeCompare(a.createdAt));
  });
  readonly categories = computed(() => {
    const counts: Record<TaskCategory, number> = { FrontEnd: 0, BackEnd: 0, Docs: 0 };
    for (const task of this.tasks()) counts[task.category] += 1;
    return counts;
  });
  readonly categorySummary = computed(() =>
    (['FrontEnd', 'BackEnd', 'Docs'] as const).map((label) => ({ label, count: this.categories()[label] })),
  );

  ngOnInit(): void { void this.taskService.loadTasks(); }

  addTask(input: Parameters<TaskService['addTask']>[0]): void { void this.taskService.addTask(input); }
  toggleTask(id: string): void { void this.taskService.toggleTask(id); }
  deleteTask(id: string): void { void this.taskService.deleteTask(id); }
  openTrash(): void { this.isTrashOpen.set(true); void this.taskService.loadTrash(); }
  restoreTask(id: string): void { void this.taskService.restoreTask(id); }
  editTask(id: string): void {
    const task = this.tasks().find((item) => item.id === id);
    if (task) this.editingTask.set(task);
  }
  closeEdit(): void { this.editingTask.set(null); }
  saveEdit(input: UpdateTaskRequestDto): void {
    const task = this.editingTask();
    if (!task) return;
    void this.taskService.updateTask(task.id, input).then((updated) => { if (updated) this.closeEdit(); });
  }
  async logout(): Promise<void> {
    this.isUserMenuOpen.set(false);
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
  updateFilters(next: TaskFilterState): void { this.filters.set(next); }

  setStatus(status: TaskStatus): void { this.updateFilters({ ...this.filters(), status }); }
  setCategory(category: TaskCategory | 'All'): void { this.updateFilters({ ...this.filters(), category }); }
  setSort(sort: TaskSort): void { this.updateFilters({ ...this.filters(), sort }); }
}
