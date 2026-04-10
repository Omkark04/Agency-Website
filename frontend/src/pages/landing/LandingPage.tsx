import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from '../landing/components/Services';
import PortfolioSection from './components/PortfolioSection';
import { ClientsSection } from './components/ClientsSection';
import Process from './components/Process';

import Testimonials from './components/Testimonials';
import { About } from './components/About';
import Contact from './components/Contact';
import { SEOHead } from '../../components/shared/SEOHead';
import IntroAnimation from '../../components/animations/IntroAnimation';
import { useIntro } from '../../context/IntroContext';


export const LandingPage = () => {
  const { hasViewedIntro, setHasViewedIntro } = useIntro();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(!hasViewedIntro);
  const [isLoaded, setIsLoaded] = useState(hasViewedIntro);


  const handleIntroComplete = () => {
    setShowIntro(false);
    setIsLoaded(true);
    setHasViewedIntro(true);
  };


  return (
    <>
      {/* Main Content - Always rendered so it shows through transparent text */}
      <div 
        className={`min-h-screen overflow-x-hidden transition-opacity duration-500 bg-white text-gray-900 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SEOHead 
          title="OneKraft"
          description="Transform your business with expert services in web development, data analytics, digital marketing, and business consulting. Get started today!"
          schema={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "OneKraft",
            "url": "https://onekraft.in",
            "logo": "https://onekraft.in/logo.png",
            "sameAs": [
              "https://facebook.com/onekraft",
              "https://linkedin.com/company/onekraft",
              "https://instagram.com/onekraft"
            ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-8390498423",
                "contactType": "customer service"
              }
          }}
        />
        
        <main className="overflow-x-hidden">
          <Hero onGetStartedClick={() => setIsAuthModalOpen(true)} />
          <Services />
          <ClientsSection />
          <PortfolioSection />
          <Process />

          <Testimonials />
          <About />
        </main>
      </div>
      
      {/* Intro Animation - Overlays on top with semi-transparent background */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
    </>
  );
};


export default LandingPage;
