import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { listOrders } from '../../../api/orders';
import { useAuth } from '../../../hooks/useAuth';
import { logout } from '../../../utils/auth';
import logo from '../../../assets/UdyogWorks logo.png';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Folder, 
  Settings, 
  Bell, 
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
  ChevronDown,
  Activity
} from 'lucide-react';

export default function ClientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
      logout();
      navigate('/');
    };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const ordersResponse = await listOrders();
      setOrders(ordersResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Calculate stats from real data
  const stats = [
    { 
      id: 1, 
      name: 'Total Orders', 
      value: orders.length.toString(), 
      icon: Folder, 
      change: '+' + orders.filter(o => {
        const createdDate = new Date(o.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      }).length, 
      changeType: 'increase' as const,
      description: 'All time',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    { 
      id: 2, 
      name: 'In Progress', 
      value: orders.filter(o => o.status === 'in_progress').length.toString(), 
      icon: Clock, 
      change: '', 
      changeType: 'increase' as const,
      description: 'Active orders',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100'
    },
    { 
      id: 3, 
      name: 'Total Spent', 
      value: '₹' + orders.reduce((sum, o) => sum + (o.total_price || 0), 0).toLocaleString(), 
      icon: CreditCard, 
      change: '', 
      changeType: 'increase' as const,
      description: 'All payments',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100'
    },
    { 
      id: 4, 
      name: 'Completed', 
      value: orders.filter(o => o.status === 'completed').length.toString(), 
      icon: CheckCircle, 
      change: '', 
      changeType: 'increase' as const,
      description: 'Finished orders',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100'
    },
  ];

  const recentActivity = orders.slice(0, 4).map(order => ({
    id: order.id,
    action: `Order ${order.status === 'completed' ? 'completed' : order.status === 'in_progress' ? 'in progress' : 'placed'}`,
    project: order.service_title || 'Service Order',
    time: new Date(order.created_at).toLocaleDateString(),
    status: order.status
  }));

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
                <p className="text-xs text-gray-500 mt-0.5">Welcome back, {user?.username || user?.email?.split('@')[0]}</p>
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
                placeholder="Search orders, projects..."
                className="pl-10 pr-4 py-2.5 w-64 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Notification */}
            <Link
              to="/client-dashboard/notifications"
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </Link>

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
                  <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Client'}</p>
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
                    <p className="text-sm font-semibold text-gray-900">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/client-dashboard/profile"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      role="menuitem"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      Your Profile
                    </Link>
                    <Link
                      to="/client-dashboard/settings"
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
                      onClick={handleLogout}
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
              <div className="flex items-center justify-center shadow-sm">
                <img
                  src={logo}
                  alt="UdyogWorks Logo"
                  className="h-10 sm:h-12 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">UdyogWorks</h1>
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
            {/* Back to Homepage */}
            <Link
              to="/"
              className="flex items-center px-4 py-3 mb-4 rounded-xl text-sm font-medium transition-all duration-200 group bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border border-gray-200"
            >
              <ChevronDown className="h-5 w-5 text-gray-600 rotate-90" />
              {sidebarOpen && <span className="ml-3">Back to Homepage</span>}
            </Link>

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
                badge: orders.filter(o => o.status === 'in_progress' || o.status === '25_done' || o.status === '50_done' || o.status === '75_done').length || null
              },
              { 
                path: '/client-dashboard/services', 
                icon: Box, 
                label: 'Services', 
                active: location.pathname.includes('services'),
                badge: null
              },
              { 
                path: '/client-dashboard/orders', 
                icon: CreditCard, 
                label: 'Orders & Payments', 
                active: location.pathname.includes('orders'),
                badge: null
              },
              { 
                path: '/client-dashboard/documents', 
                icon: FileText, 
                label: 'Documents',
                active: location.pathname.includes('documents'),
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
                <p className="text-sm font-medium text-gray-900 truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
              {/* Animated Header with Gradient - Admin Style */}
              <div className="mb-8 animate-fade-in">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] p-8 shadow-2xl">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <Home className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold text-white drop-shadow-lg">Welcome Back, {user?.username || 'Client'}!</h1>
                        <p className="text-white/90 text-lg mt-1">Here's your project overview at a glance</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    to="/client-dashboard/services"
                    className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Box className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Browse Services</p>
                        <p className="text-xs text-gray-600">Explore our offerings</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/client-dashboard/orders"
                    className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">View Orders</p>
                        <p className="text-xs text-gray-600">Track your purchases</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/client-dashboard/notifications"
                    className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <Bell className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Notifications</p>
                        <p className="text-xs text-gray-600">Stay updated</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/client-dashboard/settings"
                    className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-600 rounded-lg">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Settings</p>
                        <p className="text-xs text-gray-600">Manage account</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Enhanced Stats Grid - Admin Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
                {stats.map((stat, index) => {
                  // First card gets premium gradient treatment like admin
                  if (index === 0) {
                    return (
                      <div key={stat.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCIvPjwvc3ZnPg==')] opacity-40"></div>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-green-100 text-sm font-semibold uppercase tracking-wider">{stat.name}</p>
                              <p className="text-4xl font-black text-white mt-2 drop-shadow-lg">{stat.value}</p>
                              {stat.change && (
                                <div className="flex items-center gap-2 mt-3">
                                  <div className="flex items-center gap-1 px-2.5 py-1 bg-white/25 backdrop-blur-sm rounded-full">
                                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                                    <span className="text-xs font-bold text-white">{stat.change}</span>
                                  </div>
                                  <span className="text-xs text-green-100">{stat.description}</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 transition-colors shadow-lg">
                              <stat.icon className="h-8 w-8 text-white drop-shadow" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      </div>
                    );
                  }
                  
                  // Other cards get glassmorphism treatment
                  return (
                    <div key={stat.id} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color.replace('from-', 'from-').replace('to-', 'to-')}/10 rounded-full blur-3xl`}></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg group-hover:shadow-${stat.color.split('-')[1]}-500/50 transition-shadow`}>
                            <stat.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className={`px-3 py-1 bg-${stat.color.split('-')[1]}-50 rounded-full`}>
                            <span className={`text-xs font-bold text-${stat.color.split('-')[1]}-600`}>Active</span>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">{stat.name}</p>
                        <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {stat.changeType === 'increase' ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                {stat.change && <span className="font-semibold text-green-600">{stat.change}</span>}
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                {stat.change && <span className="font-semibold text-red-600">{stat.change}</span>}
                              </>
                            )}
                            <span>{stat.description}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Content Grid - Enhanced */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Recent Activity
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Latest updates from your projects</p>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
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
                    {(() => {
                      const totalOrders = orders.length;
                      const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'closed' || o.status === 'payment_done').length;
                      const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'closed' || o.status === 'payment_done').length;
                      
                      const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
                      const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
                      
                      return [
                        { label: 'Project Completion', value: completionRate, color: 'from-white to-blue-100' },
                        { label: 'On-time Delivery', value: deliveryRate, color: 'from-white to-blue-100' },
                        { label: 'Active Projects', value: orders.filter(o => o.status === 'in_progress' || o.status === '25_done' || o.status === '50_done' || o.status === '75_done').length, color: 'from-white to-blue-100', isCount: true },
                      ].map((metric, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-blue-100">{metric.label}</span>
                            <span className="font-semibold">{metric.isCount ? metric.value : `${metric.value}%`}</span>
                          </div>
                          {!metric.isCount && (
                            <div className="h-2 bg-blue-400/30 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${metric.value}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
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

      {/* Custom Animations - Admin Style */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
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