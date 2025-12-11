'use client';

import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSearch, FiBell, FiMessageSquare, FiChevronDown, FiLogOut, FiSun, FiMoon, FiChevronRight, FiCheck, FiClock, FiAlertCircle, FiUsers, FiFileText, FiBarChart2, FiPlus } from 'react-icons/fi';

// Types (same as before)
type Project = {
  id: number;
  name: string;
  progress: number;
  deadline: string;
  members: string[];
  status: 'on-track' | 'at-risk' | 'delayed';
};

type Task = {
  id: number;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo: string;
};

type TeamMember = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  tasks: number;
  performance: number;
  status: 'online' | 'offline' | 'away';
};

type Activity = {
  id: number;
  type: 'task' | 'project' | 'approval' | 'message';
  title: string;
  description: string;
  time: string;
  user: string;
};

const TeamHeadDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  // Mock data (same as before)
  const stats = [
    { id: 1, title: 'Active Projects', value: 12, change: '+2.5%', icon: <FiFileText /> },
    { id: 2, title: 'Tasks Assigned', value: 48, change: '+15%', icon: <FiCheck /> },
    { id: 3, title: 'Tasks Completed', value: 36, change: '+8.3%', icon: <FiCheck /> },
    { id: 4, title: 'Pending Approvals', value: 7, change: '-2', icon: <FiClock /> },
    { id: 5, title: 'Team Performance', value: 87, change: '+4.2%', icon: <FiBarChart2 />, isPercentage: true },
  ];

  const projects: Project[] = [
    { id: 1, name: 'E-commerce Platform Redesign', progress: 75, deadline: '2023-12-15', members: ['JD', 'AS', 'MP'], status: 'on-track' },
    { id: 2, name: 'Mobile App Development', progress: 45, deadline: '2024-01-20', members: ['RB', 'TS', 'KL'], status: 'at-risk' },
    { id: 3, name: 'Marketing Website', progress: 90, deadline: '2023-12-05', members: ['JD', 'MP'], status: 'on-track' },
  ];

  const tasks: Task[] = [
    { id: 1, title: 'Review UI Components', dueDate: '2023-12-10', priority: 'high', status: 'in-progress', assignedTo: 'John D.' },
    { id: 2, title: 'API Integration', dueDate: '2023-12-08', priority: 'high', status: 'todo', assignedTo: 'Sarah K.' },
    { id: 3, title: 'Client Meeting', dueDate: '2023-12-07', priority: 'medium', status: 'completed', assignedTo: 'You' },
  ];

  const teamMembers: TeamMember[] = [
    { id: 1, name: 'John Doe', role: 'Senior Developer', avatar: 'JD', tasks: 8, performance: 92, status: 'online' },
    { id: 2, name: 'Sarah Kim', role: 'UI/UX Designer', avatar: 'SK', tasks: 5, performance: 88, status: 'away' },
    { id: 3, name: 'Mike Patel', role: 'Full Stack Dev', avatar: 'MP', tasks: 6, performance: 85, status: 'online' },
    { id: 4, name: 'Alex Smith', role: 'QA Engineer', avatar: 'AS', tasks: 4, performance: 90, status: 'offline' },
  ];

  const activities: Activity[] = [
    { id: 1, type: 'task', title: 'Task Completed', description: 'John completed the dashboard UI', time: '10 min ago', user: 'John D.' },
    { id: 2, type: 'project', title: 'Project Update', description: 'E-commerce platform 75% complete', time: '2 hours ago', user: 'You' },
    { id: 3, type: 'approval', title: 'Approval Needed', description: '3 designs pending your approval', time: '5 hours ago', user: 'Sarah K.' },
  ];

  // Effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Helper functions (same as before)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'at-risk': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <Outlet />
      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.div 
            initial={{ x: isMobile ? -300 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg ${
              !isMobile ? 'relative' : ''
            } ${isSidebarOpen && isMobile ? 'z-50' : ''}`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    T
                  </div>
                  <span className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">TeamFlow</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 overflow-y-auto">
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', icon: <FiBarChart2 />, label: 'Dashboard', path: '' },
                    { id: 'tasks', icon: <FiCheck />, label: 'Task Manager', path: 'task-manager' },
                    { id: 'team', icon: <FiUsers />, label: 'Team Members', path: 'team-members' },
                    { id: 'analytics', icon: <FiBarChart2 />, label: 'Workload Analytics', path: 'workload-analytics' },
                    { id: 'approvals', icon: <FiCheck />, label: 'Submissions & Approvals', path: 'submissions-approval' },
                  ].map((item) => {
                    const isActive = activeNav === item.id || 
                      (item.path && window.location.pathname.includes(item.path));
                    
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setActiveNav(item.id)}
                        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    TH
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Team Head</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                  <button className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <FiLogOut />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-30 sticky top-0">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Left side */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden mr-3"
              >
                <FiMenu size={24} />
              </button>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-40 md:w-64 pl-10 pr-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                <FiMessageSquare size={20} />
              </button>
              <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative">
                <FiBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <div className="relative">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    TH
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Team Head
                  </span>
                  <FiChevronDown className="hidden md:block text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Welcome Back, Team Lead</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Here's the latest updates from your team.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                    <div className="flex items-baseline mt-1">
                      <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}{stat.isPercentage ? '%' : ''}
                      </span>
                      <span className={`ml-2 text-xs md:text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 text-teal-600 dark:text-teal-400">
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Ongoing Projects</h2>
                <button className="text-xs md:text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="group pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors truncate">
                        {project.name}
                      </h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 whitespace-nowrap ml-2">
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3 dark:bg-gray-700">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(project.status)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <div className="flex -space-x-2">
                        {project.members.map((member, i) => (
                          <div 
                            key={i}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">Due {project.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Manager Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Task Manager</h2>
                <button className="text-xs md:text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">New Tasks</h3>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    3
                  </span>
                </div>
                {tasks.filter(t => t.status === 'todo').map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 mt-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</h4>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          <span>Assigned to {task.assignedTo}</span>
                          <span className="mx-2 hidden sm:inline">•</span>
                          <span className="mt-1 sm:mt-0">Due {task.dueDate}</span>
                        </div>
                      </div>
                      <button className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 flex-shrink-0">
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Due Today</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      2
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).map((task) => (
                      <div key={task.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FiClock className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                          </div>
                          <div className="ml-3 min-w-0">
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 truncate">{task.title}</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 truncate">Due today • {task.assignedTo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Overdue</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      1
                    </span>
                  </div>
                  <div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FiAlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                        </div>
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-medium text-red-800 dark:text-red-200 truncate">Review client feedback</p>
                          <p className="text-xs text-red-700 dark:text-red-300 truncate">1 day overdue • John D.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance & Members */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Team Performance */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Team Performance</h2>
                <div className="flex space-x-2">
                  <button className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Week
                  </button>
                  <button className="px-2 py-1 text-xs font-medium rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                    Month
                  </button>
                  <button className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Year
                  </button>
                </div>
              </div>
              <div className="h-48 md:h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Performance Chart Placeholder</p>
              </div>
              <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 md:p-4 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg">
                  <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Productivity</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">87%</p>
                  <p className="text-xs text-green-500">+2.5% from last week</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Workload</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">62%</p>
                  <p className="text-xs text-yellow-500">Balanced</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Engagement</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">94%</p>
                  <p className="text-xs text-green-500">+5.2% from last week</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
                <button className="text-xs md:text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
                  View All
                </button>
              </div>
              <div className="space-y-3 md:space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center p-2 md:p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                    <div className="relative">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      <span className={`absolute bottom-0 right-0 block w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${getStatusIcon(member.status)}`}></span>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.role}</p>
                    </div>
                    <div className="ml-2 text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{member.tasks} tasks</p>
                      <div className="w-16 md:w-20 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-blue-500 h-1.5 rounded-full"
                          style={{ width: `${member.performance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-3 md:mt-4 px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-teal-500 hover:text-teal-500 dark:hover:border-teal-400 dark:hover:text-teal-400 transition-colors flex items-center justify-center">
                  <FiPlus className="mr-2" /> Add Team Member
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <button className="text-xs md:text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
                  View All
                </button>
              </div>
              <div className="space-y-3 md:space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start pb-3 md:pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        {activity.type === 'task' ? <FiCheck size={14} /> : 
                         activity.type === 'project' ? <FiFileText size={14} /> : 
                         activity.type === 'approval' ? <FiCheck size={14} /> : <FiMessageSquare size={14} />}
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
                      <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{activity.time}</span>
                        <span className="mx-2 hidden sm:inline">•</span>
                        <span className="mt-1 sm:mt-0">{activity.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 hover:from-teal-100 hover:to-blue-100 dark:hover:from-teal-800/30 dark:hover:to-blue-800/30 rounded-lg transition-all">
                  <div className="flex items-center min-w-0">
                    <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                      <FiPlus size={16} />
                    </div>
                    <span className="ml-2 md:ml-3 text-sm font-medium text-gray-900 dark:text-white truncate">Assign New Task</span>
                  </div>
                  <FiChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                </button>

                <button className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="flex items-center min-w-0">
                    <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <FiFileText size={16} />
                    </div>
                    <span className="ml-2 md:ml-3 text-sm font-medium text-gray-900 dark:text-white truncate">Create Project</span>
                  </div>
                  <FiChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                </button>

                <button className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="flex items-center min-w-0">
                    <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      <FiUsers size={16} />
                    </div>
                    <span className="ml-2 md:ml-3 text-sm font-medium text-gray-900 dark:text-white truncate">Send Announcement</span>
                  </div>
                  <FiChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                </button>

                <button className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="flex items-center min-w-0">
                    <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      <FiFileText size={16} />
                    </div>
                    <span className="ml-2 md:ml-3 text-sm font-medium text-gray-900 dark:text-white truncate">Upload File</span>
                  </div>
                  <FiChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                </button>
              </div>

              <div className="mt-6 md:mt-8">
                <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">UPCOMING EVENTS</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-2 md:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-center border-r border-gray-200 dark:border-gray-600 pr-2 md:pr-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">15</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">DEC</p>
                    </div>
                    <div className="ml-2 md:ml-3 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Sprint Planning</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">10:00 AM - 11:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 md:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-center border-r border-gray-200 dark:border-gray-600 pr-2 md:pr-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">18</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">DEC</p>
                    </div>
                    <div className="ml-2 md:ml-3 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Client Demo</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">2:00 PM - 3:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamHeadDashboard;