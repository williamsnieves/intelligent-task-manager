import { create } from "zustand";
import type { Project, CreateProjectDto } from "../types";
import { projectsService } from "../services/projectsService";

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProjectId: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectsService.findAll();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch projects", isLoading: false });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newProject = await projectsService.create(data);
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create project", isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await projectsService.remove(id);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
        selectedProjectId:
          state.selectedProjectId === id ? null : state.selectedProjectId,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete project", isLoading: false });
    }
  },

  selectProject: (id) => set({ selectedProjectId: id }),
}));
