import { Header } from './landing/components/Header';
import { Footer } from './landing/components/Footer';
import Contact from './landing/components/Contact';
import { SEOHead } from '../components/shared/SEOHead';
import BackToTop from '../components/ui/BackToTop';
import WhatsappFloat from './landing/components/WhatsappFloat';
import ContactFloat from './landing/components/ContactFloat';

export const ContactPage = () => {
  return (
    <div className="bg-white text-gray-900 selection:bg-[#015bad]/30 selection:text-[#F5B041]">
      <SEOHead 
        title="Contact Us | OneKraft"
        description="Get in touch with OneKraft for your project inquiries. Our team is ready to help you with web development, digital marketing, and more."
        url="/contact"
      />
      
      <main className="pt-24 md:pt-32">
        <Contact />
      </main>
    </div>
  );
};

export default ContactPage;
