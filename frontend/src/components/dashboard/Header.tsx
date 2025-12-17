import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiSearch, 
  FiBell, 
  FiChevronDown, 
  FiMenu, 
  FiLogOut,
  FiUser,
  FiSettings
} from 'react-icons/fi';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="relative bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Menu & Title */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-md active:scale-95"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {title && (
              <h1 className="hidden lg:block text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {title}
              </h1>
            )}
          </div>

          {/* Center Section - Search bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <FiSearch className="w-4 h-4 text-white" />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <kbd className="hidden lg:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search button for mobile */}
            <button className="md:hidden p-2.5 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all">
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all group"
              >
                <FiBell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-red-500 to-rose-600 ring-2 ring-white"></span>
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in z-50">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                    <p className="text-sm text-gray-600 mt-1">You have 3 unread messages</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border-b border-gray-100 cursor-pointer group">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <FiBell className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm mb-1">New order received</p>
                            <p className="text-xs text-gray-600 line-clamp-2">Order #12345 has been placed by customer</p>
                            <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <button className="w-full py-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg ring-2 ring-white group-hover:scale-110 transition-transform">
                    {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-bold text-gray-900">
                    {user?.username || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ') || 'Member'}
                  </div>
                </div>
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in z-50">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">
                          {user?.username || user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-xs text-gray-600 truncate">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link 
                      to={
                        user?.role === 'admin' ? '/dashboard/profile' :
                        user?.role === 'client' ? '/client-dashboard/profile' :
                        user?.role === 'service_head' ? '/dashboard/service-head/profile' :
                        user?.role === 'team_member' ? '/team-member-dashboard/profile' :
                        '/dashboard/profile'
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all text-left group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                        <FiUser className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">My Profile</div>
                        <div className="text-xs text-gray-500">View and edit profile</div>
                      </div>
                    </Link>
                    
                    <Link 
                      to={
                        user?.role === 'admin' ? '/dashboard/settings' :
                        user?.role === 'client' ? '/client-dashboard/settings' :
                        user?.role === 'service_head' ? '/dashboard/service-head/settings' :
                        user?.role === 'team_member' ? '/team-member-dashboard/settings' :
                        '/dashboard/settings'
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all text-left group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                        <FiSettings className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Settings</div>
                        <div className="text-xs text-gray-500">Manage preferences</div>
                      </div>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all text-left group"
                    >
                      <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                        <FiLogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-red-600">Logout</div>
                        <div className="text-xs text-red-500">Sign out of your account</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Logout for Desktop */}
            <button
              onClick={logout}
              className="hidden xl:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}} />
    </header>
  );
};

export default Header;