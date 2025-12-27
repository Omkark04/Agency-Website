import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from '../landing/components/Services';
import Offers from '../landing/components/Offers';
import PortfolioSection from './components/PortfolioSection'; // Add this import
import Process from './components/Process';
import { Pricing } from './components/Pricing';
import Testimonials from './components/Testimonials';
import { About } from './components/About';
import Contact from './components/Contact';
import { Footer } from './components/Footer';
import AuthModal from './components/AuthModal';
import WhatsappFloat from './components/WhatsappFloat';
import ContactFloat from './components/ContactFloat';


export const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);


  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);


  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Header onAuthButtonClick={() => setIsAuthModalOpen(true)} />


      <main className="mt-20">
        <Hero onGetStartedClick={() => setIsAuthModalOpen(true)} />
        <Services />
        <Offers />
        <PortfolioSection />
        <Process />
        <Pricing />
        <Testimonials />
        <About />
        <Contact />
      </main>


      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ContactFloat />
      <WhatsappFloat />
    </div>
  );
};


export default LandingPage;
