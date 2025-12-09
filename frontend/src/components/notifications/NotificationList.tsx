// frontend/src/components/notifications/NotificationList.tsx
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from '../../utils/dateUtils';

export const NotificationList = () => {
    const { notifications, loading, error, markAsRead, markAllAsRead } = useNotifications();

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Notifications
                </h2>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={() => markAllAsRead()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notification List */}
            {notifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${!notification.is_read
                                    ? 'border-l-4 border-blue-600'
                                    : 'border-l-4 border-transparent'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {notification.title}
                                        </h3>
                                        {!notification.is_read && (
                                            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="capitalize">
                                            {notification.notification_type.replace('_', ' ')}
                                        </span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(notification.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
