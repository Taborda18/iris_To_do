import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TaskService } from './task.service';
import { AlertService } from '../../shared/services/alert.service';

const task = {
  id: 'task-1',
  title: 'Create API',
  category: 'BackEnd' as const,
  priority: 'Urgente' as const,
  completed: false,
  visible: true,
  dateLimit: null,
  deletedAt: null,
  createdAt: '2026-08-15T10:00:00.000Z',
  updatedAt: '2026-08-15T10:00:00.000Z',
};

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;
  const alerts = { success: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    alerts.success.mockReset();
    alerts.error.mockReset();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: AlertService, useValue: alerts }] });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts without tasks', () => {
    expect(service.tasks()).toEqual([]);
  });

  it('only exposes loading while fetching the initial task data', async () => {
    const load = service.loadTasks();
    expect(service.loading()).toBe(true);
    http.expectOne({ method: 'GET', url: 'http://localhost:3000/api/tasks?page=1&limit=100' }).flush({ data: [] });
    await load;
    expect(service.loading()).toBe(false);

    const create = service.addTask({ title: 'Create API', category: 'BackEnd', priority: 'Urgente' });
    expect(service.loading()).toBe(false);
    http.expectOne({ method: 'POST', url: 'http://localhost:3000/api/tasks' }).flush({ data: task });
    await create;
  });

  it('creates, toggles and deletes a task through the API', async () => {
    const create = service.addTask({ title: 'Create API', category: 'BackEnd', priority: 'Urgente' });
    http.expectOne({ method: 'POST', url: 'http://localhost:3000/api/tasks' }).flush({ data: task });
    await create;
    expect(service.tasks()).toEqual([task]);

    const toggle = service.toggleTask(task.id);
    http.expectOne({ method: 'PATCH', url: 'http://localhost:3000/api/tasks/task-1' }).flush({ data: { ...task, completed: true } });
    await toggle;
    expect(service.tasks()[0].completed).toBe(true);

    const remove = service.deleteTask(task.id);
    http.expectOne({ method: 'DELETE', url: 'http://localhost:3000/api/tasks/task-1' }).flush(null, { status: 204, statusText: 'No Content' });
    await remove;
    expect(service.tasks()).toEqual([]);
  });

  it('loads the trash and restores a task', async () => {
    const trashTask = { ...task, visible: false, deletedAt: '2026-08-16T10:00:00.000Z' };
    const loadTrash = service.loadTrash();
    http.expectOne({ method: 'GET', url: 'http://localhost:3000/api/tasks?page=1&limit=100&visible=false' }).flush({ data: [trashTask] });
    await loadTrash;
    expect(service.trash()).toEqual([trashTask]);

    const restore = service.restoreTask(task.id);
    http.expectOne({ method: 'POST', url: 'http://localhost:3000/api/tasks/task-1/restore' }).flush({ data: task });
    await restore;
    expect(service.trash()).toEqual([]);
    expect(service.tasks()).toContainEqual(task);
  });

  it('updates a task and replaces it in local state', async () => {
    const create = service.addTask({ title: task.title, category: task.category, priority: task.priority });
    http.expectOne({ method: 'POST', url: 'http://localhost:3000/api/tasks' }).flush({ data: task });
    await create;

    const update = service.updateTask(task.id, { title: 'Updated API', dateLimit: '2026-08-20' });
    http.expectOne({ method: 'PATCH', url: 'http://localhost:3000/api/tasks/task-1' }).flush({ data: { ...task, title: 'Updated API', dateLimit: '2026-08-20' } });

    await expect(update).resolves.toBe(true);
    expect(service.tasks()[0].title).toBe('Updated API');
    expect(alerts.success).toHaveBeenCalledWith('La tarea fue actualizada correctamente.', 'Tarea actualizada');
  });

  it('keeps the update result false when editing fails', async () => {
    const update = service.updateTask(task.id, { title: 'Updated API' });
    http.expectOne({ method: 'PATCH', url: 'http://localhost:3000/api/tasks/task-1' }).flush({}, { status: 500, statusText: 'Server Error' });

    await expect(update).resolves.toBe(false);
    expect(alerts.error).toHaveBeenCalled();
  });

  it('does not create empty task titles', async () => {
    await service.addTask({ title: '   ', category: 'Docs', priority: 'Baja' });
    expect(service.tasks()).toEqual([]);
  });

  it('prevents toggling an unknown or already toggling task', async () => {
    await service.toggleTask('missing');
    expect(http.match(() => true)).toHaveLength(0);

    const create = service.addTask({ title: 'Create API', category: 'BackEnd', priority: 'Urgente' });
    http.expectOne({ method: 'POST', url: 'http://localhost:3000/api/tasks' }).flush({ data: task });
    await create;

    const first = service.toggleTask(task.id);
    const second = service.toggleTask(task.id);
    expect(service.togglingTaskIds().has(task.id)).toBe(true);
    const requests = http.match({ method: 'PATCH', url: 'http://localhost:3000/api/tasks/task-1' });
    expect(requests).toHaveLength(1);
    requests[0].flush({ data: { ...task, completed: true } });
    await Promise.all([first, second]);
    expect(service.togglingTaskIds().has(task.id)).toBe(false);
  });

  it('maps API errors and clears loading after a failed load', async () => {
    const load = service.loadTasks();
    http.expectOne({ method: 'GET', url: 'http://localhost:3000/api/tasks?page=1&limit=100' }).flush({}, { status: 500, statusText: 'Server Error' });
    await load;
    expect(service.loading()).toBe(false);
    expect(service.error()).toBe('Ocurrió un error interno en el servidor.');
    expect(alerts.error).toHaveBeenCalled();
  });

  it('maps validation, not found, connection and server messages', async () => {
    const cases = [
      { status: 400, message: 'Los datos enviados no son válidos.' },
      { status: 404, message: 'La tarea solicitada no fue encontrada.' },
      { status: 0, message: 'No fue posible conectar con el servidor.' },
    ];
    for (const item of cases) {
      const remove = service.deleteTask('task-1');
      http.expectOne({ method: 'DELETE', url: 'http://localhost:3000/api/tasks/task-1' }).flush({}, { status: item.status, statusText: 'Error' });
      await remove;
      expect(service.error()).toBe(item.message);
    }

    const create = service.addTask({ title: 'Task', category: 'Docs', priority: 'Baja' });
    http.expectOne({ method: 'POST', url: 'http://localhost:3000/api/tasks' }).flush({ message: 'Custom server message' }, { status: 409, statusText: 'Conflict' });
    await create;
    expect(service.error()).toBe('Custom server message');
  });
});
