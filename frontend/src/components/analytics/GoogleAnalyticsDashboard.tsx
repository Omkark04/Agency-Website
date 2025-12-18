// frontend/src/components/analytics/GoogleAnalyticsDashboard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Calendar } from 'lucide-react';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { OverviewCards } from './OverviewCards';
import { PageViewsChart } from './PageViewsChart';
import { TrafficSourcesChart } from './TrafficSourcesChart';
import { DeviceBreakdownChart } from './DeviceBreakdownChart';
import { TopPagesTable } from './TopPagesTable';
import { RealtimeWidget } from './RealtimeWidget';

const TIME_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

export const GoogleAnalyticsDashboard: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState(7);
  const { realtime, overview, pages, sources, devices, loading, error, refetch } = useGoogleAnalytics(selectedRange);

  const handleRangeChange = (days: number) => {
    setSelectedRange(days);
    refetch(days);
  };

  const handleRefresh = () => {
    refetch(selectedRange);
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
          Error Loading Analytics
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Google Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time range selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 text-gray-500 ml-2" />
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => handleRangeChange(range.value)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  selectedRange === range.value
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Realtime widget */}
      {realtime && (
        <RealtimeWidget
          activeUsers={realtime.active_users}
          timestamp={realtime.timestamp}
        />
      )}

      {/* Overview cards */}
      <OverviewCards data={overview.overview} />

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageViewsChart data={overview.trend} />
        <TrafficSourcesChart data={sources} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceBreakdownChart data={devices} />
        <TopPagesTable data={pages} />
      </div>
    </div>
  );
};
