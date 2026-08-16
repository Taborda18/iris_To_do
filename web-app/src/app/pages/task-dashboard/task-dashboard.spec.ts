import { sortTasks } from './task-dashboard';

const makeTask = (id: string, priority: 'Baja' | 'Media' | 'Urgente', dateLimit: string | null, createdAt: string) => ({
  id,
  title: id,
  category: 'Docs' as const,
  priority,
  completed: false,
  visible: true,
  dateLimit,
  deletedAt: null,
  createdAt,
  updatedAt: createdAt,
});

describe('sortTasks', () => {
  const tasks = [
    makeTask('media-late', 'Media', '2026-08-25', '2026-08-16'),
    makeTask('urgent-late', 'Urgente', '2026-08-25', '2026-08-15'),
    makeTask('urgent-soon', 'Urgente', '2026-08-18', '2026-08-14'),
    makeTask('baja-no-date', 'Baja', null, '2026-08-17'),
  ];

  it('sorts by priority and uses deadline as the secondary criterion', () => {
    expect(sortTasks(tasks, 'Prioridad').map((task) => task.id)).toEqual(['urgent-soon', 'urgent-late', 'media-late', 'baja-no-date']);
  });

  it('sorts by deadline and uses priority as the secondary criterion', () => {
    expect(sortTasks(tasks, 'Fecha límite').map((task) => task.id)).toEqual(['urgent-soon', 'urgent-late', 'media-late', 'baja-no-date']);
  });

  it('sorts by creation date and uses priority as the secondary criterion', () => {
    expect(sortTasks(tasks, 'Fecha de creación').map((task) => task.id)).toEqual(['baja-no-date', 'media-late', 'urgent-late', 'urgent-soon']);
  });
});
