import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Task } from '../../../models/task/task.model';

@Component({
  selector: 'app-task-trash-dialog',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-trash-dialog.html',
  styleUrl: './task-trash-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTrashDialogComponent {
  readonly open = input(false);
  readonly tasks = input<readonly Task[]>([]);
  readonly closed = output<void>();
  readonly restored = output<string>();

  close(): void { this.closed.emit(); }
  restore(id: string): void { this.restored.emit(id); }
}
