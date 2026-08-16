import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TaskEditDialogComponent } from './task-edit-dialog';

const task = {
  id: 'task-1',
  title: 'Create API',
  category: 'BackEnd' as const,
  priority: 'Media' as const,
  completed: false,
  visible: true,
  dateLimit: '2026-08-19',
  deletedAt: null,
  createdAt: '2026-08-15',
  updatedAt: '2026-08-15',
};

describe('TaskEditDialogComponent', () => {
  const createComponent = () => {
    TestBed.configureTestingModule({ imports: [TaskEditDialogComponent] });
    return TestBed.createComponent(TaskEditDialogComponent);
  };

  it('loads task data and emits edited values', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const saved: unknown[] = [];
    component.saved.subscribe((value) => saved.push(value));
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      title: 'Create API',
      category: 'BackEnd',
      priority: 'Media',
      dateLimit: new Date('2026-08-19T12:00:00'),
    });

    component.form.patchValue({ title: '  Updated API  ', priority: 'Urgente', dateLimit: new Date('2026-08-20T12:00:00') });
    component.submit();

    expect(saved).toEqual([{ title: 'Updated API', category: 'BackEnd', priority: 'Urgente', dateLimit: '2026-08-20' }]);
  });

  it('does not save an invalid title and can be cancelled', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const saved = vi.fn();
    const closed = vi.fn();
    component.saved.subscribe(saved);
    component.closed.subscribe(closed);
    component.form.controls.title.setValue('');

    component.submit();
    component.close();

    expect(saved).not.toHaveBeenCalled();
    expect(component.form.controls.title.hasError('required')).toBe(true);
    expect(closed).toHaveBeenCalledOnce();
  });

  it('renders the edit modal with the selected task', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Actualizar tarea');
    expect((fixture.nativeElement.querySelector('#edit-task-name') as HTMLInputElement).value).toBe('Create API');
    expect(fixture.nativeElement.textContent).toContain('Fecha límite');
  });
});
