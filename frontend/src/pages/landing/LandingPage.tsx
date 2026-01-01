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
import { SEOHead } from '../../components/shared/SEOHead';
import BackToTop from '../../components/ui/BackToTop';
import IntroAnimation from '../../components/animations/IntroAnimation';
import { useIntro } from '../../context/IntroContext';


export const LandingPage = () => {
  const { hasViewedIntro, setHasViewedIntro } = useIntro();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(!hasViewedIntro);
  const [isLoaded, setIsLoaded] = useState(hasViewedIntro);


  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIsLoaded(true);
    setHasViewedIntro(true);
  };


  return (
    <>
      {/* Main Content - Always rendered so it shows through transparent text */}
      <div 
        className={`min-h-screen overflow-x-hidden transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
      >
        <SEOHead 
          title="UdyogWorks - Business Development Agency"
          description="Transform your business with expert services in web development, data analytics, digital marketing, and business consulting. Get started today!"
          schema={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "UdyogWorks",
            "url": "https://udyogworks.in",
            "logo": "https://udyogworks.in/logo.png",
            "sameAs": [
              "https://facebook.com/udyogworks",
              "https://linkedin.com/company/udyogworks",
              "https://instagram.com/udyogworks"
            ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-8390498423",
                "contactType": "customer service"
              }
          }}
        />
        <Header onAuthButtonClick={() => setIsAuthModalOpen(true)} />


        <main className="mt-14 md:mt-20 overflow-x-hidden">
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
        <BackToTop />
      </div>
      
      {/* Intro Animation - Overlays on top with semi-transparent background */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
    </>
  );
};


export default LandingPage;
