// frontend/src/components/analytics/DashboardMetrics.tsx
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatCurrency, formatNumber } from '../../utils/dateUtils';

export const DashboardMetrics = () => {
    const { dashboardMetrics, loading, error } = useAnalytics();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error || !dashboardMetrics) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">
                    {error || 'Failed to load dashboard metrics'}
                </p>
            </div>
        );
    }

    const { overview, orders_by_status, revenue_by_department } = dashboardMetrics;

    const metrics = [
        {
            label: 'Total Orders',
            value: formatNumber(overview.total_orders),
            change: `+${overview.recent_orders} this month`,
            color: 'blue',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(overview.total_revenue),
            change: `+${formatCurrency(overview.recent_revenue)} this month`,
            color: 'green',
        },
        {
            label: 'Active Clients',
            value: formatNumber(overview.active_clients),
            change: 'Total active',
            color: 'purple',
        },
        {
            label: 'Recent Orders',
            value: formatNumber(overview.recent_orders),
            change: 'Last 30 days',
            color: 'orange',
        },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4"
                        style={{ borderLeftColor: `var(--color-${metric.color}-500)` }}
                    >
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {metric.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                            {metric.value}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {metric.change}
                        </p>
                    </div>
                ))}
            </div>

            {/* Orders by Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Orders by Status
                </h3>
                <div className="space-y-3">
                    {orders_by_status.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {item.status.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Revenue by Department */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Top Departments by Revenue
                </h3>
                <div className="space-y-4">
                    {revenue_by_department.slice(0, 5).map((dept, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {dept.service__department__title || 'Unknown'}
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(dept.revenue)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                        width: `${(dept.revenue / revenue_by_department[0].revenue) * 100}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
