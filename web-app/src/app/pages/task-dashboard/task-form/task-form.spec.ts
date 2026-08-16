import { TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form';

describe('TaskFormComponent', () => {
  const createComponent = () => {
    TestBed.configureTestingModule({ imports: [TaskFormComponent] });
    return TestBed.createComponent(TaskFormComponent);
  };

  it('renders invalid initially and rejects whitespace-only titles', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.form.controls.title.setValue('   ');
    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.title.hasError('whitespace')).toBe(true);
  });

  it('emits a trimmed task and resets the form', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.taskCreated.subscribe((value) => emitted.push(value));
    component.form.setValue({ title: '  Build API  ', category: 'BackEnd', priority: 'Urgente', dateLimit: null });

    component.submit();

    expect(emitted).toEqual([{ title: 'Build API', category: 'BackEnd', priority: 'Urgente', dateLimit: null }]);
    expect(component.form.getRawValue()).toEqual({ title: '', category: 'FrontEnd', priority: 'Media', dateLimit: null });
  });
});
