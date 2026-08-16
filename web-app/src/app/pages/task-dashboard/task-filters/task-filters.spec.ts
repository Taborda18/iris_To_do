import { TestBed } from '@angular/core/testing';
import { TaskFiltersComponent } from './task-filters';

describe('TaskFiltersComponent', () => {
  it('emits the complete filter state', () => {
    TestBed.configureTestingModule({ imports: [TaskFiltersComponent] });
    const component = TestBed.createComponent(TaskFiltersComponent).componentInstance;
    const emitted: unknown[] = [];
    component.filtersChanged.subscribe((value) => emitted.push(value));

    component.category.set('Docs');
    component.status.set('Completadas');
    component.search.set('api');
    component.sort.set('Prioridad');
    component.emit();

    expect(emitted).toEqual([{ category: 'Docs', status: 'Completadas', search: 'api', sort: 'Prioridad' }]);
  });

  it('exposes the expected filter and sort options', () => {
    TestBed.configureTestingModule({ imports: [TaskFiltersComponent] });
    const component = TestBed.createComponent(TaskFiltersComponent).componentInstance;

    expect(component.statuses).toEqual(['Todos', 'Pendientes', 'Completadas']);
    expect(component.categories).toEqual(['All', 'FrontEnd', 'BackEnd', 'Docs']);
    expect(component.sortOptions).toEqual(['Fecha de creación', 'Fecha límite', 'Prioridad']);
  });
});
