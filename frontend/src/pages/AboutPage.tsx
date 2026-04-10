import { Header } from './landing/components/Header';
import { Footer } from './landing/components/Footer';
import { About } from './landing/components/About';
import { SEOHead } from '../components/shared/SEOHead';
import BackToTop from '../components/ui/BackToTop';
import WhatsappFloat from './landing/components/WhatsappFloat';
import ContactFloat from './landing/components/ContactFloat';
import { VisionMission } from './landing/components/VisionMission';
import { CoreValues } from './landing/components/CoreValues';

export const AboutPage = () => {
  return (
    <div className="bg-white text-gray-900 selection:bg-[#015bad]/30 selection:text-[#F5B041]">
      <SEOHead 
        title="About Us | OneKraft"
        description="Learn more about OneKraft, our mission, our values, and why we are your best partner for digital transformation and business growth."
        url="/about"
      />
      
      <main className="pt-24 md:pt-32">
        <About />
        <VisionMission />
        <CoreValues />
      </main>
    </div>
  );
};

export default AboutPage;
