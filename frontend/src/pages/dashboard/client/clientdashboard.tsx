import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Folder, 
  Settings, 
  Bell, 
  MessageSquare, 
  Download, 
  ChevronLeft, 
  Search,
  Plus,
  CreditCard,
  CheckCircle,
  Clock,
  FileDown,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

// Mock data
const stats = [
  { id: 1, name: 'Active Projects', value: '12', icon: Folder, change: '+2', changeType: 'increase' },
  { id: 2, name: 'Pending Tasks', value: '8', icon: Clock, change: '-3', changeType: 'decrease' },
  { id: 3, name: 'Payments Due', value: '$2,450', icon: CreditCard, change: '+$450', changeType: 'increase' },
  { id: 4, name: 'Completed', value: '24', icon: CheckCircle, change: '+5', changeType: 'increase' },
];

const projects = [
  { 
    id: 1, 
    name: 'Website Redesign', 
    progress: 75, 
    status: 'In Progress', 
    dueDate: 'Dec 30, 2023',
    team: ['/team-1.jpg', '/team-2.jpg', '/team-3.jpg']
  },
  { 
    id: 2, 
    name: 'Mobile App Development', 
    progress: 45, 
    status: 'In Progress', 
    dueDate: 'Jan 15, 2024',
    team: ['/team-2.jpg', '/team-4.jpg']
  },
  { 
    id: 3, 
    name: 'Brand Identity', 
    progress: 90, 
    status: 'Review', 
    dueDate: 'Dec 20, 2023',
    team: ['/team-1.jpg', '/team-3.jpg', '/team-5.jpg']
  },
];

const activities = [
  { id: 1, type: 'upload', user: 'You', action: 'uploaded a new file', time: '2 min ago', icon: FileDown },
  { id: 2, type: 'message', user: 'John Doe', action: 'sent you a message', time: '1 hour ago', icon: MessageSquare },
  { id: 3, type: 'payment', user: 'You', action: 'made a payment of $1,200', time: '3 hours ago', icon: CreditCard },
  { id: 4, type: 'update', user: 'Sarah Wilson', action: 'updated project status', time: '5 hours ago', icon: CheckCircle },
];

const announcements = [
  { id: 1, title: 'System Maintenance', description: 'Scheduled maintenance on Dec 15, 2023', type: 'info' },
  { id: 2, title: 'New Feature Released', description: 'Check out the new project analytics dashboard', type: 'success' },
  { id: 3, title: 'Holiday Schedule', description: 'Office closed from Dec 24 - Jan 2', type: 'warning' },
];

const navigation = [
  { name: 'Dashboard', href: '#', icon: Home, current: true },
  { name: 'My Projects', href: '#', icon: Folder, current: false },
  { name: 'Payments', href: '#', icon: CreditCard, current: false },
  { name: 'Messages', href: '#', icon: MessageSquare, current: false },
  { name: 'Downloads', href: '#', icon: Download, current: false },
  { name: 'Settings', href: '#', icon: Settings, current: false },
];

