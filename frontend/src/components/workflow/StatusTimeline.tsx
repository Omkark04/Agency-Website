// frontend/src/components/workflow/StatusTimeline.tsx
import React from 'react';
import type { WorkflowInfo, OrderStatus } from '../../types/workflow';
import { CheckCircle, Circle, Lock } from 'lucide-react';

interface StatusTimelineProps {
  workflowInfo: WorkflowInfo;
  onStatusClick?: (status: string) => void;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({ workflowInfo, onStatusClick }) => {
  const allStatuses = [
    { value: 'pending', label: 'Pending', step: 1 },
    { value: 'approved', label: 'Approved', step: 2 },
    { value: 'estimation_sent', label: 'Estimation Sent', step: 3 },
    { value: 'in_progress', label: 'In Progress', step: 4 },
    { value: '25_done', label: '25% Done', step: 5 },
    { value: '50_done', label: '50% Done', step: 6 },
    { value: '75_done', label: '75% Done', step: 7 },
    { value: 'ready_for_delivery', label: 'Ready for Delivery', step: 8 },
    { value: 'delivered', label: 'Delivered', step: 9 },
    { value: 'payment_pending', label: 'Payment Pending', step: 10 },
    { value: 'payment_done', label: 'Payment Done', step: 11 },
    { value: 'closed', label: 'Closed', step: 12 },
  ];

  const currentStatusIndex = allStatuses.findIndex(s => s.value === workflowInfo.current_status);
  const allowedNextStatuses = workflowInfo.allowed_next_statuses.map(s => s.value);

  const getStatusState = (statusValue: string, index: number) => {
    if (statusValue === workflowInfo.current_status) {
      return 'current';
    } else if (index < currentStatusIndex) {
      return 'completed';
    } else if (allowedNextStatuses.includes(statusValue as OrderStatus)) {
      return 'available';
    } else {
      return 'locked';
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'current':
        return 'bg-blue-500 text-white border-blue-500 ring-4 ring-blue-100';
      case 'available':
        return 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 cursor-pointer';
      case 'locked':
      default:
        return 'bg-gray-100 text-gray-400 border-gray-300';
    }
  };

  const getLineColor = (index: number) => {
    if (index < currentStatusIndex) {
      return 'bg-green-500';
    } else {
      return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-blue-600">{workflowInfo.progress_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${workflowInfo.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {allStatuses.map((status, index) => {
          const state = getStatusState(status.value, index);
          const isClickable = state === 'available' && onStatusClick;

          return (
            <div key={status.value} className="relative">
              {/* Connecting Line */}
              {index < allStatuses.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 -ml-px">
                  <div className={`w-full h-full ${getLineColor(index)}`} />
                </div>
              )}

              {/* Status Node */}
              <div className="flex items-start">
                <button
                  onClick={() => isClickable && onStatusClick(status.value)}
                  disabled={!isClickable}
                  className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStatusColor(state)}`}
                >
                  {state === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : state === 'current' ? (
                    <Circle className="w-6 h-6 fill-current" />
                  ) : state === 'locked' ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>

                <div className="ml-4 flex-1">
                  <h4 className={`font-medium ${state === 'current' ? 'text-blue-600' : state === 'completed' ? 'text-green-600' : 'text-gray-900'}`}>
                    {status.label}
                  </h4>
                  {state === 'current' && (
                    <p className="text-sm text-gray-600 mt-1">Current Status</p>
                  )}
                  {state === 'available' && (
                    <p className="text-sm text-blue-600 mt-1">Click to update</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-300 mr-2" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-100 mr-2" />
            <span className="text-gray-600">Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
