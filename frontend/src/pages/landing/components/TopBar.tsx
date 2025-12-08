import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

export const TopBar = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#0B2545] to-[#0066FF] text-white py-2 px-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <a href="mailto:contact@udyogworks.com" className="flex items-center text-sm hover:text-gray-200 transition-colors">
            <FaEnvelope className="mr-2" /> rahulbhatambare72@gmail.com
          </a>
          <a href="tel:+919876543210" className="flex items-center text-sm hover:text-gray-200 transition-colors">
            <FaPhoneAlt className="mr-2" /> +91 8208776319
          </a>
        </div>
        <a 
          href="#contact" 
          className="bg-white text-[#0B2545] hover:bg-gray-100 font-medium rounded-full px-4 py-1 text-sm transition-colors"
        >
          Get Free Consultation
        </a>
      </div>
    </div>
  );
};
