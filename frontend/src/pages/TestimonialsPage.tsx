import Testimonials from './landing/components/Testimonials';
import { SEOHead } from '../components/shared/SEOHead';

export const TestimonialsPage = () => {
  return (
    <div className="bg-[#0A1F44]">
      <SEOHead 
        title="Success Stories & Testimonials | OneKraft"
        description="Read what our clients have to say about their experience working with OneKraft. Real success stories, real partnerships."
        url="/testimonials"
      />
      
      <main className="pt-20 md:pt-28">
        <Testimonials />
      </main>
    </div>
  );
};

export default TestimonialsPage;
