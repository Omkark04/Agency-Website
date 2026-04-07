import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LogOut, Home } from 'lucide-react';
import { AuthModal } from './AuthModal';
import logo from '../../../assets/OneKraft logo.png';
import { getCurrentUser, logout } from '../../../utils/auth';
import { UserAvatar } from '../../../components/ui/UserAvatar';


interface HeaderProps {
  onAuthButtonClick?: () => void;
}

export const Header = ({ onAuthButtonClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<any>(getCurrentUser());

  const lastScrollY = useRef(0);
  const navigate = useNavigate();

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
    setUser(getCurrentUser());
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  // Get dashboard route based on user role (similar to AuthModal.tsx)
  const getDashboardRoute = () => {
    if (!user) return '/client-dashboard';

    const userRole = user.role || localStorage.getItem('role');

    if (userRole === 'admin') return '/dashboard';
    if (userRole === 'service_head') return '/dashboard/service-head';
    if (userRole === 'team_member') return '/team-member-dashboard';
    return '/client-dashboard';
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        setIsScrolled(currentScrollY > 10);
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check on mount and after modal closes
    const interval = setInterval(() => {
      const currentUser = getCurrentUser();
      if (currentUser !== user) {
        setUser(currentUser);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Offers', href: '#offers' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'About', href: '#about' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];
  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-100 dark:border-gray-800'
          : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
          }`}
      >
        <div className="py-0.5 md:py-1 max-w-7xl w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-8 md:gap-28">

            {/* Logo - Left Side */}
            <Link to="/" className="flex items-center group flex-shrink-0 relative z-50">
              <img
                src={logo}
                alt="OneKraft Logo"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300 scale-[1.3] md:scale-[1.6] origin-left group-hover:scale-[1.35] md:group-hover:scale-[1.65]"
              />
            </Link>

            {/* Desktop Navigation - Left aligned */}
            <nav className="hidden lg:flex items-center justify-start space-x-6 xl:space-x-8 flex-grow">
              {navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavigation(e, link.href)}
                  className="text-gray-800 dark:text-gray-200 hover:text-[#015bad]
                    dark:hover:text-[#F5B041] transition-all duration-300 font-medium relative group whitespace-nowrap"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#015bad] dark:bg-[#F5B041]
                    transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            {/* Auth Buttons - Right Side (flex-shrink-0 to maintain size) */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
              {!user ? (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#015bad]
                      dark:hover:text-[#F5B041] transition-colors duration-300 font-medium px-4 py-2 rounded-lg
                      hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-[#015bad] hover:bg-[#0a4882] text-white px-5 py-2.5 rounded-lg
                      flex items-center gap-2 font-bold shadow-md hover:shadow-xl transition-all duration-300
                      transform hover:scale-105"
                  >
                    <UserPlus size={18} />
                    <span>Register</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium px-3">
                    <UserAvatar user={user} size="sm" />
                    <span>Hi, {user.username}</span>
                  </div>

                  <button
                    onClick={() => navigate(getDashboardRoute())}
                    className="bg-[#015bad] hover:bg-[#0a4882] text-white px-4 py-2 rounded-lg flex items-center
                      gap-2 font-bold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Home size={16} />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center
                      gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>


            {/* Mobile Menu Toggle */}
            <div className="lg:hidden -mr-1">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={26} className="text-gray-800 dark:text-gray-200" />
                ) : (
                  <Menu size={26} className="text-gray-800 dark:text-gray-200" />
                )}
              </button>
            </div>
          </div>


          {/* Mobile Menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="py-2 space-y-1 border-t border-gray-100 dark:border-gray-800">
              {/* Mobile Navigation Links */}
              {navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavigation(e, link.href)}
                  className="block px-3 py-2.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#015bad]
                    dark:hover:text-[#F5B041] rounded-lg transition-all duration-300 font-medium"
                >
                  {link.name}
                </a>
              ))}


              {/* Mobile Auth Section */}
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                {!user ? (
                  <>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="w-full px-3 py-2.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                        rounded-lg transition-all duration-300 font-medium
                        flex items-center justify-center gap-2"
                    >
                      <LogIn size={18} />
                      <span>Login</span>
                    </button>


                    <button
                      onClick={() => openAuthModal('signup')}
                      className="w-full bg-[#F5B041] hover:bg-[#e6a030] text-[#0A1F44] px-3 py-2.5
                        rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-300
                        flex items-center justify-center gap-2"
                    >
                      <UserPlus size={18} />
                      <span>Register</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-center text-white py-2 flex items-center justify-center gap-3">
                      <UserAvatar user={user} size="sm" />
                      <span>Hi, {user.username}</span>
                    </p>

                    <button
                      onClick={() => {
                        navigate(getDashboardRoute());
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#F5B041] hover:bg-[#e6a030] text-[#0A1F44] px-3 py-2.5 rounded-lg
                        font-bold shadow-md hover:shadow-lg transition-all duration-300
                        flex items-center justify-center gap-2"
                    >
                      <Home size={18} />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3 py-2.5 rounded-lg
                        font-medium shadow-md hover:shadow-lg transition-all duration-300
                        flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
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
export default Header;
