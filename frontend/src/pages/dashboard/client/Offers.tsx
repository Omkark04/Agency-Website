
import { useState, useEffect } from 'react';
import { listOffers } from '../../../api/offers';
import type { Offer } from '../../../api/offers';
import { 
  Tag,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      // Fetch active and approved offers
      const response = await listOffers({ is_active: true, is_approved: true });
      // API response might be in data.results or just data depending on pagination
      // For now assuming response.data is the array or response.data.results
      const data = response.data.results || response.data;
      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading exclusive offers...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          Special Offers
        </h1>
        <p className="text-gray-500 mt-1">Exclusive deals and discounts for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length > 0 ? (
          offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors`}>
                    <Tag className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  {offer.is_limited_time && (
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Limited Time
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{offer.short_description}</p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {offer.discount_type === 'percent' 
                      ? `${offer.discount_value}% OFF`
                      : `Save ₹${offer.discount_value}`
                    }
                  </span>
                  {offer.original_price && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{offer.original_price}
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {offer.features?.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 rounded-xl font-medium text-white shadow-lg shadow-blue-500/25 transition-transform active:scale-95 bg-gradient-to-r from-blue-600 to-blue-700">
                  {offer.cta_text || 'Claim Offer'}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active offers</h3>
            <p className="text-gray-500">Check back later for new deals!</p>
          </div>
        )}
      </div>
    </div>
  );
}

