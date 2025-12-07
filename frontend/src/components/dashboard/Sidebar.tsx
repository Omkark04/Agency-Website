import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiLayers,
  FiCreditCard,
  FiUsers,
  FiCheckSquare,
  FiImage,
  FiBarChart2,
  FiX,
  FiChevronRight
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { 
      title: 'Dashboard', 
      path: '/dashboard', 
      roles: ['admin', 'team_head', 'team_member', 'client'],
      icon: FiHome,
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      title: 'Orders', 
      path: '/dashboard/orders', 
      roles: ['admin', 'team_head', 'client'],
      icon: FiShoppingCart,
      gradient: 'from-orange-500 to-rose-600'
    },
    { 
      title: 'Services', 
      path: '/dashboard/services', 
      roles: ['admin', 'team_head', 'client'],
      icon: FiPackage,
      gradient: 'from-cyan-500 to-blue-600'
    },
    { 
      title: 'Departments', 
      path: '/dashboard/departments', 
      roles: ['admin'],
      icon: FiLayers,
      gradient: 'from-indigo-500 to-purple-600'
    },
    { 
      title: 'Price Cards', 
      path: '/dashboard/price-cards', 
      roles: ['admin'],
      icon: FiCreditCard,
      gradient: 'from-pink-500 to-rose-600'
    },
    { 
      title: 'Users', 
      path: '/dashboard/users', 
      roles: ['admin', 'team_head'],
      icon: FiUsers,
      gradient: 'from-purple-500 to-pink-600'
    },
    { 
      title: 'Tasks', 
      path: '/dashboard/tasks', 
      roles: ['admin', 'team_head', 'team_member'],
      icon: FiCheckSquare,
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      title: 'Media', 
      path: '/dashboard/media', 
      roles: ['admin', 'team_head', 'team_member'],
      icon: FiImage,
      gradient: 'from-violet-500 to-purple-600'
    },
    { 
      title: 'Analytics', 
      path: '/dashboard/analytics', 
      roles: ['admin', 'team_head'],
      icon: FiBarChart2,
      gradient: 'from-teal-500 to-cyan-600'
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Header with Logo */}
        <div className="relative h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">U</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">UdyogWorks</h1>
              <p className="text-xs text-gray-400 font-medium">Professional Suite</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {filteredMenuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-white/15 to-white/5 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full shadow-lg`}></div>
                )}
                
                {/* Icon Container */}
                <div className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  
                  {/* Glow Effect for Active */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-xl blur-lg opacity-50`}></div>
                  )}
                </div>

                {/* Label */}
                <span className={`flex-1 font-semibold text-[15px] transition-all duration-200 ${
                  isActive ? 'translate-x-1' : 'group-hover:translate-x-1'
                }`}>
                  {item.title}
                </span>

                {/* Arrow Indicator */}
                <FiChevronRight className={`w-4 h-4 transition-all duration-200 ${
                  isActive 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`} />

                {/* Hover Background */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info Footer */}
        {user && (
          <div className="relative border-t border-white/10 p-4 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/20">
                  {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                  {user.username || user.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-400 capitalize truncate">
                  {user.role?.replace('_', ' ') || 'Member'}
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-32 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        nav a {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}} />
    </>
  );
};

export default Sidebar;