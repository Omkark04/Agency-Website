'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Upload, 
  MessageSquare, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Settings, 
  Menu, 
  X,
  CheckCircle2,
  Clock as ClockIcon,
  FileText,
  Activity,
  ChevronDown,
  ChevronRight,
  Plus,
  UploadCloud
} from 'lucide-react';

// Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Import components from shadcn
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Progress } from "../../../components/ui/progress";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/avatar";

// Mock data
const tasks = [
  {
    id: 1,
    title: 'Design Dashboard UI',
    description: 'Create modern dashboard layout with Tailwind CSS',
    priority: 'High',
    assignedDate: '2025-12-01',
    deadline: '2025-12-15',
    status: 'In Progress',
    progress: 65
  },
  {
    id: 2,
    title: 'Implement API Integration',
    description: 'Connect frontend with backend services',
    priority: 'Medium',
    assignedDate: '2025-12-05',
    deadline: '2025-12-20',
    status: 'To Do',
    progress: 0
  },
  {
    id: 3,
    title: 'Write Unit Tests',
    description: 'Create test cases for all components',
    priority: 'High',
    assignedDate: '2025-11-28',
    deadline: '2025-12-10',
    status: 'Completed',
    progress: 100
  },
];

const productivityData = [
  { name: 'Mon', value: 8 },
  { name: 'Tue', value: 6 },
  { name: 'Wed', value: 7 },
  { name: 'Thu', value: 9 },
  { name: 'Fri', value: 8 },
  { name: 'Sat', value: 5 },
  { name: 'Sun', value: 3 },
];

const taskCompletionData = [
  { name: 'Completed', value: 12 },
  { name: 'In Progress', value: 5 },
  { name: 'Pending', value: 3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const TeamMemberDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard Overview' },
    { id: 'tasks', icon: <ClipboardList className="h-5 w-5" />, label: 'Assigned Tasks' },
    { id: 'progress', icon: <Activity className="h-5 w-5" />, label: 'Task Progress' },
    { id: 'submissions', icon: <Upload className="h-5 w-5" />, label: 'Work Submissions' },
    { id: 'messages', icon: <MessageSquare className="h-5 w-5" />, label: 'Messages' },
    { id: 'support', icon: <HelpCircle className="h-5 w-5" />, label: 'Support' },
  ];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'To Do':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">To Do</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <ClipboardList className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">20</div>
                  <p className="text-xs text-blue-100">+5 from last week</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle2 className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-green-100">+3 from last week</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Activity className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-amber-100">2 due this week</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <ClockIcon className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-rose-100">1 high priority</p>
                </CardContent>
              </Card>
            </div>

            {/* Task List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Tasks</CardTitle>
                  <Button variant="outline" size="sm" className="gap-1">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{task.title}</h4>
                          {renderStatusBadge(task.status)}
                          {renderPriorityBadge(task.priority)}
                        </div>
                        <p className="text-sm text-gray-500">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Assigned: {task.assignedDate}</span>
                          <span>Deadline: {task.deadline}</span>
                        </div>
                      </div>
                      <div className="w-48">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Productivity</CardTitle>
                  <CardDescription>Hours worked per day</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Task Completion</CardTitle>
                  <CardDescription>Overview of all tasks</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskCompletionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskCompletionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Assigned Tasks</h2>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Task</th>
                        <th className="text-left p-4">Priority</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Deadline</th>
                        <th className="text-right p-4">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gray-500">{task.description}</div>
                          </td>
                          <td className="p-4">{renderPriorityBadge(task.priority)}</td>
                          <td className="p-4">{renderStatusBadge(task.status)}</td>
                          <td className="p-4">{task.deadline}</td>
                          <td className="p-4">
                            <div className="w-32">
                              <Progress value={task.progress} className="h-2" />
                              <div className="text-right text-sm text-gray-500 mt-1">{task.progress}%</div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'submissions':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Work Submissions</h2>
              <Button className="gap-1">
                <UploadCloud className="h-4 w-4" />
                Upload New
              </Button>
            </div>
            
            <Card className="border-2 border-dashed p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadCloud className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium">Drag and drop files here</h3>
                <p className="text-sm text-gray-500">or</p>
                <Button variant="outline">Browse Files</Button>
                <p className="text-xs text-gray-400">Supports: PDF, DOCX, XLSX, JPG, PNG (max. 10MB)</p>
              </div>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Submissions</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <Card key={item} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Project Deliverable {item}.pdf</h4>
                          <p className="text-sm text-gray-500">Uploaded 2 days ago</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">PDF</Badge>
                            <span className="text-xs text-gray-500">2.4 MB</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Select an item to view details</h3>
            <p className="text-gray-500 mt-2">Choose from the sidebar menu to get started</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar 
              src="/placeholder-avatar.jpg" 
              alt="User"
              fallback="U"
              className="h-8 w-8"
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || !isMobile) && (
            <motion.div
              initial={{ x: isMobile ? -300 : 0 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r z-20 overflow-y-auto"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">TeamMember</h2>
              </div>
              <nav className="px-2 space-y-1">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-2 ${activeTab === item.id ? 'bg-gray-100' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 mt-4"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          {/* Desktop Header */}
          <header className="hidden md:flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="relative p-2">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar 
                  src="/placeholder-avatar.jpg" 
                  alt="User"
                  fallback="JD"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">Team Member</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="p-4 md:p-6">
            {renderContent()}
          </main>
          
          {/* Mobile Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 px-4 z-10">
            {menuItems.slice(0, 4).map((item) => (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                className={`flex-col h-auto p-2 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab(item.id)}
              >
                {React.cloneElement(item.icon, {
                  className: `h-5 w-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}`
                })}
                <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;
