import { useState, useEffect } from 'react';
import { listOrders } from '../../../api/orders';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart2,
  ChevronDown,
  ArrowUpRight,
  FolderOpen,
  Calendar,
  FileBarChart2,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit2,
  BarChart3,
  Globe,
  Smartphone,
  Palette,
  Code,
  Activity,
} from 'lucide-react';

// Define types
type TeamMember = {
  name: string;
  role: string;
  avatarColor: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  startDate: string;
  dueDate: string;
  team: TeamMember[];
  lastUpdated: string;
  files: number;
  tasks: {
    total: number;
    completed: number;
  };
  budget: number;
  spent: number;
  priority: string;
  tags: string[];
  category: string;
};


// Enhanced status configuration
const statuses = {
  'in-progress': { 
    label: 'In Progress', 
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500', 
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Activity,
    description: 'Active development'
  },
  'in-review': { 
    label: 'In Review', 
    color: 'bg-gradient-to-r from-amber-500 to-yellow-500', 
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: Eye,
    description: 'Under review'
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-gradient-to-r from-emerald-500 to-green-500', 
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: CheckCircle2,
    description: 'Project finished'
  },
  'on-hold': { 
    label: 'On Hold', 
    color: 'bg-gradient-to-r from-gray-500 to-gray-400', 
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: AlertCircle,
    description: 'Temporarily paused'
  },
  planning: { 
    label: 'Planning', 
    color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: FileBarChart2,
    description: 'Planning phase'
  },
};

