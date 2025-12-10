import { motion } from 'framer-motion';
import { Filter, MoreVertical, Play, Pause, Eye, Edit, ExternalLink, Calendar, Users, DollarSign } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  progress: number;
  status: string;
  dueDate: string;
  team: string[];
  budget: string;
}

interface ProjectsTableProps {
  projects: Project[];
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, { bg: string, text: string }> = {
      'Planning': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Review': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800' },
      'On Hold': { bg: 'bg-red-100', text: 'text-red-800' },
    };
    return statusColors[status] || statusColors['In Progress'];
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Ongoing Projects</h3>
            <p className="mt-1 text-sm text-gray-500">Track the progress of your active projects</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 transition-all duration-200">
              Export Report
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {projects.map((project, index) => {
          const statusColor = getStatusColor(project.status);
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{project.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due {project.dueDate}
                        </div>
                        <div className="flex items-center text-xs font-medium text-gray-700">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {project.budget}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          {project.team.length} members
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-2">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900 mr-2">{project.progress}%</span>
                        {project.status === 'In Progress' ? (
                          <Play className="h-4 w-4 text-green-500" />
                        ) : (
                          <Pause className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {project.team.map((member, i) => (
                          <img
                            key={i}
                            className="h-8 w-8 rounded-full ring-2 ring-white"
                            src={member}
                            alt="Team member"
                          />
                        ))}
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00C2A8] to-[#0066FF] ring-2 ring-white flex items-center justify-center">
                          <span className="text-xs font-bold text-white">+2</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-sm font-bold text-[#00C2A8] hover:text-[#0086b3] flex items-center transition-colors duration-200">
                      View Details
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {projects.length} of 12 projects
          </div>
          <button className="text-sm font-bold text-[#00C2A8] hover:text-[#0086b3] flex items-center transition-colors duration-200">
            View all projects
            <ExternalLink className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}