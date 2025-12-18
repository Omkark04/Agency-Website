// frontend/src/components/analytics/RealtimeWidget.tsx
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RealtimeWidgetProps {
  activeUsers: number;
  timestamp?: string;
}

export const RealtimeWidget: React.FC<RealtimeWidgetProps> = ({ activeUsers, timestamp }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 1000);
    return () => clearTimeout(timer);
  }, [activeUsers]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-6 h-6" />
            {pulse && (
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-white rounded-full"
              />
            )}
          </div>
          <h3 className="text-lg font-semibold">Real-time Users</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs opacity-90">LIVE</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <motion.span
          key={activeUsers}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold"
        >
          {activeUsers}
        </motion.span>
        <span className="text-lg opacity-90">
          {activeUsers === 1 ? 'user' : 'users'} active now
        </span>
      </div>
      
      {timestamp && (
        <p className="text-xs opacity-75 mt-4">
          Last updated: {new Date(timestamp).toLocaleTimeString()}
        </p>
      )}
    </motion.div>
  );
};
