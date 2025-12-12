import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  Folder, 
  Settings, 
  Bell, 
  MessageSquare, 
  Download, 
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  Menu,
  X,
  ChevronRight,
  Box,
  TrendingUp,
  TrendingDown,
  User,
  LogOut,
  HelpCircle,
  FileText,
  PieChart,
  ChevronDown,
  MoreVertical,
  Sparkles,
  Target,
  Activity
} from 'lucide-react';

// Enhanced mock data
const stats = [
  { 
    id: 1, 
    name: 'Active Projects', 
    value: '12', 
    icon: Folder, 
    change: '+2', 
    changeType: 'increase',
    description: 'Ongoing work',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100'
  },
  { 
    id: 2, 
    name: 'Pending Tasks', 
    value: '8', 
    icon: Clock, 
    change: '-3', 
    changeType: 'decrease',
    description: 'Require attention',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100'
  },
  { 
    id: 3, 
    name: 'Payments Due', 
    value: '$2,450', 
    icon: CreditCard, 
    change: '+$450', 
    changeType: 'increase',
    description: 'Overdue payments',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100'
  },
  { 
    id: 4, 
    name: 'Completed', 
    value: '24', 
    icon: CheckCircle, 
    change: '+5', 
    changeType: 'increase',
    description: 'This month',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100'
  },
];

const recentActivity = [
  { id: 1, action: 'Project approved', project: 'Website Redesign', time: '10 min ago', status: 'completed' },
  { id: 2, action: 'Feedback requested', project: 'Mobile App', time: '1 hour ago', status: 'pending' },
  { id: 3, action: 'Payment received', project: 'Brand Identity', time: '2 hours ago', status: 'completed' },
  { id: 4, action: 'New task assigned', project: 'SEO Optimization', time: '1 day ago', status: 'in-progress' },
];

