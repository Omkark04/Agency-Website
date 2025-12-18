import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listOffers } from "../../../api/offers";
import type { Offer } from "../../../api/offers";
import { FiTag, FiClock, FiArrowRight } from "react-icons/fi";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchOffers();
  }, [filterCategory]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterCategory !== "all") {
        params.offer_category = filterCategory;
      }
      const resp = await listOffers(params);
      const data: Offer[] = (resp.data && (resp.data.results ?? resp.data)) || [];
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <FiTag className="inline mr-3" />
            Special Offers
          </h1>
          <p className="text-gray-600">Explore our exclusive deals and save on your next project</p>
        </div>

        {/* FILTERS */}
        <div className="mb-6 flex gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="all">All Offers</option>
            <option value="regular">Regular Offers</option>
            <option value="special">Special Offers</option>
          </select>
        </div>

        {/* OFFERS GRID */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20">
            <FiTag className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No offers available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* IMAGE */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {(offer.imageURL || offer.image) ? (
                    <img
                      src={(offer.imageURL || offer.image) || undefined}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <FiTag size={64} />
                    </div>
                  )}
                  {/* DISCOUNT BADGE */}
                  {offer.discount_value && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {offer.discount_type === "percent"
                        ? `${offer.discount_value}% OFF`
                        : `₹${offer.discount_value} OFF`}
                    </div>
                  )}
                  {/* CATEGORY BADGE */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      offer.offer_category === "special"
                        ? "bg-purple-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}>
                      {offer.offer_category === "special" ? "Special" : "Regular"}
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {offer.short_description || offer.description}
                  </p>

                  {/* PRICING */}
                  {offer.discounted_price && (
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-blue-600">₹{offer.discounted_price}</span>
                      {offer.original_price && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₹{offer.original_price}
                        </span>
                      )}
                    </div>
                  )}

                  {/* VALIDITY */}
                  {offer.remaining_days !== null && offer.remaining_days !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <FiClock />
                      <span>
                        {offer.remaining_days > 0
                          ? `${offer.remaining_days} day${offer.remaining_days > 1 ? "s" : ""} left`
                          : "Expired"}
                      </span>
                    </div>
                  )}

                  {/* FEATURES */}
                  {offer.features && offer.features.length > 0 && (
                    <ul className="mb-4 space-y-1">
                      {offer.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA BUTTON */}
                  <a
                    href={offer.cta_link || `/offers/${offer.slug || offer.id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    {offer.cta_text || "Claim Offer"} <FiArrowRight className="inline ml-2" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
