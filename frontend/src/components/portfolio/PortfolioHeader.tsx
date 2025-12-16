// frontend/src/components/portfolio/PortfolioHeader.tsx
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import logo from '../../assets/UdyogWorks logo.png';

export const PortfolioHeader = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <img
              src={logo}
              alt="UdyogWorks Logo"
              className="h-10 sm:h-12 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent">
              UdyogWorks
            </span>
          </Link>

          {/* CTA Message */}
          <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 rounded-full border border-[#00C2A8]/20">
            <Sparkles className="h-5 w-5 text-[#00C2A8]" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="font-bold text-[#00C2A8]">Inspired?</span> Customize any project for your business!
            </p>
          </div>

          {/* Home Button */}
          <Link
            to="/"
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white rounded-lg font-medium shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>

        {/* Mobile CTA Message */}
        <div className="md:hidden mt-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 rounded-lg border border-[#00C2A8]/20">
          <Sparkles className="h-4 w-4 text-[#00C2A8] flex-shrink-0" />
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            <span className="font-bold text-[#00C2A8]">Inspired?</span> Customize any project!
          </p>
        </div>
      </div>
    </header>
  );
};

export default PortfolioHeader;
