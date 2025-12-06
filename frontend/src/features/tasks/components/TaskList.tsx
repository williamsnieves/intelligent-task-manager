import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../../projects/store/projectStore';
import { TaskItem } from './TaskItem';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskStatus, TaskPriority } from '../types';

export const TaskList: React.FC = () => {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { selectedProjectId } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | TaskStatus>('ALL');
  const [filterPriority, setFilterPriority] = useState<'ALL' | TaskPriority>('ALL');

  useEffect(() => {
    fetchTasks(selectedProjectId || undefined);
  }, [selectedProjectId, fetchTasks]);

  // Apply filters locally on the already fetched tasks (which might be filtered by project)
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;
    return true;
  });

  const incompleteTasks = filteredTasks.filter((t) => t.status !== TaskStatus.DONE);
  const completedTasks = filteredTasks.filter((t) => t.status === TaskStatus.DONE);

  if (isLoading && tasks.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading tasks...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedProjectId ? 'Project Tasks' : 'All Tasks'}
        </h2>
        
        <div className="flex flex-wrap items-center gap-2">
            {!selectedProjectId && (
             // Only show global filters on "All Tasks" view as requested, 
             // although logic allows it everywhere. User said "solo aplicarian en el listado de todas as tasks"
             // But usually consistent UI is better. I will show them only if !selectedProjectId based on request.
             <>
               <select 
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value as any)}
                 className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
               >
                 <option value="ALL">All Status</option>
                 <option value={TaskStatus.TODO}>To Do</option>
                 <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                 <option value={TaskStatus.DONE}>Done</option>
               </select>

               <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
               >
                 <option value="ALL">All Priority</option>
                 {Object.values(TaskPriority).map((p) => (
                   <option key={p} value={p}>{p}</option>
                 ))}
               </select>
             </>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm ml-2"
            >
              + Add Task
            </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Incomplete Tasks */}
        {(filterStatus === 'ALL' || filterStatus !== TaskStatus.DONE) && (
            <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                To Do / In Progress <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{incompleteTasks.length}</span>
            </h3>
            <div className="space-y-3">
                {incompleteTasks.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No tasks to do matching filters.</p>
                ) : (
                incompleteTasks.map((task) => <TaskItem key={task._id} task={task} />)
                )}
            </div>
            </section>
        )}

        {/* Completed Tasks */}
        {(filterStatus === 'ALL' || filterStatus === TaskStatus.DONE) && completedTasks.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              Completed <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{completedTasks.length}</span>
            </h3>
            <div className="space-y-3">
              {completedTasks.map((task) => <TaskItem key={task._id} task={task} />)}
            </div>
          </section>
        )}

        {filteredTasks.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed mt-4">
              <p className="text-gray-500">No tasks found matching your criteria.</p>
            </div>
        )}
      </div>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

