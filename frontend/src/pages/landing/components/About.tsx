import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Lightbulb, Users, Rocket, Award, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { fetchAboutImages } from '../../../api/media';
import type { MediaItem } from '../../../api/media';
import { Button as MovingBorderContainer } from "@/components/ui/moving-border";


const features = [
  {
    icon: <Lightbulb className="h-8 w-8 text-[#00C2A8]" />,
    title: 'Innovative Solutions',
    description: 'We stay ahead of the curve with cutting-edge technologies and creative approaches to solve complex business challenges.'
  },
  {
    icon: <Users className="h-8 w-8 text-[#0066FF]" />,
    title: 'Client-Centric Approach',
    description: 'Your success is our priority. We work closely with you to understand your unique needs and deliver tailored solutions.'
  },
  {
    icon: <Rocket className="h-8 w-8 text-[#0B2545] dark:text-[#00C2A8]" />,
    title: 'Rapid Execution',
    description: 'We value your time. Our agile methodology ensures quick turnarounds without compromising on quality.'
  },
  {
    icon: <Award className="h-8 w-8 text-[#00C2A8]" />,
    title: 'Proven Track Record',
    description: 'Trusted by businesses of all sizes, we deliver measurable results that drive growth and success.'
  }
];

// Stacking Card Component for Mobile
const StackingCard = ({ feature, index, totalCards }: { feature: typeof features[0], index: number, totalCards: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  // Calculate stacking position based on scroll
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [0.8, 0.9, 1, 1, 1]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [100, 50, index * 20, index * 20, index * 20 - 50]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.5, 0.8, 1],
    [0, 0.5, 1, 1, 0.8]
  );

  const zIndex = totalCards - index;

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        y,
        opacity,
        zIndex,
      }}
      className="sticky top-20 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="bg-[#00C2A8]/10 p-2 rounded-lg w-fit mb-4">
        {feature.icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  );
};

export const About = () => {
  const [aboutImages, setAboutImages] = useState<MediaItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAboutImages();
  }, []);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (aboutImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % aboutImages.length
        );
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [aboutImages.length]);

  const loadAboutImages = async () => {
    try {
      setIsLoading(true);
      const images = await fetchAboutImages();
      setAboutImages(images);
    } catch (error) {
      console.error('Failed to load about images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? aboutImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      (prev + 1) % aboutImages.length
    );
  };

  return (
    <section id="about" className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <MovingBorderContainer
              borderRadius="1rem"
              containerClassName="bg-transparent w-full h-auto p-[3px]"
              className="bg-white dark:bg-gray-800 rounded p-[3px]
            bg-gradient-to-r from-indigo-500 via-purple-500 to-green-500
            transition-all duration-300 hover:scale-[1.02] overflow-hidden w-full h-full"
              duration={3000}
              as="div"
              borderClassName="bg-[radial-gradient(#06b6d4_40%,transparent_60%)]"
            >
              <div className="bg-white dark:bg-gray-800 w-full h-full relative">
                {isLoading ? (
                  // Loading skeleton
                  <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2A8] mx-auto mb-4"></div>
                      <span className="text-gray-400 dark:text-gray-600">Loading images...</span>
                    </div>
                  </div>
                ) : aboutImages.length > 0 ? (
                  // Image Gallery
                  <div className="relative h-96 overflow-hidden group">
                    {/* Main Image */}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        src={aboutImages[currentImageIndex]?.url}
                        alt={aboutImages[currentImageIndex]?.caption || 'About Us'}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    
                    {/* Image Navigation Arrows */}
                    {aboutImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        >
                          <ArrowRight className="h-5 w-5 rotate-180" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Caption */}
                    {aboutImages[currentImageIndex]?.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                        <p className="text-white text-sm font-medium">
                          {aboutImages[currentImageIndex].caption}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Fallback when no images are found
                  <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <span className="text-gray-400 dark:text-gray-600">About Us</span>
                    </div>
                  </div>
                )}
              </div>
            </MovingBorderContainer>
            
            {/* Image Indicators (Dots) */}
            {aboutImages.length > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {aboutImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'w-8 bg-gradient-to-r from-[#00C2A8] to-[#0066FF]' 
                        : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-3/4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">Expereinced Teams are always ready to help you.</p>
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 tracking-tight">Why Choose UdyogWorks?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 md:mb-8 leading-relaxed">
              At UdyogWorks, we're more than just a service provider – we're your strategic partner in digital transformation. 
              Our mission is to empower businesses with innovative solutions that drive real results.
            </p>
            
            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl hover:shadow-md transition-shadow duration-300"
                >
                  <div className="bg-[#00C2A8]/10 p-2 rounded-lg w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Mobile: Stacking Cards */}
            <div className="md:hidden relative space-y-4 min-h-[800px]">
              {features.map((feature, index) => (
                <StackingCard 
                  key={index} 
                  feature={feature} 
                  index={index}
                  totalCards={features.length}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
