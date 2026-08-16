import type { Task } from '../domain/task.js';

const colombiaDate = (value: Date): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);

  const result = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${result.year}-${result.month}-${result.day}`;
};

export const presentTask = (task: Task) => ({
  ...task,
  dateLimit: task.dateLimit ? colombiaDate(task.dateLimit) : null,
  deletedAt: task.deletedAt ? task.deletedAt.toISOString() : null,
  createdAt: colombiaDate(task.createdAt),
  updatedAt: colombiaDate(task.updatedAt),
});
