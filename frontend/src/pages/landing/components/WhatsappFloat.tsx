import { useState, useEffect } from 'react';
import { X } from 'lucide-react';



const WhatsappFloat = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };


    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);


  const phoneNumber = '918208776319'; // Replace with your WhatsApp number
  const message = 'Hello! I would like to get more information about your services.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;


  if (!isVisible) return null;


  // Official WhatsApp SVG Icon
  const WhatsAppIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path
        d="M17.498 14.382v-.002c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.35.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.761-1.66-2.059-.173-.297-.019-.458.13-.606.136-.135.297-.354.446-.521.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.076-.15-.673-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.01-.571-.01-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.489 1.704.625.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.118h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a11.872 11.872 0 01-1.83-6.34C2.5 6.39 6.84 2 12.082 2c3.2 0 6.17 1.065 8.541 3.86 2.322 2.73 2.863 6.6 1.567 10.065-1.296 3.465-4.58 6.575-8.398 7.42z"
      />
    </svg>
  );


  return (
    <div className="fixed bottom-20 md:bottom-5 right-6 z-40 flex flex-col items-end">
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm rounded-lg shadow-xl p-3 mb-3 max-w-xs z-50"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        >
          <div className="flex justify-between items-start">
            <span>Need help? Chat with us on WhatsApp!</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
              aria-label="Close tooltip"
            >
              <X size={16} />
            </button>
          </div>
          <div className="absolute bottom-0 right-4 w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 -mb-1.5"></div>
        </div>
      )}


      {/* WhatsApp Button */}
      <div className="relative group">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-4 shadow-lg
            transition-all duration-300 transform hover:scale-110 hover:shadow-xl flex items-center justify-center
            ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}`}
          onMouseEnter={() => !isMobile && setShowTooltip(true)}
          onMouseLeave={() => !isMobile && setShowTooltip(false)}
          onClick={() => setShowTooltip(false)}
          aria-label="Chat with us on WhatsApp"
        >
          <WhatsAppIcon />


          {/* Unread indicator with pulse animation */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            1
          </span>
        </a>
      </div>
    </div>
  );
};


export default WhatsappFloat;
