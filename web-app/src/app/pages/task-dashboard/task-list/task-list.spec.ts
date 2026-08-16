import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TaskListComponent } from './task-list';

const task = {
  id: 'task-1',
  title: 'Create API',
  category: 'BackEnd' as const,
  priority: 'Urgente' as const,
  completed: false,
  visible: true,
  dateLimit: null,
  deletedAt: null,
  createdAt: '2026-08-15',
  updatedAt: '2026-08-15',
};

describe('TaskListComponent', () => {
  const createComponent = () => {
    TestBed.configureTestingModule({ imports: [TaskListComponent] });
    return TestBed.createComponent(TaskListComponent);
  };

  it('emits task actions from card, keyboard and checkbox', () => {
    const component = createComponent().componentInstance;
    const toggled: string[] = [];
    component.taskToggled.subscribe((id) => toggled.push(id));

    component.toggleFromCard({ target: null } as unknown as MouseEvent, 'task-1');
    component.toggleFromKeyboard({ key: 'Enter', target: null, preventDefault: () => undefined } as unknown as KeyboardEvent, 'task-2');
    component.toggleFromCheckbox('task-3');

    expect(toggled).toEqual(['task-1', 'task-2', 'task-3']);
  });

  it('ignores actions while a task is updating or from nested controls', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('togglingTaskIds', new Set(['task-1']));
    fixture.detectChanges();
    const toggled = vi.fn();
    component.taskToggled.subscribe(toggled);

    component.toggleFromCard({ target: null } as unknown as MouseEvent, 'task-1');
    component.toggleFromCheckbox('task-1');
    component.toggleFromKeyboard({ key: 'Enter', target: null, preventDefault: vi.fn() } as unknown as KeyboardEvent, 'task-1');

    expect(toggled).not.toHaveBeenCalled();
  });

  it('only reacts to Enter and Space from the card itself', () => {
    const component = createComponent().componentInstance;
    const toggled: string[] = [];
    component.taskToggled.subscribe((id) => toggled.push(id));
    const preventDefault = vi.fn();

    component.toggleFromKeyboard({ key: 'Escape', target: null, preventDefault } as unknown as KeyboardEvent, 'task-1');
    component.toggleFromKeyboard({ key: ' ', target: null, preventDefault } as unknown as KeyboardEvent, 'task-2');

    expect(toggled).toEqual(['task-2']);
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it('renders task cards and the empty state', () => {
    TestBed.configureTestingModule({ imports: [TaskListComponent] });
    const fixture = TestBed.createComponent(TaskListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No se encontraron tareas');

    fixture.componentRef.setInput('tasks', [task]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Create API');
    expect(fixture.nativeElement.querySelector('article')).not.toBeNull();
  });
});
