import { Outlet } from 'react-router-dom';
import { Header } from '../../pages/landing/components/Header';
import { Footer } from '../../pages/landing/components/Footer';
import ContactFloat from '../../pages/landing/components/ContactFloat';
import WhatsappFloat from '../../pages/landing/components/WhatsappFloat';
import BackToTop from '../ui/BackToTop';

/**
 * StaticThemeWrapper forces a specific theme (Dark Mode) on all public-facing pages.
 * This ensures consistency and prevents public pages from changing based on 
 * system or browser preferences.
 * 
 * Update: Now serves as the main Public Layout with Header and Footer.
 */
export const StaticThemeWrapper: React.FC = () => {
  return (
    <div className="bg-white text-gray-900 min-h-screen selection:bg-[#015bad]/30 selection:text-[#F5B041] flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ContactFloat />
      <WhatsappFloat />
      <BackToTop />
    </div>
  );
};

export default StaticThemeWrapper;
