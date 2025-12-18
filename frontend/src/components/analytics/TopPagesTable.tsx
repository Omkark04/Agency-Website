// frontend/src/components/analytics/TopPagesTable.tsx
import { ExternalLink } from 'lucide-react';

interface TopPagesTableProps {
  data: Array<{
    page_path: string;
    page_title: string;
    page_views: number;
    avg_time: number;
    bounce_rate: number;
  }>;
}

export const TopPagesTable: React.FC<TopPagesTableProps> = ({ data }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Top Pages
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Views
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Avg Time
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Bounce Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((page, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {page.page_title || page.page_path}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {page.page_path}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {page.page_views.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDuration(page.avg_time)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(page.bounce_rate * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No page data available
          </div>
        )}
      </div>
    </div>
  );
};
