import api from '../../../lib/axios';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types';

export const tasksService = {
  findAll: async (projectId?: string): Promise<Task[]> => {
    const params = projectId ? { projectId } : {};
    const response = await api.get<Task[]>('/tasks', { params });
    return response.data;
  },

  create: async (data: CreateTaskDto): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskDto): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

