import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LogOut, Home, ChevronDown, ArrowRight } from 'lucide-react';
import { AuthModal } from './AuthModal';
import logo from '../../../assets/OneKraft logo.png';
import { getCurrentUser, logout } from '../../../utils/auth';
import { UserAvatar } from '../../../components/ui/UserAvatar';
import { listDepartments, type Department } from '../../../api/departments';
import { listServices, type Service } from '../../../api/services';

interface HeaderProps {
  onAuthButtonClick?: () => void;
}

export const Header = ({ onAuthButtonClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<any>(getCurrentUser());
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const lastScrollY = useRef(0);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigate = useNavigate();

  // Load departments and services for mega menu
  useEffect(() => {
    const load = async () => {
      try {
        const [deptRes, svcRes] = await Promise.all([
          listDepartments({ is_active: true }),
          listServices({ is_active: true }),
        ]);
        setDepartments(deptRes.data);
        setServices(svcRes.data);
      } catch (err) {
        console.error('Header: failed to load mega menu data', err);
      }
    };
    load();
  }, []);

  // Group services under their departments
  const servicesByDept = departments
    .map(dept => ({
      ...dept,
      items: services.filter(s => s.department === dept.id).slice(0, 5),
    }))
    .filter(d => d.items.length > 0);

  const handleServicesMouseEnter = () => {
    clearTimeout(megaMenuTimeout.current);
    setShowMegaMenu(true);
  };

  const handleServicesMouseLeave = () => {
    megaMenuTimeout.current = setTimeout(() => setShowMegaMenu(false), 180);
  };

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

  const getDashboardRoute = () => {
    if (!user) return '/client-dashboard';
    const userRole = user.role || localStorage.getItem('role');
    if (userRole === 'admin') return '/dashboard';
    if (userRole === 'service_head') return '/dashboard/service-head';
    if (userRole === 'team_member') return '/team-member-dashboard';
    return '/client-dashboard';
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Check if it's a hash link on the current page
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setIsMobileMenuOpen(false);
      } else {
        // If hash not found on current page, navigate to home + hash
        navigate(`/${href}`);
        setIsMobileMenuOpen(false);
      }
    } else if (href.startsWith('/#')) {
       // If it's a hash link pointing to home page
       if (window.location.pathname === '/') {
         e.preventDefault();
         const sectionId = href.substring(1);
         const element = document.querySelector(sectionId);
         if (element) {
           element.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }
         setIsMobileMenuOpen(false);
       } else {
         // Standard link behavior (will navigate to /#hash and home page handles it or browser does)
         setIsMobileMenuOpen(false);
       }
    } else {
      // Standard page navigation
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

  useEffect(() => {
    const handleStorageChange = () => setUser(getCurrentUser());
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const currentUser = getCurrentUser();
      if (currentUser !== user) setUser(currentUser);
    }, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/#services' },
    { name: 'Offers', href: '/offers' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'About', href: '/about' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="py-2 md:py-2.5 max-w-7xl w-full px-4 sm:px-6 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-8 md:gap-28">

            {/* Logo */}
            <Link to="/" className="flex items-center group flex-shrink-0 relative z-50">
              <img
                src={logo}
                alt="OneKraft Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-start space-x-6 xl:space-x-8 flex-grow">
              {navLinks.map(link =>
                link.name === 'Services' ? (
                  /* ── Services with Mega Menu ── */
                  <div
                    key="Services"
                    className="relative"
                    onMouseEnter={handleServicesMouseEnter}
                    onMouseLeave={handleServicesMouseLeave}
                  >
                    <Link
                      to={link.href}
                      onClick={(e: any) => handleNavigation(e, link.href)}
                      className="flex items-center gap-1 text-gray-800 hover:text-[#015bad]
                         transition-all duration-300 font-medium relative group whitespace-nowrap"
                    >
                      {link.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${showMegaMenu ? 'rotate-180 text-[#015bad]' : ''}`}
                      />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#015bad] 
                        transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={(e: any) => handleNavigation(e, link.href)}
                    className="text-gray-800 hover:text-[#015bad]
                       transition-all duration-300 font-medium relative group whitespace-nowrap"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#015bad] 
                      transition-all duration-300 group-hover:w-full" />
                  </Link>
                )
              )}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
              {!user ? (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center
                      gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-300"
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
                  <div className="flex items-center gap-3 text-gray-800 font-medium px-3">
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
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center
                      gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-transparent border-none hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center p-0"
                style={{ background: 'transparent', border: 'none' }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={26} className="text-gray-800" />
                ) : (
                  <Menu size={26} className="text-gray-800" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-2 space-y-1 border-t border-gray-100">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e: any) => handleNavigation(e, link.href)}
                  className="block px-3 py-2.5 text-gray-800 hover:bg-gray-100 hover:text-[#015bad]
                     rounded-lg transition-all duration-300 font-medium"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2.5">
                {!user ? (
                  <>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 px-3 py-2.5 rounded-lg
                        font-medium shadow-md hover:shadow-lg transition-all duration-300
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
                    <p className="font-semibold text-center py-2 flex items-center justify-center gap-3 text-gray-800">
                      <UserAvatar user={user} size="sm" />
                      <span>Hi, {user.username}</span>
                    </p>
                    <button
                      onClick={() => { navigate(getDashboardRoute()); setIsMobileMenuOpen(false); }}
                      className="w-full bg-[#015bad] hover:bg-[#0a4882] text-white px-3 py-2.5 rounded-lg
                        font-bold shadow-md hover:shadow-lg transition-all duration-300
                        flex items-center justify-center gap-2"
                    >
                      <Home size={18} />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 px-3 py-2.5 rounded-lg
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

        {/* ── Mega Menu ── */}
        <div
          onMouseEnter={handleServicesMouseEnter}
          onMouseLeave={handleServicesMouseLeave}
          className={`absolute top-full left-0 w-full bg-white shadow-2xl border-t-2 border-[#015bad]
            transition-all duration-200 origin-top overflow-hidden
            ${showMegaMenu ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'}`}
          style={{ transformOrigin: 'top center' }}
        >
          {servicesByDept.length > 0 ? (
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div
                className="grid gap-x-8 gap-y-6"
                style={{ gridTemplateColumns: `repeat(${Math.min(servicesByDept.length, 4)}, minmax(0, 1fr))` }}
              >
                {servicesByDept.map(dept => (
                  <div key={dept.id} className="group/col">
                    {/* Department header */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#015bad]/20 bg-white">
                      {dept.logo && (
                        <img
                          src={dept.logo}
                          alt={dept.title}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <div
                        onClick={() => { navigate(`/departments/${dept.slug}`); setShowMegaMenu(false); }}
                        className="font-bold text-[#015bad] text-sm uppercase tracking-wider
                          hover:text-[#0a4882] transition-colors text-left cursor-pointer"
                        role="button"
                        tabIndex={0}
                      >
                        {dept.title}
                      </div>
                    </div>

                    {/* Services list */}
                    <ul className="space-y-1.5">
                      {dept.items.map(service => (
                        <li key={service.id}>
                          <Link
                            to={`/departments/${dept.slug}?service=${service.id}`}
                            onClick={() => setShowMegaMenu(false)}
                            className="group flex items-center gap-1.5 text-gray-600
                              hover:text-[#015bad] text-sm transition-colors duration-150 py-0.5"
                          >
                            <ArrowRight
                              size={12}
                              className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0
                                transition-all duration-150 text-[#015bad] flex-shrink-0"
                            />
                            <span>{service.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer row */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {services.length} services across {departments.length} departments
                </p>
                <a
                  href="#services"
                  onClick={(e) => { handleNavigation(e, '#services'); setShowMegaMenu(false); }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#015bad] 
                    hover:gap-2.5 transition-all duration-200"
                >
                  View All Services <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-8 py-6 text-center text-gray-400 text-sm">
              Loading services...
            </div>
          )}
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
