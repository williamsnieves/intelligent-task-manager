import React, { useEffect, useState } from "react";
import { useProjectStore } from "../store/projectStore";
import { CreateProjectModal } from "./CreateProjectModal";

export const ProjectList: React.FC = () => {
  const { projects, fetchProjects, selectedProjectId, selectProject } =
    useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
        <span>Projects</span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-blue-600 hover:text-blue-800 text-lg font-bold"
          title="Add Project"
        >
          +
        </button>
      </div>

      <ul className="space-y-1 mt-2">
        <li>
          <button
            onClick={() => selectProject(null)}
            className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
              selectedProjectId === null
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Tasks
          </button>
        </li>
        {projects.map((project) => (
          <li key={project._id}>
            <button
              onClick={() => selectProject(project._id)}
              className={`w-full text-left px-4 py-2 text-sm rounded-md flex items-center space-x-2 transition-colors ${
                selectedProjectId === project._id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="truncate">{project.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
