import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import api from '../../../api/api';

export const Contact = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_id: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // ✅ Load departments from backend
  useEffect(() => {
    api.get('/api/departments/')
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));
  }, []);

  // ✅ Load services when department changes
  useEffect(() => {
    if (!selectedDepartment) {
      setServices([]);
      return;
    }

    api.get(`/api/services/?department=${selectedDepartment}`)
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, [selectedDepartment]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/api/contact/submit/', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_id: formData.service_id,
        message: formData.message
      });

      setSubmitStatus({
        success: true,
        message: 'Thank you for your message! We will contact you shortly.'
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        service_id: '',
        message: ''
      });

      setSelectedDepartment('');

      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error: any) {
      let msg = 'Something went wrong. Try again.';
      if (error.response?.data) {
        msg = Object.values(error.response.data).flat().join(' ');
      }

      setSubmitStatus({
        success: false,
        message: msg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* ✅ HEADER */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-gray-600">
            Select a department and service and send us your requirement.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* ✅ CONTACT FORM */}
          <motion.div
            className="bg-white p-8 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {submitStatus && (
              <div
                className={`p-4 mb-6 rounded ${
                  submitStatus.success
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
                className="w-full px-4 py-3 border rounded"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Your Email"
                className="w-full px-4 py-3 border rounded"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full px-4 py-3 border rounded"
              />

              {/* ✅ DEPARTMENT */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-3 border rounded"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>
                    {dep.title}
                  </option>
                ))}
              </select>

              {/* ✅ SERVICE */}
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded"
                required
                disabled={!selectedDepartment}
              >
                <option value="">Select Service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>

              <textarea
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Your Message"
                className="w-full px-4 py-3 border rounded"
              ></textarea>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
              >
                {isSubmitting ? 'Sending...' : <><Send size={18}/> Send Message</>}
              </button>
            </form>
          </motion.div>

          {/* ✅ CONTACT INFO */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <MapPin /> Mumbai, Maharashtra
            </div>
            <div>
              <Mail /> info@udyogworks.com
            </div>
            <div>
              <Phone /> +91 8208776319
            </div>

            <div className="flex gap-4">
              <Facebook />
              <Twitter />
              <Instagram />
              <Linkedin />
            </div>

            <a
              href="https://wa.me/918208776319"
              target="_blank"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded"
            >
              <MessageCircle /> WhatsApp Chat
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
