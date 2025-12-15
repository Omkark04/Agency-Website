// frontend/src/components/tasks/TaskCard.tsx
import React from 'react';
import type { Task } from '../../types/task';
import { Calendar, User, Paperclip, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onStatusChange?: (taskId: number, newStatus: 'pending' | 'in_progress' | 'done') => void;
  canEdit?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onStatusChange, canEdit = false }) => {
  const getPriorityColor = (priority: number) => {
    const colors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || colors[3];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex-1 pr-2">{task.title}</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Priority Badge */}
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
          Priority {task.priority}
        </span>

        {/* Status Badge */}
        {canEdit ? (
          <select
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              if (onStatusChange) {
                onStatusChange(task.id, e.target.value as any);
              }
            }}
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getStatusColor(task.status)}`}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        ) : (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status_label || task.status}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Assignee */}
          {task.assignee_name && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{task.assignee_name}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center">
              <Paperclip className="w-4 h-4 mr-1" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{format(new Date(task.due_date), 'MMM dd')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
