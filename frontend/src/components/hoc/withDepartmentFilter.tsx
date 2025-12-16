import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * HOC to wrap admin components and add department filtering
 * This component intercepts API calls and adds department filter for Service Heads
 */
export function withDepartmentFilter<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function DepartmentFilteredComponent(props: P) {
    const { user } = useAuth();
    const [departmentId, setDepartmentId] = useState<number | null>(null);

    useEffect(() => {
      if (user?.role === 'service_head') {
        // Get department from user object
        const dept = (user as any).department;
        if (dept) {
          setDepartmentId(typeof dept === 'object' ? dept.id : dept);
        }
      }
    }, [user]);

    // If service head but no department, show error
    if (user?.role === 'service_head' && !departmentId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Department Assigned</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your account doesn't have a department assigned. Please contact the administrator to assign you to a department.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pass department ID as prop to component
    const enhancedProps = {
      ...props,
      departmentId: user?.role === 'service_head' ? departmentId : undefined,
    } as P;

    return <Component {...enhancedProps} />;
  };
}
