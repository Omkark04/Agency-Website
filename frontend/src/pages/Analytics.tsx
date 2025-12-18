import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';
import { GoogleAnalyticsDashboard } from '../components/analytics/GoogleAnalyticsDashboard';
import { BarChart3, TrendingUp } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'google-analytics', label: 'Google Analytics', icon: TrendingUp },
];

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { dashboardMetrics, loading, error } = useAnalytics();

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            data={dashboardMetrics}
            loading={loading}
            error={error}
          />
        )}
        
        {activeTab === 'google-analytics' && (
          <GoogleAnalyticsDashboard />
        )}
      </motion.div>
    </div>
  );
};

// Overview Tab Component
interface OverviewTabProps {
  data: any;
  loading: boolean;
  error: string | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No analytics data available
      </div>
    );
  }

  const { overview } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Business Overview
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Key metrics and performance indicators
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {overview.total_orders}
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">Total Orders</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {overview.recent_orders} in last 30 days
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${overview.total_revenue.toLocaleString()}
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">Total Revenue</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            ${overview.recent_revenue.toLocaleString()} in last 30 days
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {overview.active_clients}
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">Active Clients</div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {data.orders_by_status?.length || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">Order Statuses</div>
        </div>
      </div>

      {/* Additional info */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Quick Stats
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          For detailed website analytics, visit the <strong>Google Analytics</strong> tab above.
        </div>
      </div>
    </div>
  );
};

export default Analytics;
