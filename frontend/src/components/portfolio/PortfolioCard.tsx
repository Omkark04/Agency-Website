// frontend/src/components/portfolio/PortfolioCard.tsx
import { motion } from 'framer-motion';
import { Sparkles, ExternalLink } from 'lucide-react';
import type { PortfolioProject } from '../../api/portfolio';

interface PortfolioCardProps {
  project: PortfolioProject;
  size: 'small' | 'regular' | 'large';
  onCustomize: (project: PortfolioProject) => void;
}

export const PortfolioCard = ({ project, size, onCustomize }: PortfolioCardProps) => {
  // Determine card size classes
  const sizeClasses = {
    small: 'md:col-span-1 md:row-span-1',
    regular: 'md:col-span-1 md:row-span-2',
    large: 'md:col-span-2 md:row-span-2'
  };

  const imageHeightClasses = {
    small: 'h-48',
    regular: 'h-64',
    large: 'h-80'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${sizeClasses[size]}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${imageHeightClasses[size]}`}>
        <img
          src={project.featured_image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Featured Badge */}
        {project.is_featured && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-xs font-semibold rounded-full">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          {project.service && (
            <span className="inline-block px-3 py-1 bg-[#00C2A8]/10 text-[#00C2A8] text-xs font-semibold rounded-full mb-2">
              {project.service.name}
            </span>
          )}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        </div>

        {project.client_name && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Client: <span className="font-medium">{project.client_name}</span>
          </p>
        )}

        {/* Customize Button */}
        <button
          onClick={() => onCustomize(project)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Sparkles className="h-4 w-4" />
          <span>Customize it for you!</span>
        </button>

        {/* View Details Link (Optional) */}
        {project.video && (
          <button
            onClick={() => window.open(project.video, '_blank')}
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#00C2A8] transition-colors text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Demo</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PortfolioCard;
