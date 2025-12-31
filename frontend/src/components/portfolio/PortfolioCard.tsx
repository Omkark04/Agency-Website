// frontend/src/components/portfolio/PortfolioCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ExternalLink, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PortfolioProject } from '../../api/portfolio';

interface PortfolioCardProps {
  project: PortfolioProject;
  size: 'small' | 'regular' | 'large';
  onCustomize: (project: PortfolioProject) => void;
}

export const PortfolioCard = ({ project, size, onCustomize }: PortfolioCardProps) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
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

  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  // Combine featured image with gallery images
  const allImages = [project.featured_image, ...(project.images || [])];

  return (
    <>
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
          
          {/* Eye Button to View Full Image */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(project.featured_image);
            }}
            className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
            title="View full image"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          {/* Featured Badge */}
          {project.is_featured && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white text-xs font-semibold rounded-full">
              Featured
            </div>
          )}
        </div>

        {/* Gallery Preview (for larger cards) */}
        {size !== 'small' && project.images && project.images.length > 0 && (
          <div className="px-5 pt-3">
            <div className="overflow-x-auto scrollbar-hide -mx-1">
              <div className="flex gap-2 pb-2">
                {project.images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(image);
                    }}
                    className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden group/thumb"
                  >
                    <img
                      src={image}
                      alt={`${project.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                      <ZoomIn className="w-3 h-3 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
                {project.images.length > 4 && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    +{project.images.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
            <span>Start Similar Project</span>
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

      {/* Image Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-5xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Navigation for multiple images */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = allImages.indexOf(lightboxImage);
                    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                    setLightboxImage(allImages[prevIndex]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = allImages.indexOf(lightboxImage);
                    const nextIndex = (currentIndex + 1) % allImages.length;
                    setLightboxImage(allImages[nextIndex]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            <img
              src={lightboxImage}
              alt="Full view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            
            {/* Image indicators */}
            {allImages.length > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage(img);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      lightboxImage === img ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default PortfolioCard;