// Enhanced priorities
const priorities = {
  high: { 
    label: 'High', 
    color: 'bg-gradient-to-r from-red-500 to-rose-500', 
    bgColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  medium: { 
    label: 'Medium', 
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500', 
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  low: { 
    label: 'Low', 
    color: 'bg-gradient-to-r from-green-500 to-emerald-500', 
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
};

// Category icons
const categoryIcons = {
  'web-development': Globe,
  'mobile': Smartphone,
  'design': Palette,
  'marketing': TrendingUp,
  'development': Code,
  'analytics': BarChart3,
};

// Project Card Component - Premium Admin Style
const ProjectCard = ({ project }: { project: Project }) => {
  const status = statuses[project.status as keyof typeof statuses];
  const priority = priorities[project.priority as keyof typeof priorities];
  const CategoryIcon = categoryIcons[project.category as keyof typeof categoryIcons] || FolderOpen;
  const daysLeft = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:scale-[1.02] hover:-translate-y-1">
      {/* Floating gradient blur element */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#2563EB]/10 to-[#1E40AF]/10 rounded-full blur-3xl group-hover:from-[#2563EB]/20 group-hover:to-[#1E40AF]/20 transition-all duration-700"></div>
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/0 via-[#1E40AF]/0 to-[#2563EB]/0 group-hover:from-[#2563EB]/3 group-hover:via-[#1E40AF]/3 group-hover:to-[#2563EB]/3 transition-all duration-700"></div>
      
      {/* Card Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-md group-hover:shadow-lg transition-shadow">
              <CategoryIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${status.bgColor} ${status.textColor} shadow-sm`}>
                  <status.icon className="h-3 w-3 mr-1" />
                  {status.label}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${priority.bgColor} ${priority.textColor} shadow-sm`}>
                  {priority.label}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Progress Section - Enhanced */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            <span>Project Progress</span>
            <span className="text-gray-900 dark:text-white">{project.progress}%</span>
          </div>
          <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div 
              className={`absolute inset-y-0 left-0 rounded-full ${status.color} shadow-lg transition-all duration-700 ease-out`}
              style={{ width: `${project.progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {project.tasks.completed}/{project.tasks.total} tasks completed
            </span>
            <span className={`text-xs font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
              {isOverdue ? `⚠️ Overdue by ${-daysLeft} days` : `📅 ${daysLeft} days left`}
            </span>
          </div>
        </div>

        {/* Team & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-3">
            {project.team.slice(0, 4).map((member, i) => (
              <div 
                key={i} 
                className={`${member.avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white border-3 border-white dark:border-gray-800 shadow-lg hover:scale-110 hover:z-10 transition-transform cursor-pointer`}
                title={`${member.name} - ${member.role}`}
              >
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
            {project.team.length > 4 && (
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 border-3 border-white dark:border-gray-800 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title={`+${project.team.length - 4} more team members`}
              >
                +{project.team.length - 4}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110 shadow-sm hover:shadow-md">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all hover:scale-110 shadow-sm hover:shadow-md">
              <Edit2 className="h-4 w-4" />
            </button>
            <button className="p-2.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all hover:scale-110 shadow-sm hover:shadow-md">
              <BarChart2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer - Enhanced */}
      <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-gray-50 via-gray-100/80 to-gray-50 dark:from-gray-800/50 dark:via-gray-700/50 dark:to-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Due {new Date(project.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {project.files} files
            </span>
          </div>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center group/btn">
          View Details
          <ArrowUpRight className="ml-1.5 h-4 w-4 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
        </button>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#1E40AF] to-[#2563EB] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      
      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

// Enhanced Project Filters
const ProjectFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  priorityFilter, 
  setPriorityFilter,
  viewMode,
  setViewMode
}: { 
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string[];
  setStatusFilter: (status: string[] | ((prev: string[]) => string[])) => void;
  priorityFilter: string[];
  setPriorityFilter: (priority: string[] | ((prev: string[]) => string[])) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const toggleStatus = (status: string) => {
    setStatusFilter((prev: string[]) => 
      prev.includes(status) 
        ? prev.filter((s: string) => s !== status)
        : [...prev, status]
    );
  };

  const togglePriority = (priority: string) => {
    setPriorityFilter((prev: string[]) => 
      prev.includes(priority)
        ? prev.filter((p: string) => p !== priority)
        : [...prev, priority]
    );
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage all your ongoing projects
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Filter by Status</h4>
                    <button 
                      onClick={() => setStatusFilter([])}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statuses).map(([key, { label, bgColor, textColor }]) => (
                      <button
                        key={key}
                        onClick={() => toggleStatus(key)}
                        className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          statusFilter.includes(key)
                            ? `${bgColor} ${textColor}`
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Filter by Priority</h4>
                    <button 
                      onClick={() => setPriorityFilter([])}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    {Object.entries(priorities).map(([key, { label, bgColor, textColor }]) => (
                      <button
                        key={key}
                        onClick={() => togglePriority(key)}
                        className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          priorityFilter.includes(key)
                            ? `${bgColor} ${textColor}`
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* View Toggle */}
          <div className="hidden md:flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Grid view"
            >
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded ${viewMode === 'grid' ? 'bg-current' : 'bg-gray-400 dark:bg-gray-500'}`}></div>
                ))}
              </div>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="List view"
            >
              <div className="flex flex-col space-y-0.5 w-4 h-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-full h-0.5 rounded ${viewMode === 'list' ? 'bg-current' : 'bg-gray-400 dark:bg-gray-500'}`}></div>
                ))}
              </div>
            </button>
          </div>
          
          {/* New Project Button */}
          <button className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            New Project
          </button>
        </div>
      </div>
      
      {/* Active Filters */}
      {(statusFilter.length > 0 || priorityFilter.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statusFilter.map(status => {
            const statusConfig = statuses[status as keyof typeof statuses];
            return (
              <span key={status} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.label}
                <button 
                  onClick={() => toggleStatus(status)}
                  className="ml-2 p-0.5 rounded hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          
          {priorityFilter.map(priority => {
            const priorityConfig = priorities[priority as keyof typeof priorities];
            return (
              <span key={priority} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${priorityConfig.bgColor} ${priorityConfig.textColor}`}>
                {priorityConfig.label} Priority
                <button 
                  onClick={() => togglePriority(priority)}
                  className="ml-2 p-0.5 rounded hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          
          <button 
            onClick={() => {
              setStatusFilter([]);
              setPriorityFilter([]);
            }}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Enhanced Stats Cards
const StatsCard = ({ title, value, icon: Icon, change, color }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="flex items-baseline mt-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <span className={`ml-3 flex items-center text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await listOrders();
      const orders = Array.isArray(response.data) ? response.data : [];
      
      // Transform orders into projects
      const transformedProjects: Project[] = orders.map((order: any) => ({
        id: order.id,
        name: order.service_title || `Order #${order.id}`,
        description: order.requirements || 'No description provided',
        status: mapOrderStatusToProjectStatus(order.status),
        progress: getProgressFromStatus(order.status),
        startDate: order.created_at,
        dueDate: order.delivery_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        team: [],
        lastUpdated: order.updated_at || order.created_at,
        files: 0,
        tasks: {
          total: 10,
          completed: Math.floor(getProgressFromStatus(order.status) / 10)
        },
        budget: order.total_price || 0,
        spent: order.status === 'completed' || order.status === 'closed' ? order.total_price || 0 : Math.floor((order.total_price || 0) * (getProgressFromStatus(order.status) / 100)),
        priority: order.status === 'pending' ? 'high' : 'medium',
        tags: [order.service_title || 'service'],
        category: 'web-development'
      }));
      
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapOrderStatusToProjectStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'planning',
      'approved': 'in-progress',
      'in_progress': 'in-progress',
      '25_done': 'in-progress',
      '50_done': 'in-progress',
      '75_done': 'in-progress',
      'ready_for_delivery': 'in-review',
      'delivered': 'completed',
      'completed': 'completed',
      'closed': 'completed',
      'payment_done': 'completed'
    };
    return statusMap[status] || 'planning';
  };

  const getProgressFromStatus = (status: string): number => {
    const progressMap: Record<string, number> = {
      'pending': 0,
      'approved': 10,
      'estimation_sent': 15,
      'in_progress': 25,
      '25_done': 25,
      '50_done': 50,
      '75_done': 75,
      'ready_for_delivery': 90,
      'delivered': 95,
      'payment_pending': 97,
      'payment_done': 100,
      'completed': 100,
      'closed': 100
    };
    return progressMap[status] || 0;
  };

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(project.status);
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(project.priority);
    
    const matchesActiveFilter = activeFilter === 'all' || 
      (activeFilter === 'active' && project.status === 'in-progress') ||
      (activeFilter === 'completed' && project.status === 'completed') ||
      (activeFilter === 'upcoming' && project.status === 'planning');
    
    return matchesSearch && matchesStatus && matchesPriority && matchesActiveFilter;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent">
          Project Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track progress, manage teams, and monitor project performance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Projects" 
          value={totalProjects} 
          icon={FolderOpen} 
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard 
          title="Active Projects" 
          value={activeProjects} 
          icon={Activity} 
          change={12}
          color="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatsCard 
          title="Avg. Progress" 
          value={`${avgProgress}%`} 
          icon={TrendingUp} 
          color="bg-gradient-to-br from-purple-500 to-pink-600"
        />
        <StatsCard 
          title="Budget Usage" 
          value={`$${(totalSpent/1000).toFixed(1)}K`} 
          icon={BarChart3} 
          change={-5}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* Filters */}
      <ProjectFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { name: 'All Projects', value: 'all', count: totalProjects },
              { name: 'Active', value: 'active', count: activeProjects },
              { name: 'Completed', value: 'completed', count: completedProjects },
              { name: 'Upcoming', value: 'upcoming', count: projects.filter(p => p.status === 'planning').length },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeFilter === tab.value
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium ${
                      activeFilter === tab.value
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <FolderOpen className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No projects found</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            No projects match your current filters. Try adjusting your search or create a new project.
          </p>
          <button className="mt-6 inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create New Project
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* List view implementation */}
          <div className="p-6 grid gap-4">
            {filteredProjects.map(project => (
              <div key={project.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FolderOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Import CSS module for animations */}
      <style>{`
        /* Global styles can go here if needed */
        
        .animate-fadeIn {
          animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
}