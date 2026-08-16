import { mapTaskDto } from './task.mapper';

describe('mapTaskDto', () => {
  it('maps the API task DTO to the view model', () => {
    const dto = {
      id: 'task-1',
      title: 'Create API',
      category: 'BackEnd' as const,
      priority: 'Urgente' as const,
      completed: false,
      visible: true,
      dateLimit: null,
      deletedAt: null,
      createdAt: '2026-08-15',
      updatedAt: '2026-08-16',
    };

    expect(mapTaskDto(dto)).toEqual(dto);
  });
});
