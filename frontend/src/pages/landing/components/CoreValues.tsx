import { motion } from 'framer-motion';
import { SectionHeader } from '../../../components/shared/SectionHeader';
import { Users, Hammer, Lightbulb, Shield, Heart, TrendingUp } from 'lucide-react';

const coreValues = [
  {
    title: 'Unity',
    subtitle: '(The One)',
    description: 'Harmony in collaboration. We believe in being one team with one goal, working seamlessly with our clients to achieve greatness together.',
    icon: <Users className="h-8 w-8" />,
    color: 'from-[#00BCD4] to-[#0A1F44]',
    highlight: true
  },
  {
    title: 'Craft',
    subtitle: '(The Kraft)',
    description: 'Mastery in every detail. Our dedication to precision and excellence ensures that every project we touch is a masterpiece of digital and creative skill.',
    icon: <Hammer className="h-8 w-8" />,
    color: 'from-[#00838F] to-[#015bad]',
    highlight: true
  },
  {
    title: 'Innovation',
    description: 'Embracing the future. We stay ahead of digital trends to provide our partners with cutting-edge solutions that drive market leadership.',
    icon: <Lightbulb className="h-8 w-8" />,
    color: 'from-[#26C6DA] to-[#0097A7]'
  },
  {
    title: 'Integrity',
    description: 'Built on trust. We maintain complete transparency and honesty in all our partnerships, ensuring a foundation of long-term mutual success.',
    icon: <Shield className="h-8 w-8" />,
    color: 'from-[#00ACC1] to-[#00838F]'
  },
  {
    title: 'Passion',
    description: 'Fueled by love. Our deep passion for creativity and technology is evident in the energy and dedication we bring to every single project.',
    icon: <Heart className="h-8 w-8" />,
    color: 'from-[#4DD0E1] to-[#00BCD4]'
  },
  {
    title: 'Growth',
    description: 'Empowering results. Our ultimate goal is to see your brand thrive, reach its audience, and achieve measurable milestones of success.',
    icon: <TrendingUp className="h-8 w-8" />,
    color: 'from-[#0097A7] to-[#015bad]'
  }
];

export const CoreValues = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <SectionHeader
          caption="The foundation"
          title="Our"
          highlightedTitle="Core Values"
          description="The principles that define our culture and drive our commitment to your success."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreValues.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative p-8 rounded-3xl transition-all duration-300 ${
                value.highlight 
                  ? 'border-2 border-transparent bg-gray-50' 
                  : 'bg-white border border-gray-100 shadow-lg hover:shadow-2xl'
              }`}
            >
              {value.highlight && (
                <div className={`absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r ${value.color} -z-10`} />
              )}
              
              <div className={`flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br ${value.color} text-white shadow-lg`}>
                {value.icon}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-baseline gap-2">
                {value.title}
                {value.subtitle && (
                  <span className="text-sm font-semibold opacity-60">{value.subtitle}</span>
                )}
              </h3>
              
              <p className="text-gray-600 leading-relaxed font-medium">
                {value.description}
              </p>

              {value.highlight && (
                <div className="mt-6 flex items-center gap-2">
                  <div className={`h-1 w-full rounded-full bg-gradient-to-r ${value.color} opacity-20`} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
