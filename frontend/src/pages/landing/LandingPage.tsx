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
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // Add/remove dark class based on state
    document.documentElement.classList.toggle('dark', prefersDark);
    
    // Listen for system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleGetStartedClick = () => {
    // Smooth scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <TopBar />
      <Header />
      <main className="flex-grow pt-[120px] md:pt-[100px]" style={{ scrollMarginTop: '120px' }}>
        <section id="home" className="scroll-mt-24">
          <Hero onGetStartedClick={handleGetStartedClick} />
        </section>
        <TrustStrip />
        <section id="services" className="scroll-mt-24">
          <Services />
        </section>
        <section id="work" className="scroll-mt-24">
          <CaseStudies />
        </section>
        <section id="process" className="scroll-mt-24">
          <Process />
        </section>
        <section id="pricing" className="scroll-mt-24">
          <Pricing />
        </section>
        <section id="testimonials" className="scroll-mt-24">
          <Testimonials />
        </section>
        <section id="about" className="scroll-mt-24">
          <About />
        </section>
        <section id="contact" className="scroll-mt-24">
          <Contact />
        </section>
      </main>
      <Footer />
      <AuthModal />
      <WhatsappFloat />
    </div>
  );
};

export default LandingPage;
