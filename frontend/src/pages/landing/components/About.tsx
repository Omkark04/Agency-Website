import { motion } from 'framer-motion';
import { Lightbulb, Users, Rocket, Award } from 'lucide-react';

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

export const About = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#00C2A8] to-[#0066FF] p-1 rounded-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-600">Team at Work</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-3/4">
              <div className="text-3xl font-bold text-[#00C2A8] mb-1">5+</div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Years of Excellence in Digital Solutions</p>
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose UdyogWorks?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              At UdyogWorks, we're more than just a service provider – we're your strategic partner in digital transformation. 
              Our mission is to empower businesses with innovative solutions that drive real results.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] hover:opacity-90 text-white font-semibold py-3 px-6 rounded-full flex items-center transition-all duration-300">
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="bg-white dark:bg-gray-800 border-2 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-300">
                Our Story
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
