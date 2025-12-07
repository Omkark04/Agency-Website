import { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar.tsx';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { TrustStrip } from './components/TrustStrip.tsx';
import { Services } from './components/Services.tsx';
import CaseStudies from './components/CaseStudies.tsx';
import Process from './components/Process.tsx';
import { Pricing } from './components/Pricing.tsx';
import { Testimonials } from './components/Testimonials.tsx';
import { About } from './components/About.tsx';
import { Contact } from './components/Contact.tsx';
import { Footer } from './components/Footer.tsx';
import AuthModal from './components/AuthModal.tsx';
import WhatsappFloat from './components/WhatsappFloat.tsx';

export const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Toggle dark mode class on document element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleGetStartedClick = () => {
    // Handle get started click - you can add functionality here
    console.log('Get Started clicked');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <TopBar />
      <Header />
      <main>
        <Hero onGetStartedClick={handleGetStartedClick} />
        <TrustStrip />
        <Services />
        <CaseStudies />
        <Process />
        <Pricing />
        <Testimonials />
        <About />
        <Contact />
      </main>
      <Footer />
      <WhatsappFloat />
      
      <AuthModal />
    </div>
  );
};

export default LandingPage;
