import { useState } from 'react';
import { FiHome, FiFolder, FiBox, FiCreditCard, FiMessageSquare, FiDownload, FiSettings, FiLogOut, FiSearch, FiBell, FiMail, FiChevronDown, FiPlus, FiUpload, FiClock, FiCheckCircle, FiActivity, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock data
  const stats = [
    { title: 'Active Projects', value: '5', change: '+2 from last month', icon: <FiActivity className="w-6 h-6" />, color: 'bg-blue-500' },
    { title: 'Pending Tasks', value: '12', change: '-3 from last week', icon: <FiClock className="w-6 h-6" />, color: 'bg-amber-500' },
    { title: 'Payments Due', value: '₹24,500', change: '2 invoices pending', icon: <FiDollarSign className="w-6 h-6" />, color: 'bg-emerald-500' },
    { title: 'Completed', value: '8', change: '+5 from last month', icon: <FiCheckCircle className="w-6 h-6" />, color: 'bg-purple-500' },
  ];

  const projects = [
    { name: 'Website Redesign', progress: 75, status: 'In Progress', daysLeft: 12, team: ['JD', 'AS', 'MP'] },
    { name: 'Mobile App Development', progress: 30, status: 'In Progress', daysLeft: 24, team: ['AS', 'RK'] },
    { name: 'Brand Identity', progress: 10, status: 'Planning', daysLeft: 45, team: ['MP', 'JD'] },
  ];

  const activities = [
    { id: 1, type: 'upload', title: 'You uploaded new files', time: '2 hours ago', icon: <FiUpload className="text-blue-500" /> },
    { id: 2, type: 'message', title: 'New message from support team', time: '5 hours ago', icon: <FiMessageSquare className="text-purple-500" /> },
    { id: 3, type: 'payment', title: 'Payment of ₹15,000 received', time: '1 day ago', icon: <FiDollarSign className="text-emerald-500" /> },
    { id: 4, type: 'update', title: 'Project status updated', time: '2 days ago', icon: <FiActivity className="text-amber-500" /> },
  ];

  const menuItems = [
    { id: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
    { id: 'projects', icon: <FiFolder />, label: 'My Projects' },
    { id: 'services', icon: <FiBox />, label: 'My Services' },
    { id: 'payments', icon: <FiCreditCard />, label: 'Payments & Invoices' },
    { id: 'messages', icon: <FiMessageSquare />, label: 'Messages' },
    { id: 'downloads', icon: <FiDownload />, label: 'Downloads' },
    { id: 'settings', icon: <FiSettings />, label: 'Profile Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <motion.div 
        className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}
        initial={{ width: 256 }}
        animate={{ width: sidebarOpen ? 256 : 80 }}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">UdyogWorks</h1>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full px-6 py-3 text-left transition-colors ${activeTab === item.id ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700/50'}`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-4">{item.label}</span>}
            </button>
          ))}
          <button className="flex items-center w-full px-6 py-3 mt-4 text-left text-red-400 hover:bg-slate-700/50 transition-colors">
            <FiLogOut className="text-xl" />
            {sidebarOpen && <span className="ml-4">Logout</span>}
          </button>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, tasks, or messages..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-full hover:bg-gray-100 relative"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                }}
              >
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button 
                className="p-2 rounded-full hover:bg-gray-100 relative"
                onClick={() => {
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                }}
              >
                <FiMail className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>
              
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                    U
                  </div>
                  {sidebarOpen && (
                    <div className="flex items-center">
                      <span className="mr-1">User</span>
                      <FiChevronDown />
                    </div>
                  )}
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sign out</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, User! 👋</h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your projects today</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                    <div className={`${stat.color.replace('bg-', 'text-')}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Ongoing Projects</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                    <FiPlus className="mr-1" /> New Project
                  </button>
                </div>
                
                <div className="space-y-6">
                  {projects.map((project, index) => (
                    <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{project.name}</h3>
                        <span className="text-sm px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.team.map((member, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium border-2 border-white">
                              {member}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{project.daysLeft} days left</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="p-2 rounded-lg bg-gray-50 mr-3">
                        {activity.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="flex items-center w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FiPlus className="mr-3 text-blue-500" />
                    <span>Start New Project</span>
                  </button>
                  <button className="flex items-center w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FiMessageSquare className="mr-3 text-purple-500" />
                    <span>Contact Support</span>
                  </button>
                  <button className="flex items-center w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FiUpload className="mr-3 text-emerald-500" />
                    <span>Upload File</span>
                  </button>
                  <button className="flex items-center w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FiBox className="mr-3 text-amber-500" />
                    <span>View Services</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute top-16 right-0 w-80 bg-white shadow-xl rounded-lg z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
          </div>
          <div className="p-2">
            <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <p className="text-sm">Your project has been updated</p>
              <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
            </div>
            <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <p className="text-sm">New message from support team</p>
              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Panel */}
      {showMessages && (
        <div className="absolute top-16 right-0 w-80 bg-white shadow-xl rounded-lg z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Messages</h3>
          </div>
          <div className="p-2">
            <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <p className="text-sm font-medium">Support Team</p>
              <p className="text-sm text-gray-600 truncate">Hi there! We've received your request...</p>
              <p className="text-xs text-gray-400 mt-1">Today, 10:30 AM</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;

