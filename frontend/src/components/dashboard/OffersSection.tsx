import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { listOffers } from "@/api/offers";
import type { Offer } from "@/api/offers";
import { FiTag, FiArrowRight } from "react-icons/fi";

export default function OffersSection() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const resp = await listOffers({ limit: 10 }); // Fetch more to randomize
      const data: Offer[] = (resp.data && (resp.data.results ?? resp.data)) || [];
      
      // Shuffle and take 3 random offers
      const shuffled = Array.isArray(data) ? [...data].sort(() => 0.5 - Math.random()) : [];
      setOffers(shuffled.slice(0, 3));
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null; // Don't show section if no offers
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiTag className="text-blue-600" />
          Special Offers
        </h2>
        <button
          onClick={() => navigate("/offers")}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          View All Offers <FiArrowRight />
        </button>
      </div>

      {/* OFFERS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {offers.map((offer, idx) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/dashboard/offers")}
          >
            {/* DISCOUNT BADGE */}
            {offer.discount_value && (
              <div className="inline-block bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold mb-2">
                {offer.discount_type === "percent"
                  ? `${offer.discount_value}% OFF`
                  : `₹${offer.discount_value} OFF`}
              </div>
            )}

            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{offer.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {offer.short_description || offer.description}
            </p>

            {/* PRICING */}
            {offer.discounted_price && (
              <div className="mb-2">
                <span className="text-lg font-bold text-blue-600">₹{offer.discounted_price}</span>
                {offer.original_price && (
                  <span className="ml-2 text-xs text-gray-500 line-through">
                    ₹{offer.original_price}
                  </span>
                )}
              </div>
            )}

            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              Learn More <FiArrowRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
