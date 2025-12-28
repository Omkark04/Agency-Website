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


export const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);


  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);


  return (
    <div className={`min-h-screen overflow-x-hidden ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
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
            "telephone": "+91-9876543210",
            "contactType": "customer service"
          }
        }}
      />
      <Header onAuthButtonClick={() => setIsAuthModalOpen(true)} />


      <main className="mt-20 overflow-x-hidden">
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
