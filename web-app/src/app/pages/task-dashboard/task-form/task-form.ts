import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, NonNullableFormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CreateTaskInput, TaskCategory, TaskPriority } from '../../../models/task/task.model';

const noWhitespaceValidator = (control: AbstractControl): ValidationErrors | null =>
  control.value.trim().length ? null : { whitespace: true };

export const dateNotPastValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  const selectedDate = new Date(control.value as Date);
  const today = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return selectedDate < today ? { pastDate: true } : null;
};

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, DatePickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  readonly taskCreated = output<CreateTaskInput>();
  readonly categories: TaskCategory[] = ['FrontEnd', 'BackEnd', 'Docs'];
  readonly priorities: TaskPriority[] = ['Baja', 'Media', 'Urgente'];
  readonly today = new Date(new Date().setHours(0, 0, 0, 0));
  readonly form = this.formBuilder.group({
    title: this.formBuilder.control('', [Validators.required, Validators.maxLength(200), noWhitespaceValidator]),
    category: this.formBuilder.control<TaskCategory>('FrontEnd', Validators.required),
    priority: this.formBuilder.control<TaskPriority>('Media', Validators.required),
    dateLimit: this.formBuilder.control<Date | null>(null, dateNotPastValidator),
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const dateLimit = value.dateLimit ? `${value.dateLimit.getFullYear()}-${String(value.dateLimit.getMonth() + 1).padStart(2, '0')}-${String(value.dateLimit.getDate()).padStart(2, '0')}` : null;
    this.taskCreated.emit({ title: value.title.trim(), category: value.category, priority: value.priority, dateLimit });
    this.form.reset({ title: '', category: 'FrontEnd', priority: 'Media', dateLimit: null });
  }
}
