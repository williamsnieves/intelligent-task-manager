import React, { useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { useProjectStore } from "../../projects/store/projectStore";
import { TaskPriority, TaskStatus } from "../types";
import { AiSuggestButton } from "../../ai/components/AiSuggestButton";
import { AiSuggestions } from "../../ai/components/AiSuggestions";
import type { AiAnalysisResponse } from "../../ai/types/ai.types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createTask = useTaskStore((state) => state.createTask);
  const { projects, selectedProjectId } = useProjectStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState(selectedProjectId || "");
  
  // AI Suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<AiAnalysisResponse | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

  const handleAiSuggestion = (suggestion: AiAnalysisResponse) => {
    setAiSuggestions(suggestion);
    setPriority(suggestion.priority);
    if (suggestion.dueDate) {
      setDueDate(suggestion.dueDate);
    }
  };

  const handleSelectTitle = (newTitle: string) => {
    setSelectedTitle(newTitle);
    setTitle(newTitle);
  };

  const handleSelectDescription = (newDescription: string) => {
    setSelectedDescription(newDescription);
    setDescription(newDescription);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      projectId: projectId || undefined,
      status: TaskStatus.TODO,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority(TaskPriority.MEDIUM);
    setDueDate("");
    setProjectId(selectedProjectId || "");
    setAiSuggestions(null);
    setSelectedTitle(null);
    setSelectedDescription(null);

    onClose();
  };

  // Update local projectId when selectedProjectId changes (if modal is closed or just opened)
  React.useEffect(() => {
    if (isOpen && selectedProjectId) {
      setProjectId(selectedProjectId);
    }
  }, [isOpen, selectedProjectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">New Task</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add details..."
            />
          </div>

          {/* AI Suggestion Button */}
          <div className="border-t border-gray-200 pt-4">
            <AiSuggestButton
              description={description}
              currentTitle={title}
              onSuggestion={handleAiSuggestion}
              disabled={!description.trim()}
            />
          </div>

          {/* AI Suggestions Display */}
          {aiSuggestions && (
            <AiSuggestions
              titleSuggestions={aiSuggestions.titleSuggestions || []}
              descriptionSuggestions={aiSuggestions.descriptionSuggestions || []}
              selectedTitle={selectedTitle}
              selectedDescription={selectedDescription}
              onSelectTitle={handleSelectTitle}
              onSelectDescription={handleSelectDescription}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(TaskPriority).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          </form>
        </div>
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
