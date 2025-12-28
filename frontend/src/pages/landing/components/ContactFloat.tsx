import { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { X } from 'lucide-react';

export const ContactFloat = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  // Contact Icon SVG
  const ContactIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );

  return (
    <div className="fixed bottom-36 md:bottom-24 right-6 z-40 flex flex-col items-end" ref={popupRef}>
      {/* Contact Info Popup */}
      {showPopup && (
        <div
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-xl mb-3 max-w-sm z-50 overflow-hidden"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        >
          <div className="bg-gradient-to-r from-[#0B2545] to-[#0066FF] text-white p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">Contact Us</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopup(false);
                }}
                className="text-white hover:text-gray-200 ml-2"
                aria-label="Close popup"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <a
              href="mailto:udyogworks.official@gmail.com"
              className="flex items-center text-sm hover:text-[#0066FF] transition-colors group"
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <FaEnvelope className="text-[#0066FF]" />
              </div>
              <span className="text-sm">udyogworks.official@gmail.com</span>
            </a>

            <a
              href="tel:+918390498423"
              className="flex items-center text-sm hover:text-[#0066FF] transition-colors group"
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <FaPhoneAlt className="text-[#0066FF]" />
              </div>
              <span className="text-sm">+91 8390498423</span>
            </a>

            <a
              href="#contact"
              className="block w-full bg-gradient-to-r from-[#0B2545] to-[#0066FF] text-white hover:from-[#0066FF] hover:to-[#0B2545] font-medium rounded-full px-4 py-2 text-sm text-center transition-all transform hover:scale-105"
              onClick={() => setShowPopup(false)}
            >
              Get Free Consultation
            </a>
          </div>

          <div className="absolute bottom-0 right-4 w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 -mb-1.5"></div>
        </div>
      )}

      {/* Floating Contact Button */}
      <div className="relative group">
        <button
          onClick={() => setShowPopup(!showPopup)}
          className={`bg-gradient-to-r from-[#0B2545] to-[#0066FF] hover:from-[#0066FF] hover:to-[#0B2545] text-white rounded-full p-4 shadow-lg
            transition-all duration-300 transform hover:scale-110 hover:shadow-xl flex items-center justify-center
            ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}`}
          aria-label="Contact information"
        >
          <ContactIcon />

          {/* Notification indicator with pulse animation */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            !
          </span>
        </button>
      </div>
    </div>
  );
};

export default ContactFloat;
