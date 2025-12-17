'use client';

import { useState, useEffect } from 'react';
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
  CheckCircle2,
  Clock as ClockIcon,
  FileText,
  Activity,
  ChevronRight,
  ChevronLeft,
  Plus,
  UploadCloud,
  Search,
  MoreVertical,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Edit,
  Filter,
  Users,
  Trash2,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Sparkles,
  Zap,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Cloud,
  FolderUp,
  Star,
  Award,
  Rocket,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

// Recharts components
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  Line} from 'recharts';

// Import components from shadcn
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// Import API functions
import { getTeamMemberStats, getMyTasks, updateTaskStatus, type TeamMemberTask, type TeamMemberStats } from '@/api/teamMemberApi';
import { useAuth } from '@/hooks/useAuth';

// Mock data for charts and notifications (will be replaced with real data later)
const productivityData = [
  { name: 'Mon', hours: 8, efficiency: 92, focus: 85 },
  { name: 'Tue', hours: 6, efficiency: 85, focus: 78 },
  { name: 'Wed', hours: 7, efficiency: 88, focus: 82 },
  { name: 'Thu', hours: 9, efficiency: 95, focus: 90 },
  { name: 'Fri', hours: 8, efficiency: 90, focus: 88 },
  { name: 'Sat', hours: 5, efficiency: 78, focus: 72 },
  { name: 'Sun', hours: 3, efficiency: 65, focus: 60 },
];

const notifications = [
  { id: 1, title: 'New task assigned', description: 'You have been assigned to "Project Analysis"', time: '10 min ago', unread: true, icon: '✨' },
  { id: 2, title: 'Deadline approaching', description: 'Task "UI Design" due in 2 days', time: '1 hour ago', unread: true, icon: '⏰' },
  { id: 3, title: 'Feedback received', description: 'Sarah reviewed your submission', time: '2 hours ago', unread: false, icon: '📝' },
  { id: 4, title: 'Weekly Review', description: 'Your productivity increased by 15%', time: '1 day ago', unread: false, icon: '📈' },
];

const achievements = [
  { id: 1, title: 'Early Bird', description: 'Complete 5 tasks before deadline', icon: <Trophy className="h-5 w-5" />, progress: 80, color: 'from-yellow-400 to-amber-500' },
  { id: 2, title: 'Quality Master', description: 'Maintain 95%+ quality score', icon: <Star className="h-5 w-5" />, progress: 100, color: 'from-purple-400 to-pink-500' },
  { id: 3, title: 'Team Player', description: 'Collaborate on 10+ projects', icon: <Users className="h-5 w-5" />, progress: 60, color: 'from-blue-400 to-cyan-500' },
  { id: 4, title: 'Speed Racer', description: 'Complete tasks 20% faster', icon: <Zap className="h-5 w-5" />, progress: 40, color: 'from-green-400 to-emerald-500' },
];

const TeamMemberDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data from API
  const [stats, setStats] = useState<TeamMemberStats | null>(null);
  const [allTasks, setAllTasks] = useState<(TeamMemberTask & { color: string })[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<(TeamMemberTask & { color: string })[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch stats and tasks in parallel
        const [statsResponse, tasksResponse] = await Promise.all([
          getTeamMemberStats(),
          getMyTasks()
        ]);
        
        setStats(statsResponse.data);
        
        // Add color to tasks based on priority
        const tasksWithColor = tasksResponse.data.map(task => ({
          ...task,
          color: getTaskColor(task.priority)
        }));
        
        setAllTasks(tasksWithColor);
        setFilteredTasks(tasksWithColor);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter tasks based on status and search query
  useEffect(() => {
    let filtered = allTasks;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const statusMap: { [key: string]: string } = {
        'pending': 'To Do',
        'in-progress': 'In Progress',
        'completed': 'Completed'
      };
      filtered = filtered.filter(task => task.status === statusMap[statusFilter]);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredTasks(filtered);
  }, [allTasks, statusFilter, searchQuery]);

  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Overview', badge: null },
    { id: 'tasks', icon: <ClipboardList className="h-5 w-5" />, label: 'My Tasks', badge: stats?.tasks_in_progress.toString() || '0' },
    { id: 'progress', icon: <Activity className="h-5 w-5" />, label: 'Progress', badge: '🔥' },
    { id: 'submissions', icon: <Upload className="h-5 w-5" />, label: 'Submissions', badge: '2' },
    { id: 'messages', icon: <MessageSquare className="h-5 w-5" />, label: 'Messages', badge: '5' },
    { id: 'support', icon: <HelpCircle className="h-5 w-5" />, label: 'Support', badge: null },
  ];

  // Helper function to get task color based on priority
  const getTaskColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'from-red-500 to-rose-600';
      case 'High':
        return 'from-purple-500 to-pink-500';
      case 'Medium':
        return 'from-blue-500 to-cyan-500';
      case 'Low':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (taskId: number, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      
      // Refresh tasks
      const tasksResponse = await getMyTasks();
      const tasksWithColor = tasksResponse.data.map(task => ({
        ...task,
        color: getTaskColor(task.priority)
      }));
      setAllTasks(tasksWithColor);
      setFilteredTasks(tasksWithColor);
      
      // Refresh stats
      const statsResponse = await getTeamMemberStats();
      setStats(statsResponse.data);
    } catch (err: any) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" /> {status}
          </Badge>
        );
      case 'In Progress':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-sm">
            <PlayCircle className="h-3 w-3 mr-1" /> {status}
          </Badge>
        );
      case 'To Do':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-sm">
            <ClockIcon className="h-3 w-3 mr-1" /> {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-sm animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" /> {priority}
          </Badge>
        );
      case 'Medium':
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 shadow-sm">
            {priority}
          </Badge>
        );
      case 'Low':
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0 shadow-sm">
            {priority}
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Hero Welcome Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white"
            >
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5" />
                      <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">Welcome back!</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Hello, {user?.first_name || user?.username || 'Team Member'}! 👋</h1>
                    <p className="text-blue-100 text-lg mb-6">You're doing great! Here's your performance overview for today.</p>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-sm">Active Streak: {stats?.streak || 0} days</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <Rocket className="h-4 w-4" />
                        <span className="text-sm">Productivity: {stats?.productivity || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:ml-4"
                  >
                    <Button 
                      variant="secondary" 
                      className="bg-white text-blue-600 hover:bg-white/90 backdrop-blur-sm shadow-lg gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      View Calendar
                    </Button>
                  </motion.div>
                </div>
              </div>
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Stats Grid with Glass Morphism */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { 
                  title: 'Total Tasks', 
                  value: stats?.total_tasks?.toString() || '0', 
                  change: '+12%', 
                  trend: 'up',
                  icon: <ClipboardList className="h-6 w-6" />,
                  color: 'from-blue-500 to-cyan-500',
                  gradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
                },
                { 
                  title: 'Completed', 
                  value: stats?.tasks_completed?.toString() || '0', 
                  change: '+25%', 
                  trend: 'up',
                  icon: <CheckCircle2 className="h-6 w-6" />,
                  color: 'from-emerald-500 to-green-600',
                  gradient: 'bg-gradient-to-br from-emerald-500/10 to-green-600/10'
                },
                { 
                  title: 'In Progress', 
                  value: stats?.tasks_in_progress?.toString() || '0', 
                  change: `${stats?.tasks_pending || 0} pending`, 
                  trend: 'warning',
                  icon: <Activity className="h-6 w-6" />,
                  color: 'from-amber-500 to-orange-600',
                  gradient: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10'
                },
                { 
                  title: 'Productivity', 
                  value: `${stats?.productivity || 0}%`, 
                  change: '+8%', 
                  trend: 'up',
                  icon: <TrendingUpIcon className="h-6 w-6" />,
                  color: 'from-indigo-500 to-purple-600',
                  gradient: 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10'
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-lg backdrop-blur-sm bg-white/80 overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">{stat.title}</p>
                          <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                          <div className="flex items-center gap-2">
                            {stat.trend === 'up' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : stat.trend === 'down' ? (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              stat.trend === 'up' ? 'text-green-600' : 
                              stat.trend === 'down' ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {stat.change}
                            </span>
                            <span className="text-xs text-gray-500">from last week</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                          <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.icon}
                          </div>
                        </div>
                      </div>
                      {/* Animated progress bar */}
                      <div className="mt-4">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts and Tasks */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Performance Chart */}
              <Card className="border-none shadow-lg backdrop-blur-sm bg-white/80 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Weekly Performance
                      </CardTitle>
                      <CardDescription>Hours worked vs efficiency</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="shadow-xl">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Export Data</DropdownMenuItem>
                        <DropdownMenuItem>Share Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={productivityData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280" 
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280" 
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(4px)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="hours" 
                          stroke="#3b82f6" 
                          fill="url(#colorHours)"
                          strokeWidth={3}
                          dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="efficiency" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Task Distribution with Radial Chart */}
              <Card className="border-none shadow-lg backdrop-blur-sm bg-white/80 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-purple-500" />
                        Task Distribution
                      </CardTitle>
                      <CardDescription>Status of all assigned tasks</CardDescription>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-20 rounded-full"></div>
                      <PieChartIcon className="h-6 w-6 text-purple-500 relative" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: stats?.tasks_completed || 0, color: '#22c55e' },
                            { name: 'In Progress', value: stats?.tasks_in_progress || 0, color: '#3b82f6' },
                            { name: 'Pending', value: stats?.tasks_pending || 0, color: '#f59e0b' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {[
                            { name: 'Completed', value: stats?.tasks_completed || 0, color: '#22c55e' },
                            { name: 'In Progress', value: stats?.tasks_in_progress || 0, color: '#3b82f6' },
                            { name: 'Pending', value: stats?.tasks_pending || 0, color: '#f59e0b' },
                          ].map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(4px)'
                          }}
                          formatter={(value) => [`${value} tasks`, 'Count']}
                        />
                        <Legend 
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{ right: 0 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Task List and Achievements */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-lg backdrop-blur-sm bg-white/80 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-blue-500" />
                          Recent Tasks
                        </CardTitle>
                        <CardDescription>Your assigned tasks with progress</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2 group">
                        View All
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredTasks.slice(0, 4).map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col md:flex-row md:items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-start gap-4">
                                  <div className={`p-3 rounded-xl bg-gradient-to-br ${task.color} shadow-md`}>
                                    {task.status === 'Completed' ? 
                                      <CheckCircle className="h-6 w-6 text-white" /> :
                                      task.status === 'In Progress' ? 
                                      <PlayCircle className="h-6 w-6 text-white" /> :
                                      <ClockIcon className="h-6 w-6 text-white" />
                                    }
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
                                      {renderPriorityBadge(task.priority)}
                                      <Badge variant="outline" className="text-xs border-gray-300">
                                        {task.category}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-600 mb-3">{task.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                      <span className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        Due: {task.deadline}
                                      </span>
                                      <span className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        {task.timeEstimate}
                                      </span>
                                      <span className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4" />
                                        {task.assignedBy}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {task.tags.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0 md:w-48">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-bold text-gray-900">{task.progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full bg-gradient-to-r ${task.color} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${task.progress}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                  />
                                </div>
                                <div className="flex justify-end mt-3">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 gap-2 hover:bg-gray-100"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Achievements Section */}
              <div>
                <Card className="border-none shadow-lg backdrop-blur-sm bg-white/80 overflow-hidden h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Achievements
                    </CardTitle>
                    <CardDescription>Track your progress and earn rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {achievements.map((achievement) => (
                        <div 
                          key={achievement.id}
                          className="group relative overflow-hidden rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${achievement.color} shadow-sm`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                              <p className="text-xs text-gray-500">{achievement.description}</p>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${achievement.color} rounded-full`}
                                    style={{ width: `${achievement.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          {achievement.progress === 100 && (
                            <div className="absolute top-2 right-2">
                              <Award className="h-5 w-5 text-amber-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-blue-700">Pro Tips</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Complete 3 more tasks this week to unlock the "Productivity Guru" badge!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      
      case 'tasks':
        return (
          <div className="space-y-6">
            {/* Enhanced Tasks Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">My Tasks</h2>
                <p className="text-blue-100 mb-6">Manage and track your assigned tasks with precision</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                    <Input 
                      placeholder="Search tasks..." 
                      className="pl-12 pr-4 py-6 bg-white/20 backdrop-blur-sm border-0 text-white placeholder-blue-200 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="lg" className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 gap-2 rounded-xl">
                    <Filter className="h-5 w-5" />
                    Filter
                  </Button>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 gap-2 rounded-xl shadow-lg">
                    <Plus className="h-5 w-5" />
                    New Task
                  </Button>
                </div>
              </div>
              {/* Background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </motion.div>
            
            {/* Enhanced Task Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
              <TabsList className="grid w-full md:w-auto grid-cols-4 bg-gray-100 p-1 rounded-2xl">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                >
                  All Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="in-progress"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                >
                  In Progress
                </TabsTrigger>
                <TabsTrigger 
                  value="pending"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                >
                  Completed
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={statusFilter} className="space-y-4 mt-6">
                <Card className="border-none shadow-xl backdrop-blur-sm bg-white/80 overflow-hidden">
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-6 border-b bg-gradient-to-r from-gray-50 to-white/50">
                      {['Task', 'Priority', 'Status', 'Deadline', 'Actions'].map((header, index) => (
                        <div key={index} className={`font-semibold text-gray-600 ${
                          index === 0 ? 'col-span-6 md:col-span-4' :
                          index < 3 ? 'col-span-3 md:col-span-2' :
                          index === 3 ? 'hidden md:block md:col-span-2' :
                          'hidden md:block md:col-span-2 text-right'
                        }`}>
                          {header}
                        </div>
                      ))}
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {filteredTasks.map((task: any, index: number) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="grid grid-cols-12 gap-4 p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group"
                        >
                          <div className="col-span-6 md:col-span-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${task.color}`}>
                                <ClipboardList className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {task.title}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 line-clamp-1">{task.description}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Users className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{task.assignedBy}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-3 md:col-span-2">
                            {renderPriorityBadge(task.priority)}
                          </div>
                          <div className="col-span-3 md:col-span-2">
                            {renderStatusBadge(task.status)}
                          </div>
                          <div className="hidden md:block md:col-span-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium">{task.deadline}</div>
                                <div className="text-xs text-gray-500">
                                  in {Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="hidden md:block md:col-span-2">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-600">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-9 w-9 rounded-full hover:bg-green-50 hover:text-green-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-9 w-9 rounded-full hover:bg-gray-100">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="shadow-xl rounded-xl">
                                  <DropdownMenuItem 
                                    className="gap-2"
                                    onClick={() => handleTaskStatusUpdate(task.id, 'done')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Clock className="h-4 w-4" />
                                    Request Extension
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Add Comment
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2 text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                    Remove Task
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );
      
      case 'submissions':
        return (
          <div className="space-y-6">
            {/* Enhanced Submissions Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Work Submissions</h2>
                <p className="text-green-100 mb-6">Upload and manage your work files with ease</p>
                <Button className="bg-white text-green-600 hover:bg-white/90 gap-2 shadow-lg rounded-xl">
                  <UploadCloud className="h-5 w-5" />
                  Upload New File
                </Button>
              </div>
              {/* Background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <Cloud className="absolute -bottom-4 -left-4 h-32 w-32 text-white/10" />
            </motion.div>
            
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Upload Area */}
              <Card className="lg:col-span-2 border-none shadow-xl backdrop-blur-sm bg-white/80 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderUp className="h-6 w-6 text-green-500" />
                    Upload Area
                  </CardTitle>
                  <CardDescription>Drag and drop or click to upload</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white/50"
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg"
                      >
                        <UploadCloud className="h-12 w-12 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Drop files here</h3>
                        <p className="text-sm text-gray-500 mt-1">or click to browse your device</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-2 border-2 gap-2 rounded-xl hover:border-green-500 hover:text-green-600"
                      >
                        <UploadCloud className="h-5 w-5" />
                        Browse Files
                      </Button>
                      <p className="text-xs text-gray-400">Supports: PDF, DOCX, XLSX, JPG, PNG (max. 10MB)</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
              
              {/* Upload Stats */}
              <Card className="border-none shadow-xl backdrop-blur-sm bg-white/80 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                    Upload Stats
                  </CardTitle>
                  <CardDescription>Your submission history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'Total Files', value: '42', icon: <FileText className="h-5 w-5" />, color: 'from-blue-500 to-cyan-500' },
                    { label: 'This Month', value: '8', icon: <Calendar className="h-5 w-5" />, color: 'from-purple-500 to-pink-500' },
                    { label: 'Storage Used', value: '156 MB', icon: <Cloud className="h-5 w-5" />, color: 'from-green-500 to-emerald-500' },
                    { label: 'Last Submission', value: '2 days ago', icon: <Clock className="h-5 w-5" />, color: 'from-amber-500 to-orange-500' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform`}>
                          <div className="text-white">{stat.icon}</div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                      </div>
                      <span className="font-bold text-gray-900">{stat.value}</span>
                    </motion.div>
                  ))}
                  <Separator />
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 rounded-xl hover:border-blue-500 hover:text-blue-600"
                    >
                      <Download className="h-5 w-5" />
                      Download All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Submissions */}
            <Card className="border-none shadow-xl backdrop-blur-sm bg-white/80 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-indigo-500" />
                  Recent Submissions
                </CardTitle>
                <CardDescription>Your recently uploaded files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: item * 0.1 }}
                    >
                      <Card className="border hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`p-3 rounded-xl ${
                                item % 3 === 0 ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                item % 3 === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 
                                'bg-gradient-to-br from-green-500 to-emerald-600'
                              } shadow-md`}>
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  Project_Deliverable_{item}.pdf
                                </h4>
                                <p className="text-sm text-gray-500">Uploaded {item} days ago</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs border-gray-300">PDF</Badge>
                                  <span className="text-xs text-gray-500">2.4 MB</span>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="shadow-xl rounded-xl">
                                <DropdownMenuItem className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Download className="h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Users className="h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'progress':
        return (
          <div className="space-y-6">
            {/* Progress Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
                <p className="text-purple-100">Track your productivity and performance metrics</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </motion.div>
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Tasks', value: stats?.total_tasks || 0, icon: <ClipboardList className="h-6 w-6" />, color: 'from-blue-500 to-cyan-500' },
                { label: 'Completed', value: stats?.tasks_completed || 0, icon: <CheckCircle className="h-6 w-6" />, color: 'from-green-500 to-emerald-500' },
                { label: 'In Progress', value: stats?.tasks_in_progress || 0, icon: <Activity className="h-6 w-6" />, color: 'from-amber-500 to-orange-500' },
                { label: 'Productivity', value: `${stats?.productivity || 0}%`, icon: <TrendingUp className="h-6 w-6" />, color: 'from-purple-500 to-pink-500' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          <p className="text-3xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                          {stat.icon}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {/* Productivity Chart */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Weekly Productivity</CardTitle>
                <CardDescription>Your task completion rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Streak Info */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{stats?.streak || 0} Day Streak! 🔥</h3>
                    <p className="text-gray-600">Keep up the great work!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'messages':
        return (
          <div className="space-y-6">
            {/* Messages Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-8 text-white"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Notifications</h2>
                <p className="text-green-100">Stay updated with your latest notifications</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </motion.div>
            {/* Notifications List */}
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-none shadow-lg ${notification.unread ? 'bg-blue-50' : 'bg-white'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{notification.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                              <p className="text-gray-600 mt-1">{notification.description}</p>
                              <p className="text-sm text-gray-400 mt-2">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <Badge className="bg-blue-500">New</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6">
            {/* Support Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Help & Support</h2>
                <p className="text-indigo-100">Get help and find answers to your questions</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </motion.div>
            {/* FAQ Section */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { q: 'How do I update my task status?', a: 'Click on the task, then use the dropdown menu to select "Mark Complete" or "Start Task".' },
                  { q: 'Where can I view my completed tasks?', a: 'Go to the Tasks tab and filter by "Completed" status.' },
                  { q: 'How is productivity calculated?', a: 'Productivity is calculated as (Completed Tasks / Total Tasks) × 100%.' },
                  { q: 'Can I upload files for my tasks?', a: 'Yes! Go to the Submissions tab to upload files related to your tasks.' },
                ].map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Contact Support */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Need More Help?</CardTitle>
                <CardDescription>Contact our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button className="flex-1 gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <HelpCircle className="h-5 w-5" />
                    View Guides
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Select an item to view details</h3>
            <p className="text-gray-500 mt-2 text-center max-w-md">Choose from the sidebar menu to get started with your dashboard</p>
          </motion.div>
        );
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/20 bg-white/80 backdrop-blur-xl z-10 shadow-2xl">
            {/* Logo and Brand */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="leading-tight">
                  <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    TeamFlow
                  </h2>
                  <p className="text-xs text-gray-500">Professional Suite</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              {/* Search */}
              <div className="relative mb-6 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 pr-3 py-2 text-sm h-10 bg-white/50 border-gray-200 hover:bg-white focus:bg-white focus:border-blue-500 transition-all rounded-xl shadow-sm"
                />
              </div>
              
              {/* Navigation */}
              <nav className="space-y-1.5 flex-1">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        activeTab === item.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.icon}
                      </div>
                      <span className="text-left">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        activeTab === item.id 
                          ? 'bg-white text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </nav>
              
              {/* User Profile */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar 
                      src="/placeholder-avatar.jpg" 
                      alt="User"
                      fallback={user?.username?.[0] || 'U'}
                      className="h-10 w-10 border-2 border-white shadow-md"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user?.username}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-y-auto md:ml-64 bg-gray-50">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-6 py-4 sticky top-0 z-40 shadow-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <div className="h-6 w-px bg-gray-200 mx-4"></div>
                </div>
                <p className="text-sm text-gray-500 hidden md:block font-medium">
                  {activeTab === 'overview' && 'Monitor your tasks and performance'}
                  {activeTab === 'tasks' && 'Manage your assigned tasks and deadlines'}
                  {activeTab === 'submissions' && 'Upload and track your work submissions'}
                  {activeTab === 'messages' && 'Communicate with your team'}
                  {activeTab === 'support' && 'Get help and support'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative hidden lg:block">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search tasks, messages..." 
                    className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-gray-200 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all duration-200"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full relative hover:bg-gray-100 transition-colors">
                      <Bell className="h-5 w-5 text-gray-600" />
                      <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 border-2 border-white"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 shadow-xl rounded-xl border-none">
                    <DropdownMenuLabel className="font-semibold">Notifications (3)</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${notification.unread ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-100'}`}>
                            <span className="text-sm">{notification.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-sm">{notification.title}</p>
                              {notification.unread && (
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => window.location.href = '/team-member-dashboard/settings'}
                >
                  <Settings className="h-5 w-5 text-gray-600" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50"
                    >
                      <Avatar 
                        src="/placeholder-avatar.jpg" 
                        alt="User"
                        fallback={user?.username?.[0] || 'U'}
                        className="h-10 w-10 border-2 border-white shadow-md"
                      />
                      <div className="hidden lg:block">
                        <p className="text-sm font-semibold">{user?.username}</p>
                        <p className="text-xs text-gray-500">Team Member</p>
                      </div>
                      <ChevronLeft className="h-4 w-4 text-gray-500 rotate-90" />
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 shadow-xl rounded-xl border-none">
                    <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 rounded-lg">
                      <Users className="h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => window.location.href = '/team-member-dashboard/settings'}>
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 rounded-lg">
                      <Users className="h-4 w-4" />
                      Team
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-red-600 rounded-lg">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            
            {/* Page Content */}
            <main className="p-4 lg:p-6 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
            
            {/* Footer */}
            <footer className="p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-xl mt-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-500">
                <div className="mb-4 md:mb-0 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse"></div>
                  <p>© 2024 TeamFlow. All rights reserved.</p>
                </div>
                <div className="flex items-center gap-6">
                  <a href="#" className="hover:text-gray-700 hover:underline transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-gray-700 hover:underline transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-gray-700 hover:underline transition-colors">Help Center</a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  export default TeamMemberDashboard;



