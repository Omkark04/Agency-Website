
import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Zap,
  Target,
  Layers,
  Clock,
  Users,
  ChevronRight,
  ExternalLink,
  Shield,
  Award,
  Rocket,
  LineChart,
} from 'lucide-react';

// Define types (unchanged)
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

// Premium status configuration with animated effects
const statuses = {
  'in-progress': {
    label: 'In Progress',
    color: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600',
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    textColor: 'text-blue-600 dark:text-blue-300',
    bgColor: 'bg-gradient-to-br from-blue-50/90 to-blue-100/70 dark:from-blue-900/30 dark:to-blue-800/40',
    icon: Activity,
    description: 'Active development',
    borderColor: 'border-blue-200/80 dark:border-blue-700/60',
    pulse: true,
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  },
  'in-review': {
    label: 'In Review',
    color: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600',
    gradient: 'from-amber-500 via-yellow-500 to-amber-600',
    textColor: 'text-amber-600 dark:text-amber-300',
    bgColor: 'bg-gradient-to-br from-amber-50/90 to-yellow-100/70 dark:from-amber-900/30 dark:to-yellow-800/40',
    icon: Eye,
    description: 'Under review',
    borderColor: 'border-amber-200/80 dark:border-amber-700/60',
    pulse: false,
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  },
  completed: {
    label: 'Completed',
    color: 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600',
    gradient: 'from-emerald-500 via-green-500 to-emerald-600',
    textColor: 'text-emerald-600 dark:text-emerald-300',
    bgColor: 'bg-gradient-to-br from-emerald-50/90 to-green-100/70 dark:from-emerald-900/30 dark:to-green-800/40',
    icon: CheckCircle2,
    description: 'Project finished',
    borderColor: 'border-emerald-200/80 dark:border-emerald-700/60',
    pulse: false,
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  },
  'on-hold': {
    label: 'On Hold',
    color: 'bg-gradient-to-r from-gray-500 via-gray-400 to-gray-600',
    gradient: 'from-gray-500 via-gray-400 to-gray-600',
    textColor: 'text-gray-600 dark:text-gray-300',
    bgColor: 'bg-gradient-to-br from-gray-50/90 to-gray-100/70 dark:from-gray-800/30 dark:to-gray-700/40',
    icon: AlertCircle,
    description: 'Temporarily paused',
    borderColor: 'border-gray-200/80 dark:border-gray-600/60',
    pulse: false,
    glow: 'shadow-[0_0_20px_rgba(75,85,99,0.3)]',
  },
  planning: {
    label: 'Planning',
    color: 'bg-gradient-to-r from-purple-500 via-pink-400 to-purple-600',
    gradient: 'from-purple-500 via-pink-500 to-purple-600',
    textColor: 'text-purple-600 dark:text-purple-300',
    bgColor: 'bg-gradient-to-br from-purple-50/90 to-pink-100/70 dark:from-purple-900/30 dark:to-pink-800/40',
    icon: FileBarChart2,
    description: 'Planning phase',
    borderColor: 'border-purple-200/80 dark:border-purple-700/60',
    pulse: false,
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  },
};

// Premium priorities with animated effects
const priorities = {
  high: {
    label: 'High',
    color: 'bg-gradient-to-r from-red-500 via-rose-400 to-red-600',
    gradient: 'from-red-500 via-rose-500 to-red-600',
    bgColor: 'bg-gradient-to-br from-red-50/90 to-rose-100/70 dark:from-red-900/30 dark:to-rose-800/40',
    textColor: 'text-red-600 dark:text-red-300',
    borderColor: 'border-red-200/80 dark:border-red-700/60',
    icon: Zap,
    animate: 'animate-pulse',
    glow: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]',
  },
  medium: {
    label: 'Medium',
    color: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600',
    gradient: 'from-yellow-500 via-amber-500 to-yellow-600',
    bgColor: 'bg-gradient-to-br from-yellow-50/90 to-amber-100/70 dark:from-yellow-900/30 dark:to-amber-800/40',
    textColor: 'text-yellow-600 dark:text-yellow-300',
    borderColor: 'border-yellow-200/80 dark:border-yellow-700/60',
    icon: Clock,
    animate: '',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  },
  low: {
    label: 'Low',
    color: 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-600',
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    bgColor: 'bg-gradient-to-br from-green-50/90 to-emerald-100/70 dark:from-green-900/30 dark:to-emerald-800/40',
    textColor: 'text-green-600 dark:text-green-300',
    borderColor: 'border-green-200/80 dark:border-green-700/60',
    icon: Layers,
    animate: '',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  },
};

