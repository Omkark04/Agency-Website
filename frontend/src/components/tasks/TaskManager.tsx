// frontend/src/components/tasks/TaskManager.tsx
import React, { useState, useEffect } from 'react';
import { getOrderTasks, updateTask } from '../../api/tasks';
import { Task } from '../../api/tasks';
import TaskCard from './TaskCard';
import { Plus, Filter, Loader2 } from 'lucide-react';

interface TaskManagerProps {
  orderId: number;
  onCreateTask?: () => void;
  canEdit?: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({ orderId, onCreateTask, canEdit = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'done'>('all');

  useEffect(() => {
    fetchTasks();
  }, [orderId, filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getOrderTasks(orderId, filter === 'all' ? undefined : filter);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: 'pending' | 'in_progress' | 'done') => {
    try {
      await updateTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getFilterCount = (status: string) => {
    if (status === 'all') return tasks.length;
    return tasks.filter(t => t.status === status).length;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        {canEdit && onCreateTask && (
          <button
            onClick={onCreateTask}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
        {(['all', 'pending', 'in_progress', 'done'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
            <span className="ml-2 text-sm opacity-75">({getFilterCount(status)})</span>
          </button>
        ))}
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No tasks found</p>
          {canEdit && onCreateTask && (
            <button
              onClick={onCreateTask}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManager;
