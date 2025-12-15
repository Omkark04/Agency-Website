// Empty state component for Service Heads without department assignment
import { FiAlertCircle } from 'react-icons/fi';

interface NoDepartmentMessageProps {
  className?: string;
}

export function NoDepartmentMessage({ className = '' }: NoDepartmentMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 ${className}`}>
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 max-w-md text-center">
        <FiAlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Department Assigned
        </h3>
        <p className="text-gray-600 mb-4">
          You are not assigned as team head of any department. Please contact the administrator to assign you to a department.
        </p>
        <div className="bg-white border border-yellow-200 rounded p-4 text-sm text-left">
          <p className="font-medium text-gray-700 mb-2">Administrator Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            <li>Go to Admin Dashboard</li>
            <li>Navigate to Departments</li>
            <li>Select a department</li>
            <li>Assign this user as Team Head</li>
            <li>Save changes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