export default function ClientDashboard() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPageTitle = () => {
    if (location.pathname === '/client-dashboard') return 'Dashboard Overview';
    if (location.pathname.includes('services')) return 'My Services';
    if (location.pathname.includes('my-projects')) return 'My Projects';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header - Fixed Position */}
      <header 
        className={`fixed top-0 right-0 z-50 transition-all duration-300 ${
          sidebarOpen ? 'left-64' : 'left-20'
        } ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100' 
            : 'bg-white/90 backdrop-blur-lg'
        }`}
        style={{
          transitionProperty: 'left, background-color, box-shadow, border',
          transitionDuration: '300ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? (
                <X size={20} className="text-gray-600" />
              ) : (
                <Menu size={20} className="text-gray-600" />
              )}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
                <p className="text-xs text-gray-500 mt-0.5">Welcome back, Alex</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects, messages..."
                className="pl-10 pr-4 py-2.5 w-64 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Notification */}
            <button 
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Messages */}
            <button 
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                aria-expanded={showProfileMenu}
                aria-label="User menu"
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <User className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                  <p className="text-xs text-gray-500">Premium Client</p>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-400 hidden md:block transition-transform duration-200 ${
                    showProfileMenu ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {showProfileMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Alex Johnson</p>
                    <p className="text-xs text-gray-500 truncate">alex.johnson@example.com</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      role="menuitem"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      role="menuitem"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      role="menuitem"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Help & Support
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {}}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-100 flex flex-col`}
      >
        {/* Logo */}
        <div className={`flex items-center ${sidebarOpen ? 'px-6' : 'justify-center px-0'} h-16 border-b border-gray-100`}>
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AgencyPro</h1>
                <p className="text-xs text-gray-500">Client Portal</p>
              </div>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">A</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1">
            {[
              { 
                path: '/client-dashboard', 
                icon: Home, 
                label: 'Dashboard', 
                active: location.pathname === '/client-dashboard',
                badge: null
              },
              { 
                path: '/client-dashboard/my-projects', 
                icon: Folder, 
                label: 'Projects', 
                active: location.pathname.includes('my-projects'),
                badge: 3
              },
              { 
                path: '/client-dashboard/services', 
                icon: Box, 
                label: 'Services', 
                active: location.pathname.includes('services'),
                badge: null
              },
              { 
                path: '/client-dashboard/messages', 
                icon: MessageSquare, 
                label: 'Messages', 
                active: location.pathname.includes('messages'),
                badge: 3 
              },
              { 
                path: '/client-dashboard/documents', 
                icon: FileText, 
                label: 'Documents',
                active: location.pathname.includes('documents'),
                badge: null
              },
              { 
                path: '/client-dashboard/analytics', 
                icon: PieChart, 
                label: 'Analytics',
                active: location.pathname.includes('analytics'),
                badge: null
              },
              { 
                path: '/client-dashboard/downloads', 
                icon: Download, 
                label: 'Downloads',
                active: location.pathname.includes('downloads'),
                badge: null
              },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center px-3'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  item.active
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <div className="relative">
                  <item.icon 
                    className={`h-5 w-5 ${item.active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} 
                  />
                  {item.badge && (
                    <span className={`absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full text-xs font-medium ${
                      item.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <span className="ml-3">{item.label}</span>
                    {item.active && (
                      <ChevronRight className="ml-auto h-4 w-4 text-blue-500" />
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>

          {/* Settings Section */}
          <div className={`mt-8 ${!sidebarOpen && 'border-t border-gray-100 pt-6'}`}>
            {sidebarOpen && (
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Preferences
              </p>
            )}
            <Link
              to="/client-dashboard/settings"
              className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center px-3'} py-3 rounded-xl text-sm font-medium transition-colors group ${
                location.pathname.includes('settings')
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={!sidebarOpen ? 'Settings' : ''}
            >
              <Settings className={`h-5 w-5 ${location.pathname.includes('settings') ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
              {sidebarOpen && <span className="ml-3">Settings</span>}
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-100 p-4">
          <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Alex Johnson</p>
                <div className="flex items-center mt-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">85%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 pt-16 min-h-screen ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <div className="p-6">
          {/* Dashboard Content */}
          {location.pathname === '/client-dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                          <div className="flex items-baseline mb-2">
                            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                            <span className={`flex items-center text-sm font-medium ml-2 ${
                              stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stat.changeType === 'increase' ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              {stat.change}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{stat.description}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm`}>
                          <div className={`bg-gradient-to-br ${stat.color} p-2 rounded-lg`}>
                            <stat.icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"></div>
                  </div>
                ))}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                      <p className="text-sm text-gray-500 mt-1">Latest updates from your projects</p>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      View All →
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-200 group"
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 ${
                          activity.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                          activity.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-blue-500/10 text-blue-600'
                        }`}>
                          {activity.status === 'completed' && <CheckCircle className="h-5 w-5" />}
                          {activity.status === 'pending' && <Clock className="h-5 w-5" />}
                          {activity.status === 'in-progress' && <Activity className="h-5 w-5" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 truncate">{activity.action}</p>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ml-2 flex-shrink-0 ${
                              activity.status === 'completed' ? 'bg-emerald-500/10 text-emerald-700' :
                              activity.status === 'pending' ? 'bg-amber-500/10 text-amber-700' :
                              'bg-blue-500/10 text-blue-700'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{activity.project}</p>
                        </div>
                        
                        <div className="ml-4 text-right flex-shrink-0">
                          <p className="text-sm text-gray-500 whitespace-nowrap">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">Performance Summary</h2>
                    <p className="text-sm text-blue-100 mt-1">Overall metrics this month</p>
                  </div>
                  
                  <div className="space-y-5">
                    {[
                      { label: 'Project Completion', value: 78, color: 'from-white to-blue-100' },
                      { label: 'On-time Delivery', value: 92, color: 'from-white to-blue-100' },
                      { label: 'Client Satisfaction', value: 96, color: 'from-white to-blue-100' },
                    ].map((metric, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-blue-100">{metric.label}</span>
                          <span className="font-semibold">{metric.value}%</span>
                        </div>
                        <div className="h-2 bg-blue-400/30 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${metric.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-8 w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors text-sm">
                    View Detailed Report
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Dynamic Content Area */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Smooth scrolling */
        .smooth-scroll {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}