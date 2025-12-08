import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { AuthModal } from './AuthModal';
import logo from '../../../assets/UdyogWorks logo.png';

// Constants for header heights in pixels
const TOP_BAR_HEIGHT = 44; // Height of the TopBar component

interface HeaderProps {
  onAuthButtonClick?: () => void;
}

export const Header = ({ onAuthButtonClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLHeadElement>(null);
  const lastScrollY = useRef(0);

  const openAuthModal = (mode: 'login' | 'signup') => {
    if (onAuthButtonClick) {
      onAuthButtonClick();
      return;
    }
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  // Update header height when mobile menu opens/closes
  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      setHeaderHeight(height);
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only update the state if the scroll position changes significantly
      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        setIsScrolled(currentScrollY > 10);
        lastScrollY.current = currentScrollY;
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (headerRef.current && isMobileMenuOpen) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Set initial header height
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      setHeaderHeight(height);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Offers', href: '#offers' },
    { name: 'Work', href: '#work' },
    { name: 'About', href: '#about' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Spacer div that matches the height of the fixed header */}
      <div 
        style={{
          height: isMobileMenuOpen ? `${headerHeight}px` : `${headerHeight}px`,
          minHeight: '64px', // Minimum height to prevent layout shift
        }} 
        className="w-full transition-all duration-300"
        aria-hidden="true"
      />
      
      <header 
        ref={headerRef}
        className={`fixed w-full z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' : 'bg-transparent'
        }`}
        style={{
          top: `${TOP_BAR_HEIGHT}px`,
          height: isMobileMenuOpen ? 'auto' : 'auto',
        }}
      >
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-300 group-hover:duration-500"></div>
                <div className="relative">
                  <img 
                    src={logo} 
                    alt="UdyogWorks Logo" 
                    className="h-12 w-auto object-contain animate-float"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNTAiPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwMENDMkE4Ij5VZHlvZ1dvcmtzPC90ZXh0Pjwvc3ZnPg=='
                    }}
                  />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent group-hover:bg-clip-text group-hover:from-[#00C2A8] group-hover:to-[#00C2A8] transition-all duration-500">
                UdyogWorks
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavigation(e, link.href)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#00C2A8] dark:hover:text-[#00C2A8] font-medium transition-colors duration-200 cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => openAuthModal('login')}
                className="text-gray-700 dark:text-gray-300 hover:text-[#00C2A8] dark:hover:text-[#00C2A8] font-medium transition-colors duration-200 flex items-center space-x-1.5"
              >
                <LogIn size={18} />
                <span>Login</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 flex items-center space-x-1.5"
              >
                <UserPlus size={18} />
                <span>Register</span>
              </button>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <a
                href="#contact"
                onClick={(e) => handleNavigation(e, '#contact')}
                className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 cursor-pointer"
              >
                Get Started
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center z-50">
              <button
                className="text-gray-700 dark:text-gray-300 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div 
            className={`md:hidden absolute left-0 w-full bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out overflow-hidden ${
              isMobileMenuOpen 
                ? 'max-h-screen py-4 shadow-lg' 
                : 'max-h-0 py-0'
            }`}
            style={{
              top: '100%',
              zIndex: 40,
              backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavigation(e, link.href)}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={() => openAuthModal('login')}
                className="w-full flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2.5 rounded-lg font-medium transition-colors duration-200"
              >
                <LogIn size={18} />
                <span>Login</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 flex items-center justify-center space-x-2"
              >
                <UserPlus size={18} />
                <span>Create Account</span>
              </button>
              <a
                href="#contact"
                onClick={(e) => handleNavigation(e, '#contact')}
                className="block text-center bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 cursor-pointer"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal}
        defaultMode={authMode}
      />
    </>
  );
};

// Add this to your global CSS or Tailwind config
// @keyframes float {
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-5px); }
// }
// .animate-float {
//   animation: float 6s ease-in-out infinite;
// }

export default Header;