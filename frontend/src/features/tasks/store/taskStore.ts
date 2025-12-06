import { create } from 'zustand';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types';
import { tasksService } from '../services/tasksService';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: (projectId?: string) => Promise<void>;
  createTask: (data: CreateTaskDto) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await tasksService.findAll(projectId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch tasks', isLoading: false });
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await tasksService.create(data);
      set((state) => ({ 
        tasks: [...state.tasks, newTask], 
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to create task', isLoading: false });
    }
  },

  updateTask: async (id, data) => {
    try {
      const updatedTask = await tasksService.update(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? updatedTask : t)),
      }));
    } catch (error) {
      set({ error: 'Failed to update task' });
    }
  },

  deleteTask: async (id) => {
    try {
      await tasksService.remove(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete task' });
    }
  },
}));

