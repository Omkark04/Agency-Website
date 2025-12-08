import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { AuthModal } from './AuthModal';
import logo from '../../../assets/UdyogWorks logo.png';
import { getCurrentUser, logout } from '../../../utils/auth';

const TOP_BAR_HEIGHT = 44;

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [headerHeight, setHeaderHeight] = useState(0);
  const [user, setUser] = useState<any>(getCurrentUser());

  const headerRef = useRef<HTMLHeadElement>(null);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setUser(getCurrentUser()); // ✅ Refresh user after login
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
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
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      setHeaderHeight(height);
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }, [isMobileMenuOpen]);

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

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Work', href: '#work' },
    { name: 'About', href: '#about' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <div style={{ height: `${headerHeight}px`, minHeight: '64px' }} />

      <header
        ref={headerRef}
        className={`fixed w-full z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'
        }`}
        style={{ top: `${TOP_BAR_HEIGHT}px` }}
      >
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">

            {/* ✅ LOGO */}
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} className="h-12" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#00C2A8] to-[#0066FF] bg-clip-text text-transparent">
                UdyogWorks
              </span>
            </Link>

            {/* ✅ NAV LINKS */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavigation(e, link.href)}
                  className="text-gray-700 hover:text-[#00C2A8]"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* ✅ AUTH AREA (DESKTOP) */}
            <div className="hidden md:flex items-center space-x-4">

              {!user ? (
                <>
                  <button onClick={() => openAuthModal('login')} className="flex items-center gap-1">
                    <LogIn size={18} /> Login
                  </button>

                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-4 py-2 rounded-lg flex items-center gap-1"
                  >
                    <UserPlus size={18} /> Register
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <User size={18} />
                    Hi, {user.username}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              )}

            </div>

            {/* ✅ MOBILE MENU TOGGLE */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* ✅ MOBILE MENU */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-3">

              {navLinks.map(link => (
                <a key={link.name} href={link.href} onClick={(e) => handleNavigation(e, link.href)}>
                  {link.name}
                </a>
              ))}

              {!user ? (
                <>
                  <button onClick={() => openAuthModal('login')} className="w-full">
                    Login
                  </button>

                  <button onClick={() => openAuthModal('signup')} className="w-full bg-blue-500 text-white py-2">
                    Register
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold text-center">Hi, {user.username}</p>

                  <button onClick={handleLogout} className="w-full bg-red-500 text-white py-2">
                    Logout
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </header>

      {/* ✅ AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultMode={authMode}
      />
    </>
  );
};

export default Header;
