import { useState } from 'react';
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


export const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="bg-white text-gray-900">
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
      
      <main>
        <Hero onGetStartedClick={() => setIsAuthModalOpen(true)} />
        <Services />
        <ClientsSection />
        <PortfolioSection />
        <Process />

        <Testimonials />
        <About />
      </main>
    </div>
  );
};


export default LandingPage;
