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
  FiMessageSquare,
  FiBarChart2,
  FiX,
  FiChevronRight,
  FiFileText,
  FiDollarSign,
  FiEdit
} from 'react-icons/fi';
import { UserAvatar } from '../ui/UserAvatar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', roles: ['admin'], icon: FiHome, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Dashboard', path: '/dashboard/service-head', roles: ['service_head'], icon: FiHome, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Orders', path: '/dashboard/orders', roles: ['admin'], icon: FiShoppingCart, gradient: 'from-orange-500 to-rose-600' },
    { title: 'Orders', path: '/dashboard/service-head/orders', roles: ['service_head'], icon: FiShoppingCart, gradient: 'from-orange-500 to-rose-600' },
    { title: 'Services', path: '/dashboard/services', roles: ['admin'], icon: FiPackage, gradient: 'from-cyan-500 to-blue-600' },
    { title: 'Services', path: '/dashboard/service-head/services', roles: ['service_head'], icon: FiPackage, gradient: 'from-cyan-500 to-blue-600' },
    { title: 'Departments', path: '/dashboard/departments', roles: ['admin'], icon: FiLayers, gradient: 'from-indigo-500 to-purple-600' },
    { title: 'Price Cards', path: '/dashboard/price-cards', roles: ['admin'], icon: FiCreditCard, gradient: 'from-pink-500 to-rose-600' },
    { title: 'Price Cards', path: '/dashboard/service-head/price-cards', roles: ['service_head'], icon: FiCreditCard, gradient: 'from-pink-500 to-rose-600' },
    { title: 'Testimonials', path: '/dashboard/testimonials', roles: ['admin'], icon: FiMessageSquare, gradient: 'from-purple-500 to-pink-600' },
    { title: 'Testimonials', path: '/dashboard/service-head/testimonials', roles: ['service_head'], icon: FiMessageSquare, gradient: 'from-purple-500 to-pink-600' },
    { title: 'Inquiries', path: '/dashboard/contacts', roles: ['admin'], icon: FiUsers, gradient: 'from-green-500 to-teal-600' },
    { title: 'Form Builder', path: '/dashboard/forms/new', roles: ['admin'], icon: FiCheckSquare, gradient: 'from-indigo-500 to-blue-600' },
    { title: 'Special Orders', path: '/dashboard/special-orders', roles: ['admin'], icon: FiGift, gradient: 'from-pink-500 to-rose-600' },
    { title: 'Form Builder', path: '/dashboard/service-head/forms', roles: ['service_head'], icon: FiCheckSquare, gradient: 'from-indigo-500 to-blue-600' },
    { title: 'Offers', path: '/dashboard/offers', roles: ['admin'], icon: FiGift, gradient: 'from-pink-500 to-rose-600' },
    { title: 'Portfolio', path: '/dashboard/portfolio', roles: ['admin'], icon: FiBriefcase, gradient: 'from-purple-500 to-indigo-600' },
    { title: 'Portfolio', path: '/dashboard/service-head/portfolio', roles: ['service_head'], icon: FiBriefcase, gradient: 'from-purple-500 to-indigo-600' },
    { title: 'Estimations', path: '/dashboard/estimations', roles: ['admin', 'service_head'], icon: FiFileText, gradient: 'from-blue-500 to-purple-600' },
    { title: 'Invoices', path: '/dashboard/invoices', roles: ['admin', 'service_head'], icon: FiDollarSign, gradient: 'from-green-500 to-emerald-600' },
    { title: 'Blogs', path: '/dashboard/blogs', roles: ['admin'], icon: FiEdit, gradient: 'from-amber-500 to-orange-600' },
    { title: 'Blogs', path: '/dashboard/service-head/blogs', roles: ['service_head'], icon: FiEdit, gradient: 'from-amber-500 to-orange-600' },
    { title: 'Users', path: '/dashboard/users', roles: ['admin'], icon: FiUsers, gradient: 'from-purple-500 to-pink-600' },
    { title: 'Team Members', path: '/dashboard/service-head/team-members', roles: ['service_head'], icon: FiUsers, gradient: 'from-purple-500 to-pink-600' },
    { title: 'Tasks', path: '/dashboard/tasks', roles: ['admin','team_member'], icon: FiCheckSquare, gradient: 'from-green-500 to-emerald-600' },
    { title: 'Tasks', path: '/dashboard/service-head/tasks', roles: ['service_head'], icon: FiCheckSquare, gradient: 'from-green-500 to-emerald-600' },
    { title: 'Media', path: '/dashboard/media', roles: ['admin','team_member'], icon: FiImage, gradient: 'from-violet-500 to-purple-600' },
    { title: 'Analytics', path: '/dashboard/analytics', roles: ['admin'], icon: FiBarChart2, gradient: 'from-teal-500 to-cyan-600' },
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
              <UserAvatar user={user} size="lg" className="rounded-xl" />
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
