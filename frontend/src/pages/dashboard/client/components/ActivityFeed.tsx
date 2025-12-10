import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface Activity {
  id: number;
  type: string;
  user: string;
  action: string;
  time: string;
  icon: React.ComponentType<any>;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityColor = (type: string) => {
    const colors: Record<string, { bg: string, text: string }> = {
      'upload': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'message': { bg: 'bg-teal-100', text: 'text-teal-600' },
      'payment': { bg: 'bg-green-100', text: 'text-green-600' },
      'update': { bg: 'bg-purple-100', text: 'text-purple-600' },
      'approval': { bg: 'bg-orange-100', text: 'text-orange-600' },
    };
    return colors[type] || colors['update'];
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <button className="text-sm font-medium text-[#00C2A8] hover:text-[#0086b3] transition-colors duration-200">
            View all
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity, index) => {
          const color = getActivityColor(activity.type);
          return (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full ${color.bg} flex items-center justify-center`}>
                    <activity.icon className={`h-5 w-5 ${color.text}`} />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    <span className="font-bold">{activity.user}</span>{' '}
                    <span className="text-gray-600">{activity.action}</span>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    {index === 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#0066FF]">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
        <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
          <Bell className="h-4 w-4 mr-2" />
          Enable Activity Notifications
        </button>
      </div>
    </div>
  );
}