// Category icons with premium styling
const categoryIcons = {
  'web-development': { icon: Globe, color: 'from-blue-500 to-cyan-500' },
  'mobile': { icon: Smartphone, color: 'from-purple-500 to-pink-500' },
  'design': { icon: Palette, color: 'from-rose-500 to-pink-500' },
  'marketing': { icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
  'development': { icon: Code, color: 'from-indigo-500 to-blue-500' },
  'analytics': { icon: BarChart3, color: 'from-amber-500 to-orange-500' },
};

// Floating particles system for premium background
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${15 + Math.random() * 10}s`,
        }}
      />
    ))}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-0.5 h-0.5 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full animate-float-slow"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.7}s`,
          animationDuration: `${20 + Math.random() * 15}s`,
        }}
      />
    ))}
  </div>
);

// Ultra Premium Project Card Component
const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const status = statuses[project.status as keyof typeof statuses];
  const priority = priorities[project.priority as keyof typeof priorities];
  const category = categoryIcons[project.category as keyof typeof categoryIcons] || { icon: FolderOpen, color: 'from-gray-500 to-gray-600' };
  const CategoryIcon = category.icon;
  const daysLeft = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 border border-white/20 dark:border-gray-700/30 hover:scale-[1.02] hover:-translate-y-3 animate-card-enter"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'backwards',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-blue-50/30 dark:from-gray-900/50 dark:via-transparent dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Hover glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${category.color} rounded-3xl opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-700`} />
      
      {/* Animated border ring */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-400/20 transition-all duration-500" />
      
      {/* Card Header */}
      <div className="relative z-10 p-7 pb-5">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start space-x-4">
            {/* Animated category icon */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500 ${isHovered ? 'scale-110' : ''}`} />
              <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 shadow-xl border border-white/40 dark:border-gray-700/40 transition-all duration-500 group-hover:shadow-2xl">
                <CategoryIcon className={`h-7 w-7 bg-gradient-to-r ${category.color} bg-clip-text text-transparent transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Project title with gradient animation */}
              <div className="relative">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text transition-all duration-500 truncate">
                  {project.name}
                </h3>
                <Sparkles className="absolute -right-6 top-1.5 h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-sparkle" />
              </div>
              
              {/* Status and priority badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl ${status.bgColor} ${status.textColor} border ${status.borderColor} backdrop-blur-sm transition-all duration-500 group-hover:scale-105 ${status.pulse ? 'animate-glow' : ''}`}>
                  <status.icon className="h-3.5 w-3.5 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                  {status.label}
                  <div className={`ml-2 w-1.5 h-1.5 rounded-full ${status.color} ${status.pulse ? 'animate-ping' : ''}`} />
                </span>
                <span className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl ${priority.bgColor} ${priority.textColor} border ${priority.borderColor} backdrop-blur-sm transition-all duration-500 group-hover:scale-105 ${priority.animate}`}>
                  <priority.icon className="h-3.5 w-3.5 mr-1.5" />
                  {priority.label}
                </span>
              </div>
            </div>
          </div>
          
          {/* Animated action button */}
          <button className="relative p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-500 hover:scale-110 active:scale-95 backdrop-blur-sm group/action shadow-lg hover:shadow-xl">
            <MoreVertical className="h-5 w-5 transition-transform duration-500 group-hover/action:rotate-90" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 rounded-xl group-hover/action:from-blue-400/20 group-hover/action:via-blue-400/10 group-hover/action:to-blue-400/20 transition-all duration-500" />
          </button>
        </div>

        {/* Description with animated gradient text */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-7 line-clamp-2 leading-relaxed tracking-wide group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-500">
          {project.description}
        </p>

        {/* Enhanced Progress Section with animation */}
        <div className="mb-8 relative">
          <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
            <span className="tracking-wide flex items-center">
              <Target className="h-3.5 w-3.5 mr-2 text-blue-400" />
              Project Progress
            </span>
            <span className="text-gray-900 dark:text-white font-bold animate-count-up" data-value={project.progress}>
              0%
            </span>
          </div>
          <div className="relative w-full bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-full h-2.5 overflow-hidden shadow-inner backdrop-blur-sm">
            {/* Progress bar background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 blur opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Animated progress bar */}
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${status.color} shadow-xl transition-all duration-1500 ease-out`}
              style={{ width: `${project.progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 blur opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            
            {/* Progress nodes */}
            {[25, 50, 75, 100].map((node) => (
              <div
                key={node}
                className={`absolute top-1/2 w-1.5 h-1.5 rounded-full transform -translate-y-1/2 transition-all duration-500 ${
                  project.progress >= node ? 'bg-white shadow-lg' : 'bg-gray-300 dark:bg-gray-600'
                } ${project.progress === node ? 'scale-150' : ''}`}
                style={{ left: `${node}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
              {project.tasks.completed}/{project.tasks.total} tasks completed
            </span>
            <span className={`text-xs font-semibold flex items-center ${isOverdue ? 'text-red-500 dark:text-red-400 animate-pulse' : 'text-gray-600 dark:text-gray-300'}`}>
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {isOverdue ? `⚠️ Overdue by ${-daysLeft} days` : `📅 ${daysLeft} days left`}
            </span>
          </div>
        </div>

        {/* Premium Team & Actions Section */}
        <div className="flex items-center justify-between">
          {/* Animated team avatars */}
          <div className="flex -space-x-2.5">
            {project.team.slice(0, 4).map((member, i) => (
              <div
                key={i}
                className={`relative ${member.avatarColor} w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white border-3 border-white dark:border-gray-800 shadow-xl hover:scale-125 hover:z-20 transition-all duration-500 cursor-pointer transform-gpu group/avatar`}
                title={`${member.name} - ${member.role}`}
              >
                {member.name.split(' ').map(n => n[0]).join('')}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-hover/avatar:from-white/20 group-hover/avatar:via-white/10 group-hover/avatar:to-white/20 transition-all duration-500" />
              </div>
            ))}
            {project.team.length > 4 && (
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 border-3 border-white dark:border-gray-800 shadow-xl hover:scale-125 transition-all duration-500 cursor-pointer transform-gpu group/more">
                +{project.team.length - 4}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-hover/more:from-white/20 group-hover/more:via-white/10 group-hover/more:to-white/20 transition-all duration-500" />
              </div>
            )}
          </div>

          {/* Premium action buttons */}
          <div className="flex space-x-2">
            <button className="relative p-3 text-gray-500 hover:text-blue-500 hover:bg-gradient-to-br from-blue-50 to-blue-100/50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl backdrop-blur-sm group/eye">
              <Eye className="h-4.5 w-4.5 transition-transform duration-500 group-hover/eye:scale-125" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 rounded-xl group-hover/eye:from-blue-400/20 group-hover/eye:via-blue-400/10 group-hover/eye:to-blue-400/20 transition-all duration-500" />
            </button>
            <button className="relative p-3 text-gray-500 hover:text-emerald-500 hover:bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:hover:bg-emerald-900/30 rounded-xl transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl backdrop-blur-sm group/edit">
              <Edit2 className="h-4.5 w-4.5 transition-transform duration-500 group-hover/edit:scale-125" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400/0 via-emerald-400/0 to-emerald-400/0 rounded-xl group-hover/edit:from-emerald-400/20 group-hover/edit:via-emerald-400/10 group-hover/edit:to-emerald-400/20 transition-all duration-500" />
            </button>
            <button className="relative p-3 text-gray-500 hover:text-rose-500 hover:bg-gradient-to-br from-rose-50 to-rose-100/50 dark:hover:bg-rose-900/30 rounded-xl transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl backdrop-blur-sm group/chart">
              <BarChart2 className="h-4.5 w-4.5 transition-transform duration-500 group-hover/chart:scale-125" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-400/0 via-rose-400/0 to-rose-400/0 rounded-xl group-hover/chart:from-rose-400/20 group-hover/chart:via-rose-400/10 group-hover/chart:to-rose-400/20 transition-all duration-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Premium Card Footer */}
      <div className="relative z-10 px-7 py-5 bg-gradient-to-r from-gray-50/80 via-gray-100/60 to-gray-50/80 dark:from-gray-800/70 dark:via-gray-700/70 dark:to-gray-800/70 border-t border-gray-200/30 dark:border-gray-700/30 flex justify-between items-center backdrop-blur-xl">
        {/* Animated footer content */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2.5 group/date">
            <div className="relative p-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transition-all duration-500 group-hover/date:scale-110">
              <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 group-hover/date:from-blue-400/10 group-hover/date:via-blue-400/5 group-hover/date:to-blue-400/10 transition-all duration-500" />
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wide group-hover/date:text-gray-900 dark:group-hover/date:text-white transition-colors duration-500">
              Due {new Date(project.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2.5 group/files">
            <div className="relative p-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg transition-all duration-500 group-hover/files:scale-110">
              <FileText className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/0 to-purple-400/0 group-hover/files:from-purple-400/10 group-hover/files:via-purple-400/5 group-hover/files:to-purple-400/10 transition-all duration-500" />
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wide group-hover/files:text-gray-900 dark:group-hover/files:text-white transition-colors duration-500">
              {project.files} files
            </span>
          </div>
        </div>
        
        {/* Animated view details button */}
        <button className="group/btn relative text-sm font-bold text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text hover:from-blue-600 hover:to-cyan-600 dark:from-blue-400 dark:to-cyan-400 dark:hover:from-blue-300 dark:hover:to-cyan-300 flex items-center transition-all duration-500">
          View Details
          <div className="relative ml-3">
            <ArrowUpRight className="h-5 w-5 transform transition-all duration-500 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 group-hover/btn:scale-125" />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded blur opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
          </div>
        </button>
      </div>
      
      {/* Animated bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
      
      {/* Floating ribbon for high priority */}
      {project.priority === 'high' && (
        <div className="absolute -top-2 -right-2">
          <div className="relative">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl animate-bounce-slow">
              <Zap className="h-3.5 w-3.5 inline mr-1.5" />
              URGENT
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-rose-600/30 rounded-lg blur animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};

// Premium Floating Action Button
const FloatingActionButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button className="fixed bottom-8 right-8 z-50 group/fab">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover/fab:opacity-70 transition-opacity duration-500" />
        
        {/* Main button */}
        <div
          className={`relative flex items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-2xl transition-all duration-500 transform ${isHovered ? 'scale-105' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Plus className="h-6 w-6 mr-3 transition-transform duration-500 group-hover/fab:rotate-90" />
          <span className="tracking-wide">New Project</span>
          
          {/* Sparkle effect */}
          {isHovered && (
            <>
              <Sparkles className="absolute -top-2 -left-2 h-4 w-4 text-yellow-300 animate-spin" />
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300 animate-spin" style={{ animationDelay: '0.2s' }} />
              <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-yellow-300 animate-spin" style={{ animationDelay: '0.4s' }} />
              <Sparkles className="absolute -bottom-2 -right-2 h-4 w-4 text-yellow-300 animate-spin" style={{ animationDelay: '0.6s' }} />
            </>
          )}
        </div>
        
        {/* Floating animation */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-cyan-400/0 to-blue-400/0 group-hover/fab:from-blue-400/20 group-hover/fab:via-cyan-400/10 group-hover/fab:to-blue-400/20 transition-all duration-500 animate-float" />
      </div>
    </button>
  );
};

// Premium Stats Card with advanced animations
const StatsCard = ({ title, value, icon: Icon, change, color, index, trend }: any) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const finalValue = typeof value === 'string' ? parseInt(value) : value;
      const increment = finalValue / 30;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
          setCount(finalValue);
          clearInterval(counter);
        } else {
          setCount(Math.floor(current));
        }
      }, 30);
      
      return () => clearInterval(counter);
    }, index * 200);
    
    return () => clearTimeout(timer);
  }, [value, index]);

  return (
    <div
      className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-3xl p-7 shadow-2xl border border-white/20 dark:border-gray-700/30 hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 animate-stats-enter"
      style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'backwards' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-gray-100/5 dark:from-gray-900/5 dark:to-gray-800/5 rounded-3xl" />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-2">{title}</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {typeof value === 'string' ? value : count.toLocaleString()}
              </p>
              {change && (
                <span className={`ml-4 flex items-center text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${change > 0 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
                  {change > 0 ? <TrendingUp className="h-4 w-4 mr-1.5" /> : <TrendingDown className="h-4 w-4 mr-1.5" />}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
          </div>
          <div className={`relative p-4 rounded-2xl ${color} shadow-2xl transition-transform duration-700 hover:scale-110 hover:rotate-12`}>
            <Icon className="h-7 w-7 text-white" />
            {/* Icon glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 hover:from-white/20 hover:via-white/10 hover:to-white/20 transition-all duration-500" />
          </div>
        </div>
        
        {/* Animated trend line */}
        {trend && (
          <div className="mt-6 relative h-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:via-blue-400/10 group-hover:to-blue-400/20 transition-all duration-500" />
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
              style={{ width: `${trend}%` }}
            />
            {/* Trend shimmer */}
            <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        )}
      </div>
    </div>
  );
};

// Premium Header with animated gradient
const PremiumHeader = () => {
  return (
    <div className="mb-10 relative">
      {/* Animated background gradient */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl blur-3xl animate-gradient" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent animate-text-gradient tracking-tight">
              Project Management
              <Rocket className="inline ml-4 h-8 w-8 text-blue-500 animate-float" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg tracking-wide leading-relaxed max-w-2xl">
              Track progress, manage teams, and monitor project performance in real-time with our advanced dashboard
            </p>
          </div>
          
          {/* Premium badges */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30">
              <Shield className="h-5 w-5 text-emerald-500 mr-2.5" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Secure</span>
            </div>
            <div className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-800/20 rounded-xl backdrop-blur-sm border border-blue-200/30 dark:border-cyan-700/30">
              <Award className="h-5 w-5 text-blue-500 mr-2.5" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Premium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced ProjectFilters component with premium animations
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
  const searchRef = useRef<HTMLInputElement>(null);

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
    <div className="mb-10 relative">
      {/* Animated filter section background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-gray-50/50 to-blue-50/30 dark:from-gray-900/30 dark:to-blue-900/10 rounded-3xl blur-2xl" />
      
      <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-7 shadow-2xl border border-white/20 dark:border-gray-700/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight">
              Project Portfolio
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 tracking-wide flex items-center">
              <LineChart className="h-4 w-4 mr-2 text-blue-400 animate-pulse" />
              Advanced filtering and real-time analytics
            </p>
          </div>
         
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Premium Search with floating animation */}
            <div className="relative flex-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-xl blur opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-500" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search projects, teams, or keywords..."
                  className="pl-12 pr-6 py-3.5 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-full transition-all duration-500 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:shadow-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-300"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
           
            {/* Premium Filter Button with dropdown animation */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-3 px-5 py-3.5 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 text-sm hover:bg-white dark:hover:bg-gray-700 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl active:scale-95 group/filter"
              >
                <Filter className="h-5 w-5 transition-transform duration-500 group-hover/filter:rotate-180" />
                <span className="font-semibold">Filters</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${showFilters ? 'rotate-180' : ''}`} />
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {statusFilter.length + priorityFilter.length}
                </span>
              </button>
             
              {/* Premium Filter Dropdown */}
              {showFilters && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-3xl border border-gray-200/50 dark:border-gray-700/50 z-50 animate-dropdown backdrop-blur-xl">
                  <div className="p-5 border-b border-gray-100/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="font-bold text-gray-900 dark:text-white tracking-tight">Status Filters</h4>
                      <button
                        onClick={() => setStatusFilter([])}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(statuses).map(([key, { label, bgColor, textColor }]) => (
                        <button
                          key={key}
                          onClick={() => toggleStatus(key)}
                          className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                            statusFilter.includes(key)
                              ? `${bgColor} ${textColor} shadow-lg border`
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 border border-transparent'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                 
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="font-bold text-gray-900 dark:text-white tracking-tight">Priority Filters</h4>
                      <button
                        onClick={() => setPriorityFilter([])}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex gap-3">
                      {Object.entries(priorities).map(([key, { label, bgColor, textColor, icon: Icon }]) => (
                        <button
                          key={key}
                          onClick={() => togglePriority(key)}
                          className={`flex-1 flex flex-col items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                            priorityFilter.includes(key)
                              ? `${bgColor} ${textColor} shadow-lg border`
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 border border-transparent'
                          }`}
                        >
                          <Icon className="h-4 w-4 mb-2" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
           
            {/* Premium View Toggle */}
            <div className="hidden md:flex items-center border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/90 dark:bg-gray-800/90 overflow-hidden backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3.5 transition-all duration-500 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:text-gray-700 dark:hover:text-gray-300'}`}
                title="Grid view"
              >
                <div className="grid grid-cols-2 gap-0.5 w-5 h-5 transform transition-transform duration-500 hover:scale-110">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded transition-all duration-500 ${viewMode === 'grid' ? 'bg-current' : 'bg-gray-400 dark:bg-gray-500'}`} />
                  ))}
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3.5 transition-all duration-500 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:text-gray-700 dark:hover:text-gray-300'}`}
                title="List view"
              >
                <div className="flex flex-col space-y-0.5 w-5 h-5 transform transition-transform duration-500 hover:scale-110">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-full h-0.5 rounded transition-all duration-500 ${viewMode === 'list' ? 'bg-current' : 'bg-gray-400 dark:bg-gray-500'}`} />
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
       
        {/* Premium Active Filters */}
        {(statusFilter.length > 0 || priorityFilter.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 mb-4 animate-slideDown">
            {statusFilter.map(status => {
              const statusConfig = statuses[status as keyof typeof statuses];
              return (
                <span
                  key={status}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor} backdrop-blur-sm transition-all duration-500 transform hover:scale-105`}
                >
                  {statusConfig.label}
                  <button
                    onClick={() => toggleStatus(status)}
                    className="ml-2.5 p-1 rounded-lg hover:bg-white/20 transition-colors duration-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
           
            {priorityFilter.map(priority => {
              const priorityConfig = priorities[priority as keyof typeof priorities];
              return (
                <span
                  key={priority}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${priorityConfig.bgColor} ${priorityConfig.textColor} border ${priorityConfig.borderColor} backdrop-blur-sm transition-all duration-500 transform hover:scale-105`}
                >
                  <priorityConfig.icon className="h-3.5 w-3.5 mr-2" />
                  {priorityConfig.label} Priority
                  <button
                    onClick={() => togglePriority(priority)}
                    className="ml-2.5 p-1 rounded-lg hover:bg-white/20 transition-colors duration-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
           
            <button
              onClick={() => {
                setStatusFilter([]);
                setPriorityFilter([]);
              }}
              className="text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-300 tracking-wide flex items-center"
            >
              Clear all filters
              <ChevronRight className="h-4 w-4 ml-1.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
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
     
      const transformedProjects: Project[] = orders.map((order: any) => ({
        id: order.id,
        name: order.service_title || `Order #${order.id}`,
        description: order.requirements || 'No description provided',
        status: mapOrderStatusToProjectStatus(order.status),
        progress: getProgressFromStatus(order.status),
        startDate: order.created_at,
        dueDate: order.delivery_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        team: generateTeam(),
        lastUpdated: order.updated_at || order.created_at,
        files: Math.floor(Math.random() * 20) + 5,
        tasks: {
          total: 10,
          completed: Math.floor(getProgressFromStatus(order.status) / 10)
        },
        budget: order.total_price || 0,
        spent: order.status === 'completed' || order.status === 'closed' ? order.total_price || 0 : Math.floor((order.total_price || 0) * (getProgressFromStatus(order.status) / 100)),
        priority: order.status === 'pending' ? 'high' : ['medium', 'low'][Math.floor(Math.random() * 2)],
        tags: [order.service_title || 'service'],
        category: ['web-development', 'mobile', 'design', 'marketing', 'development', 'analytics'][Math.floor(Math.random() * 6)]
      }));
     
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTeam = (): TeamMember[] => {
    const names = ['Alex Chen', 'Sam Rivera', 'Jordan Lee', 'Taylor Kim', 'Morgan Wells', 'Casey Smith'];
    const roles = ['Lead Dev', 'Designer', 'PM', 'QA', 'DevOps', 'Analyst']
    const colors = ['bg-gradient-to-br from-blue-500 to-cyan-500', 'bg-gradient-to-br from-purple-500 to-pink-500', 'bg-gradient-to-br from-emerald-500 to-green-500', 'bg-gradient-to-br from-amber-500 to-orange-500', 'bg-gradient-to-br from-rose-500 to-pink-500', 'bg-gradient-to-br from-indigo-500 to-blue-500']
    
    const teamSize = Math.floor(Math.random() * 3) + 3
    return Array.from({ length: teamSize }, (_, i) => ({
      name: names[i % names.length],
      role: roles[i % roles.length],
      avatarColor: colors[i % colors.length]
    }))
  }

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

  // Premium Filter Tabs
  const FilterTabs = () => (
    <div className="mb-10 relative">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/20 dark:border-gray-700/30">
        <nav className="flex space-x-2">
          {[
            { name: 'All Projects', value: 'all', count: totalProjects, icon: Layers },
            { name: 'Active', value: 'active', count: activeProjects, icon: Activity },
            { name: 'Completed', value: 'completed', count: completedProjects, icon: CheckCircle2 },
            { name: 'Upcoming', value: 'upcoming', count: projects.filter(p => p.status === 'planning').length, icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-500 relative group ${
                  activeFilter === tab.value
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 transition-transform duration-500 ${activeFilter === tab.value ? 'scale-110' : ''}`} />
                <span className="tracking-wide">{tab.name}</span>
                {tab.count > 0 && (
                  <span
                    className={`ml-3 rounded-full py-1 px-3 text-xs font-bold transition-all duration-500 ${
                      activeFilter === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {/* Hover effect */}
                {activeFilter !== tab.value && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-blue-400/10 group-hover:via-cyan-400/5 group-hover:to-blue-400/10 transition-all duration-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="p-6 animate-fadeIn relative min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/20 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/10 -z-10" />
      <FloatingParticles />
      
      {/* Premium Header */}
      <PremiumHeader />

      {/* Premium Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Total Projects", value: totalProjects, icon: FolderOpen, color: "bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500", trend: 75 },
          { title: "Active Projects", value: activeProjects, icon: Activity, change: 12, color: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-500", trend: 60 },
          { title: "Avg. Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500", trend: avgProgress },
          { title: "Budget Usage", value: `$${(totalSpent/1000).toFixed(1)}K`, icon: BarChart3, change: -5, color: "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500", trend: 45 },
        ].map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Premium Filters */}
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

      {/* Premium Filter Tabs */}
      <FilterTabs />

      {/* Premium Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="relative text-center py-20 bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700/30 animate-fadeIn backdrop-blur-xl shadow-2xl">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-transparent to-purple-400/5 rounded-3xl" />
          
          <div className="relative z-10">
            <FolderOpen className="mx-auto h-20 w-20 text-gray-300 dark:text-gray-600 animate-float-slow" />
            <h3 className="mt-6 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              No projects found
            </h3>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg tracking-wide leading-relaxed">
              No projects match your current filters. Try adjusting your search or create a new project.
            </p>
            <button className="mt-8 inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#2563EB] via-[#1E40AF] to-[#2563EB] hover:from-[#1E40AF] hover:via-[#1E3A8A] hover:to-[#1E40AF] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 active:scale-95 group">
              <Plus className="-ml-1 mr-3 h-6 w-6 transition-transform duration-500 group-hover:rotate-180" />
              <span className="tracking-wide">Create New Project</span>
              <ExternalLink className="ml-3 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-2" />
            </button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden animate-fadeIn">
          {/* Premium list view */}
          <div className="p-6 space-y-4">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="p-5 rounded-2xl border border-gray-100/80 dark:border-gray-700/80 hover:border-blue-200/80 dark:hover:border-blue-800/80 hover:bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/10 transition-all duration-500 backdrop-blur-sm group animate-slideUp"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-800/20 shadow-lg group-hover:shadow-xl transition-all duration-500">
                      <FolderOpen className="h-6 w-6 text-blue-500 dark:text-blue-400 transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-blue-400/10 group-hover:via-cyan-400/5 group-hover:to-blue-400/10 transition-all duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4">
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text transition-all duration-500 truncate">
                          {project.name}
                        </h4>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400">
                          {project.progress}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-1 tracking-wide">
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <button className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-500 hover:scale-110">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 animate-fadeIn">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Premium Animations CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes text-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes card-enter {
          from {
            opacity: 0;
            transform: translateY(50px) rotateX(-10deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0);
          }
        }
        
        @keyframes stats-enter {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-dropdown {
          animation: dropdown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        
        .animate-text-gradient {
          background-size: 200% 200%;
          animation: text-gradient 4s ease infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-card-enter {
          animation: card-enter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-stats-enter {
          animation: stats-enter 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-count-up {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
          overflow-x: hidden;
        }
        
        /* Enhanced selection */
        ::selection {
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        
        /* Premium focus styles */
        *:focus-visible {
          outline: 2px solid transparent;
          outline-offset: 2px;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
          border-radius: 12px;
        }
        
        /* Smooth transitions */
        .transition-all {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Line clamping */
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
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #06b6d4);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #0891b2);
        }
      `}</style>
    </div>
  );
}
