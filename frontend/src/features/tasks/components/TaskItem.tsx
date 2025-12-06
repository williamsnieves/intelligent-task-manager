import React from 'react';
import { TaskPriority, TaskStatus } from '../types';
import type { Task } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../../projects/store/projectStore';

interface TaskItemProps {
  task: Task;
}

const priorityColors = {
  [TaskPriority.LOW]: 'bg-blue-100 text-blue-800',
  [TaskPriority.MEDIUM]: 'bg-green-100 text-green-800',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800',
};

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
  [TaskStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800',
};

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const { projects } = useProjectStore();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTask(task._id, { status: e.target.value as TaskStatus });
  };

  const project = projects.find((p) => p._id === task.projectId);

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-start justify-between group ${task.status === TaskStatus.DONE ? 'opacity-60' : ''}`}>
      <div className="flex items-start space-x-3 flex-1">
        
        {/* Status Selector instead of Checkbox */}
        <div className="mt-1">
             <select
                value={task.status}
                onChange={handleStatusChange}
                className={`text-xs font-semibold rounded-full border-0 py-1 pl-2 pr-6 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${statusColors[task.status]}`}
             >
                <option value={TaskStatus.TODO}>Todo</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.DONE}>Done</option>
             </select>
        </div>

        <div className="flex-1 min-w-0 ml-2">
          <div className="flex items-center justify-between">
             <h3 className={`text-sm font-medium text-gray-900 ${task.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}`}>
              {task.title}
             </h3>
             {project && (
               <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 ml-2 border border-gray-200 truncate max-w-[150px]">
                 {project.name}
               </span>
             )}
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
          )}
          <div className="flex items-center space-x-2 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-xs text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => deleteTask(task._id)}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete Task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

