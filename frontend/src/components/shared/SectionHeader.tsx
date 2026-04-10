import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  caption: string;           // e.g., "The big picture"
  title: string;             // Main title text
  highlightedTitle?: string; // Optional accent text
  description?: string;      // Optional paragraph (mostly desktop)
  className?: string;
  align?: 'center' | 'left';
  dark?: boolean;            // Use light text for dark backgrounds
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  caption,
  title,
  highlightedTitle,
  description,
  className = '',
  align = 'center',
  dark = false
}) => {
  const alignmentClass = align === 'left' ? 'text-left' : 'text-center';
  const marginClass = align === 'left' ? 'mr-auto' : 'mx-auto';

  return (
    <motion.div
      className={`${alignmentClass} mb-12 md:mb-20 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Caption: Elegant, Italic, Serif */}
      <p className={`
        ${dark ? 'text-gray-400' : 'text-gray-500'} 
        italic font-serif 
        text-xl md:text-2xl 
        mb-2 md:mb-3 
        tracking-wide
      `}>
        {caption}
      </p>

      {/* Main Title: Bold, Uppercase, High Tracking */}
      <h2 className={`
        ${dark ? 'text-white' : 'text-[#0A1F44]'} 
        text-3xl md:text-5xl lg:text-6xl 
        font-bold 
        uppercase 
        tracking-[0.15em] 
        leading-tight
        mb-6
      `}>
        {title}
        {highlightedTitle && (
          <span className="text-[#2563EB] block md:inline md:ml-4">
            {highlightedTitle}
          </span>
        )}
      </h2>

      {/* Description: Leading-relaxed for readability */}
      {description && (
        <p className={`
          ${dark ? 'text-gray-300' : 'text-gray-600'} 
          text-base md:text-lg 
          max-w-3xl 
          ${marginClass} 
          leading-relaxed
          break-words
        `}>
          {description}
        </p>
      )}
    </motion.div>
  );
};
