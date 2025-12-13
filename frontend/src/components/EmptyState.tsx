import { FileQuestion, Inbox, Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'inbox' | 'search' | 'file' | 'alert';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ 
  icon = 'inbox', 
  title, 
  description, 
  action,
  className = '' 
}: EmptyStateProps) {
  const icons = {
    inbox: Inbox,
    search: Search,
    file: FileQuestion,
    alert: AlertCircle
  };

  const Icon = icons[icon];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
