import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle, Clock, Info, Bell } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AnnouncementsProps {
  announcements: Announcement[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 mr-3">
              <Bell className="h-6 w-6 text-[#0066FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
              <p className="text-sm text-gray-500">Important updates and notifications</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00C2A8] text-white">
              {announcements.length} new
            </span>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {announcements.map((announcement, index) => (
          <motion.div 
            key={announcement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`px-6 py-4 ${getTypeColor(announcement.type)} hover:opacity-90 transition-opacity duration-200`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getTypeIcon(announcement.type)}
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-bold text-gray-900">{announcement.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{announcement.description}</p>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>Posted 2 days ago</span>
                  <span className="mx-2">•</span>
                  <span>Priority: Medium</span>
                </div>
              </div>
              <button className="ml-auto text-xs font-medium text-[#00C2A8] hover:text-[#0086b3] transition-colors duration-200">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {announcements.length} of 8 announcements
          </div>
          <button className="text-sm font-bold text-[#00C2A8] hover:text-[#0086b3] flex items-center transition-colors duration-200">
            View all announcements
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}