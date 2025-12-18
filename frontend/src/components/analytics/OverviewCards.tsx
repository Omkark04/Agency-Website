// frontend/src/components/analytics/OverviewCards.tsx
import { motion } from 'framer-motion';
import { Users, Activity, Clock, TrendingDown } from 'lucide-react';

interface OverviewCardsProps {
  data: {
    total_users: number;
    sessions: number;
    avg_session_duration: number;
    bounce_rate: number;
    page_views: number;
  };
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const cards = [
    {
      title: 'Total Users',
      value: data.total_users.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Sessions',
      value: data.sessions.toLocaleString(),
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Avg Session Duration',
      value: formatDuration(data.avg_session_duration),
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Bounce Rate',
      value: `${(data.bounce_rate * 100).toFixed(1)}%`,
      icon: TrendingDown,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${card.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
