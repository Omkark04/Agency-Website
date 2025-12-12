import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiLayers,
  FiGift,
  FiCreditCard,
  FiUsers,
  FiCheckSquare,
  FiImage,
  FiBriefcase,
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
    { title: 'Dashboard', path: '/dashboard', roles: ['admin','team_head','team_member','client'], icon: FiHome, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Orders', path: '/dashboard/orders', roles: ['admin','team_head','client'], icon: FiShoppingCart, gradient: 'from-orange-500 to-rose-600' },
    { title: 'Services', path: '/dashboard/services', roles: ['admin','team_head','client'], icon: FiPackage, gradient: 'from-cyan-500 to-blue-600' },
    { title: 'Departments', path: '/dashboard/departments', roles: ['admin'], icon: FiLayers, gradient: 'from-indigo-500 to-purple-600' },
    { title: 'Price Cards', path: '/dashboard/price-cards', roles: ['admin'], icon: FiCreditCard, gradient: 'from-pink-500 to-rose-600' },
    { title: 'Tesimonials', path: '/dashboard/testimonials', roles: ['admin'], icon: FiCreditCard, gradient: 'from-pink-500 to-rose-600' },
    { title: 'Offers', path: '/dashboard/offers', roles: ['admin','team_head'], icon: FiGift, gradient: 'from-pink-500 to-rose-600' },
    { title: 'Portfolio', path: '/dashboard/portfolio', roles: ['admin'], icon: FiBriefcase, gradient: 'from-purple-500 to-indigo-600' },
    { title: 'Users', path: '/dashboard/users', roles: ['admin','team_head'], icon: FiUsers, gradient: 'from-purple-500 to-pink-600' },
    { title: 'Tasks', path: '/dashboard/tasks', roles: ['admin','team_head','team_member'], icon: FiCheckSquare, gradient: 'from-green-500 to-emerald-600' },
    { title: 'Media', path: '/dashboard/media', roles: ['admin','team_head','team_member'], icon: FiImage, gradient: 'from-violet-500 to-purple-600' },
    { title: 'Analytics', path: '/dashboard/analytics', roles: ['admin','team_head'], icon: FiBarChart2, gradient: 'from-teal-500 to-cyan-600' },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* ✅ SCROLLABLE SIDEBAR (NO SCROLLBAR VISIBLE) */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 
        transform transition-transform duration-300 ease-out 
        overflow-y-auto overflow-x-hidden hide-scrollbar
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Header */}
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
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1.5">
          {filteredMenuItems.map((item) => {
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
              >
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full`} />
                )}

                <div className={`p-2.5 rounded-xl ${
                  isActive ? `bg-gradient-to-br ${item.gradient}` : 'bg-white/5'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className="flex-1 font-semibold text-[15px]">
                  {item.title}
                </span>

                <FiChevronRight className={`${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              </Link>
            );
          })}
        </nav>

        {/* Footer User */}
        {user && (
          <div className="border-t border-white/10 p-4 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user.username || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role || 'Member'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ HIDE SCROLLBAR COMPLETELY */}
      <style>
        {`
          .hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </>
  );
};

export default Sidebar;
