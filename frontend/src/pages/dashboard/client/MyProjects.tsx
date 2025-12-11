import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart2,
  ChevronDown,
  ArrowUpRight,
  FolderOpen,
  Calendar,
  FileBarChart2,
} from 'lucide-react';

// Define types for better type safety
type TeamMember = {
  name: string;
  role: string;
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
};

// Mock data for projects
const projects: Project[] = [
  {
    id: 1,
    name: 'E-commerce Website',
    description: 'Complete redesign of the online store with new features',
    status: 'in-progress',
    progress: 65,
    startDate: '2023-10-15',
    dueDate: '2024-02-28',
    team: [
      { name: 'Alex Johnson', role: 'Lead Developer' },
      { name: 'Sarah Miller', role: 'UI/UX Designer' },
      { name: 'Mike Chen', role: 'Backend Developer' },
    ],
    lastUpdated: '2023-12-10T14:30:00Z',
    files: 24,
    tasks: {
      total: 18,
      completed: 12,
    },
    budget: 25000,
    spent: 18250,
    priority: 'high',
    tags: ['web', 'ecommerce', 'redesign'],
  },
  // More projects...
];

const statuses = {
  'in-progress': { label: 'In Progress', color: 'bg-blue-500', icon: Clock },
  'in-review': { label: 'In Review', color: 'bg-yellow-500', icon: FileText },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle2 },
  'on-hold': { label: 'On Hold', color: 'bg-gray-500', icon: AlertCircle },
  planning: { label: 'Planning', color: 'bg-purple-500', icon: FileBarChart2 },
};

const priorities = {
  high: { label: 'High', color: 'bg-red-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-500' },
};

const ProjectCard = ({ project }: { project: typeof projects[0] }) => {
  const status = statuses[project.status as keyof typeof statuses];
  const priority = priorities[project.priority as keyof typeof priorities];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {project.name}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color} text-white`}>
              {status.label}
            </span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {project.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-full rounded-full ${status.color}`} 
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${priority.color}`}></span>
            <span>{priority.label} Priority</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.team.slice(0, 3).map((member, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-200 border-2 border-white dark:border-gray-800">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
            {project.team.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                +{project.team.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
              <FileText className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
              <BarChart2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700/30 px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Updated {new Date(project.lastUpdated).toLocaleDateString()}
        </div>
        <div className="flex space-x-2">
          <button className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center">
            View Details <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

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
  setStatusFilter: (status: string[]) => void;
  priorityFilter: string[];
  setPriorityFilter: (priority: string[]) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}) => {
  const toggleStatus = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const togglePriority = (priority: string) => {
    if (priorityFilter.includes(priority)) {
      setPriorityFilter(priorityFilter.filter(p => p !== priority));
    } else {
      setPriorityFilter([...priorityFilter, priority]);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h2>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">Filter by Status</h4>
                <div className="mt-2 space-y-1">
                  {Object.entries(statuses).map(([key, { label }]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={statusFilter.includes(key)}
                        onChange={() => toggleStatus(key)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">Filter by Priority</h4>
                <div className="mt-2 space-y-1">
                  {Object.entries(priorities).map(([key, { label }]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={priorityFilter.includes(key)}
                        onChange={() => togglePriority(key)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
            <button 
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            New Project
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {statusFilter.map(status => (
          <span key={status} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {statuses[status as keyof typeof statuses].label}
            <button 
              type="button" 
              className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 dark:hover:bg-blue-800 dark:hover:text-blue-300"
              onClick={() => toggleStatus(status)}
            >
              <span className="sr-only">Remove filter</span>
              <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
              </svg>
            </button>
          </span>
        ))}
        
        {priorityFilter.map(priority => (
          <span key={priority} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            {priorities[priority as keyof typeof priorities].label} Priority
            <button 
              type="button" 
              className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500 dark:hover:bg-yellow-800 dark:hover:text-yellow-300"
              onClick={() => togglePriority(priority)}
            >
              <span className="sr-only">Remove filter</span>
              <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
              </svg>
            </button>
          </span>
        ))}
        
        {(statusFilter.length > 0 || priorityFilter.length > 0) && (
          <button 
            type="button" 
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => {
              setStatusFilter([]);
              setPriorityFilter([]);
            }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

const ProjectList = ({ projects, viewMode }: { projects: Project[]; viewMode: 'grid' | 'list' }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new project.
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            New Project
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Project Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project) => {
                const status = statuses[project.status as keyof typeof statuses];
                // Remove unused priority variable
                
                return (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {project.tasks.completed}/{project.tasks.total} tasks
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color} text-white`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-full rounded-full ${status.color}`} 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{project.progress}% complete</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member: TeamMember, i: number) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-200 border-2 border-white dark:border-gray-800">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(project.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default function MyProjects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter projects based on search query and filters
  const filteredProjects = projects.filter(project => {
    // Filter by search query
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(project.status);
    
    // Filter by priority
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(project.priority);
    
    // Filter by active tab
    const matchesActiveFilter = activeFilter === 'all' || 
                              (activeFilter === 'active' && project.status === 'in-progress') ||
                              (activeFilter === 'completed' && project.status === 'completed');
    
    return matchesSearch && matchesStatus && matchesPriority && matchesActiveFilter;
  });


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Projects</h1>
      
      {/* Project filters and search */}
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
      
      {/* Project stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries({
          'Total Projects': projects.length,
          'In Progress': projects.filter(p => p.status === 'in-progress').length,
          'Completed': projects.filter(p => p.status === 'completed').length,
          'On Hold': projects.filter(p => p.status === 'on-hold').length,
        }).map(([label, count], index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{count}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <FolderOpen className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Project list/grid view */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { name: 'All', value: 'all', count: projects.length },
              { name: 'Active', value: 'active', count: projects.filter(p => p.status === 'in-progress').length },
              { name: 'Completed', value: 'completed', count: projects.filter(p => p.status === 'completed').length },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
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
      
      {/* Render project list or grid */}
      <ProjectList 
        projects={filteredProjects} 
        viewMode={viewMode} 
      />
    </div>
  );
}