export default function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown')) {
        setNotificationsOpen(false);
      }
      if (!target.closest('.message-dropdown')) {
        setMessagesOpen(false);
      }
      if (!target.closest('.profile-dropdown')) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col`}>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
              UW
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">UdyogWorks</h1>
          </div>
          
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-gradient-to-r from-teal-50 to-blue-50 text-teal-600 border-l-4 border-teal-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    item.current ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src="/placeholder-user.jpg"
                alt="User profile"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">View profile</p>
            </div>
            <button
              type="button"
              className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Collapse sidebar</span>
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`lg:pl-64 flex flex-col flex-1 ${mobileMenuOpen ? 'ml-64' : ''}`}>
        {/* Top navbar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center justify-between">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Notifications */}
                <div className="relative">
                  <button
                    type="button"
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setMessagesOpen(false);
                      setProfileOpen(false);
                    }}
                  >
                    <span className="sr-only">View notifications</span>
                    <div className="relative">
                      <Bell className="h-6 w-6" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">3</span>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="notification-dropdown origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <div className="py-1">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                          </div>
                          <div className="max-h-96 overflow-auto">
                            {[1, 2, 3].map((item) => (
                              <div key={item} className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                      <Bell className="h-5 w-5 text-teal-600" />
                                    </div>
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Notification {item}</p>
                                    <p className="text-sm text-gray-500">This is a sample notification message.</p>
                                    <p className="mt-1 text-xs text-gray-400">2 hours ago</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="px-4 py-2 border-t border-gray-100 text-center">
                            <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-500">
                              View all notifications
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Messages */}
                <div className="relative">
                  <button
                    type="button"
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    onClick={() => {
                      setMessagesOpen(!messagesOpen);
                      setNotificationsOpen(false);
                      setProfileOpen(false);
                    }}
                  >
                    <span className="sr-only">View messages</span>
                    <div className="relative">
                      <MessageSquare className="h-6 w-6" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">2</span>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {messagesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="message-dropdown origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <div className="py-1">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">Messages</h3>
                          </div>
                          <div className="max-h-96 overflow-auto">
                            {[1, 2].map((item) => (
                              <div key={item} className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={`/team-${item}.jpg`}
                                      alt="Team member"
                                    />
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900">Team Member {item}</p>
                                      <p className="text-xs text-gray-400">2h ago</p>
                                    </div>
                                    <p className="text-sm text-gray-500">Hey there! I have a question about the project.</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="px-4 py-2 border-t border-gray-100 text-center">
                            <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-500">
                              View all messages
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    id="user-menu"
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setNotificationsOpen(false);
                      setMessagesOpen(false);
                    }}
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src="/placeholder-user.jpg"
                      alt="User profile"
                    />
                  </button>
                  
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="profile-dropdown origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu"
                      >
                        <div className="py-1">
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Your Profile
                          </a>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Settings
                          </a>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Notifications
                          </a>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Billing
                          </a>
                          <div className="border-t border-gray-100"></div>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Sign out
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page title */}
              <div className="md:flex md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, John</h1>
                  <p className="mt-1 text-sm text-gray-500">Here's what's happening with your projects today.</p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Project
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: stat.id * 0.1 }}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-3 rounded-md ${stat.changeType === 'increase' ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-600'}`}>
                            <stat.icon className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                              <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'increase' ? 'text-teal-600' : 'text-red-600'}`}>
                                {stat.change}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Projects */}
                <div className="lg:col-span-2">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Ongoing Projects</h3>
                        <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-500">View all</a>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {projects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                              <div className="mt-1 flex items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  project.status === 'In Progress' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : project.status === 'Review' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-green-100 text-green-800'
                                }`}>
                                  {project.status}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">Due {project.dueDate}</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex">
                              <div className="flex -space-x-1">
                                {project.team.map((member, i) => (
                                  <img
                                    key={i}
                                    className="h-6 w-6 rounded-full ring-2 ring-white"
                                    src={member}
                                    alt="Team member"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium text-gray-900">{project.progress}%</span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div>
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {activities.map((activity, index) => (
                        <motion.div 
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <activity.icon className="h-5 w-5 text-teal-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {activity.user} <span className="text-gray-500">{activity.action}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                {activity.time}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="px-6 py-3 bg-gray-50 text-center">
                      <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-500">
                        View all activity
                      </a>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        <span>Start New Project</span>
                        <Plus className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        <span>Contact Support</span>
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        <span>Upload File</span>
                        <FileDown className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        <span>View Services</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Announcements</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {announcements.map((announcement, index) => (
                    <motion.div 
                      key={announcement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {announcement.type === 'info' && (
                            <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                          )}
                          {announcement.type === 'success' && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          )}
                          {announcement.type === 'warning' && (
                            <ExclamationIcon className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">{announcement.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">{announcement.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} UdyogWorks. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Privacy</span>
                  <span className="text-sm">Privacy Policy</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Terms</span>
                  <span className="text-sm">Terms of Service</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Contact</span>
                  <span className="text-sm">Contact Us</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Add missing icon components
function InformationCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ExclamationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}