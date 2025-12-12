import { useState, useEffect } from 'react';
import { 
  getAllTestimonials, 
  approveTestimonial, 
  rejectTestimonial, 
  deleteTestimonial,
  toggleFeaturedTestimonial 
} from '../../../api/testinomials';
import type { TestimonialAdmin } from '../../../api/testinomials';
import { Button } from '../../../components/ui/Button';
import { FiCheck, FiX, FiTrash2, FiStar, FiPhone, FiMail } from 'react-icons/fi';

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<TestimonialAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const params = filter === 'all' ? {} : { is_approved: filter === 'approved' };
      const response = await getAllTestimonials(params);
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveTestimonial(id);
      fetchTestimonials();
    } catch (error) {
      console.error('Error approving testimonial:', error);
      alert('Failed to approve testimonial');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectTestimonial(id);
      fetchTestimonials();
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      alert('Failed to reject testimonial');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await toggleFeaturedTestimonial(id);
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Failed to toggle featured status');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Testimonials Management</h1>
        <div className="text-center py-12">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Testimonials Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All ({testimonials.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
        </div>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No testimonials found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-white border rounded-lg p-6 ${
                !testimonial.is_approved ? 'border-yellow-400 bg-yellow-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{testimonial.client_name}</h3>
                    {testimonial.is_featured && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        <FiStar className="inline mr-1" size={12} />
                        Featured
                      </span>
                    )}
                    {testimonial.is_approved ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {testimonial.client_role && `${testimonial.client_role} • `}
                    {testimonial.client_company || 'No company'}
                  </p>
                  {testimonial.service_title && (
                    <p className="text-sm text-blue-600 mt-1">Service: {testimonial.service_title}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!testimonial.is_approved && (
                    <Button
                      onClick={() => handleApprove(testimonial.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <FiCheck className="mr-1" /> Approve
                    </Button>
                  )}
                  {testimonial.is_approved && (
                    <Button
                      onClick={() => handleReject(testimonial.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <FiX className="mr-1" /> Unapprove
                    </Button>
                  )}
                  <Button
                    onClick={() => handleToggleFeatured(testimonial.id)}
                    className={testimonial.is_featured ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'}
                  >
                    <FiStar className="mr-1" /> {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button
                    onClick={() => handleDelete(testimonial.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2">
                  <FiPhone size={14} />
                  <span>{testimonial.phone}</span>
                </div>
                {testimonial.email && (
                  <div className="flex items-center gap-2">
                    <FiMail size={14} />
                    <span>{testimonial.email}</span>
                  </div>
                )}
                <div className="col-span-2 text-xs text-gray-500">
                  Submitted: {new Date(testimonial.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
