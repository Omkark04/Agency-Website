import { motion } from 'framer-motion';
import { Target, Zap } from 'lucide-react';

export const VisionMission = () => {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative bg-white p-8 md:p-12 rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#015bad]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
            
            <div className="relative z-10">
              <div className="bg-[#015bad]/10 p-4 rounded-2xl w-fit mb-6">
                <Target className="h-8 w-8 text-[#015bad]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium italic border-l-4 border-[#F5B041] pl-6 py-2">
                "To be the most trusted creative and digital partner for businesses across India — empowering every brand to be seen, heard, and remembered."
              </p>
              <div className="mt-8 flex items-center gap-2 text-[#015bad] font-semibold">
                <span>The Future of Excellence</span>
                <div className="h-0.5 w-12 bg-[#015bad]/30" />
              </div>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative bg-[#0A1F44] p-8 md:p-12 rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-full -ml-8 -mb-8 transition-transform group-hover:scale-110 duration-500" />
            
            <div className="relative z-10 text-white">
              <div className="bg-white/10 p-4 rounded-2xl w-fit mb-6">
                <Zap className="h-8 w-8 text-[#F5B041]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-medium opacity-90 border-l-4 border-white/30 pl-6 py-2">
                "To deliver end-to-end creative, digital, and print solutions with precision and passion — helping businesses grow their brand, reach their audience, and achieve their goals through one powerful partnership."
              </p>
              <div className="mt-8 flex items-center gap-2 text-[#F5B041] font-semibold">
                <span>Precision meets Passion</span>
                <div className="h-0.5 w-12 bg-[#F5B041]/30" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
