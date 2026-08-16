import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import type { UpdateTaskRequestDto } from '../../../models/task/task.dto';
import type { Task, TaskCategory, TaskPriority } from '../../../models/task/task.model';

@Component({
  selector: 'app-task-edit-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DatePickerModule, SelectModule],
  templateUrl: './task-edit-dialog.html',
  styleUrl: './task-edit-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskEditDialogComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  readonly open = input(false);
  readonly task = input<Task | null>(null);
  readonly closed = output<void>();
  readonly saved = output<UpdateTaskRequestDto>();
  readonly categories: TaskCategory[] = ['FrontEnd', 'BackEnd', 'Docs'];
  readonly priorities: TaskPriority[] = ['Baja', 'Media', 'Urgente'];
  readonly form = this.formBuilder.group({
    title: this.formBuilder.control('', [Validators.required, Validators.maxLength(200)]),
    category: this.formBuilder.control<TaskCategory>('FrontEnd', Validators.required),
    priority: this.formBuilder.control<TaskPriority>('Media', Validators.required),
    dateLimit: this.formBuilder.control<Date | null>(null),
  });

  private readonly syncForm = effect(() => {
    const task = this.task();
    if (task) {
      this.form.reset({
        title: task.title,
        category: task.category,
        priority: task.priority,
        dateLimit: task.dateLimit ? new Date(`${task.dateLimit}T12:00:00`) : null,
      });
    }
  });

  close(): void { this.closed.emit(); }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const dateLimit = value.dateLimit ? `${value.dateLimit.getFullYear()}-${String(value.dateLimit.getMonth() + 1).padStart(2, '0')}-${String(value.dateLimit.getDate()).padStart(2, '0')}` : null;
    this.saved.emit({ title: value.title.trim(), category: value.category, priority: value.priority, dateLimit });
  }
}
