// frontend/src/pages/landing/components/Offers.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listOffers } from "@/api/offers";
import type { Offer } from "@/api/offers";
import { useProtectedNavigation } from "../../../hooks/useProtectedNavigation";
import AuthModal from './AuthModal';


type Props = {
  limit?: number; // optional: limit number of cards
  showFeaturedOnly?: boolean; // default false
};

export default function Offers({ limit = 6, showFeaturedOnly = false }: Props) {
  const { navigateTo, showAuthModal, setShowAuthModal } = useProtectedNavigation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(showFeaturedOnly);
  const [limitedOnly, setLimitedOnly] = useState<boolean>(false);

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredOnly, limitedOnly]);

  async function fetchOffers() {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = { page_size: limit };
      if (featuredOnly) params.is_featured = true;
      if (limitedOnly) params.offer_type = "limited";

      const resp = await listOffers(params);
      // If your API returns paginated object {results: [...]} handle both
      const data: Offer[] = (resp.data && (resp.data.results ?? resp.data)) || [];
      console.log(data);
      setOffers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load offers:", err);
      setError("Failed to load offers. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Render helpers
  const renderBadge = (offer: Offer) => {
    const percent = offer.discount_percentage ?? offer.discount_value ?? 0;
    if (!percent) return null;
    const label = offer.discount_type === "flat" ? `₹${offer.discount_value} OFF` : `${percent}% OFF`;
    return (
      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
        {label}
      </div>
    );
  };

  const renderRemaining = (offer: Offer) => {
    if (offer.remaining_days === null || offer.remaining_days === undefined) return null;
    if (offer.remaining_days <= 0) return <span className="text-xs text-red-600">Expired</span>;
    return <span className="text-xs text-gray-700">{offer.remaining_days} day{offer.remaining_days > 1 ? "s" : ""} left</span>;
  };

  if (loading) {
    return (
      <section id="offers" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
          <div className="text-center mb-16">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-full w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-20 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="offers" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl text-center">
          <div className="inline-block p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
            <button 
              onClick={fetchOffers}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry Loading Offers
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <section id="offers" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Offers Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No offers are currently available. Check back soon!
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="offers" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#00C2A8]/10 to-[#0066FF]/10 text-[#00C2A8] dark:text-[#00C2A8] text-sm font-semibold mb-4">
            Special Offers
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Exclusive Deals & Promotions
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Discover amazing offers and limited-time deals on our premium services. 
            Save big while getting the quality you deserve.
          </p>
        </motion.div>

        {/* Filter Options */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={() => setFeaturedOnly((s) => !s)}
              className="w-4 h-4 text-[#00C2A8] bg-gray-100 border-gray-300 rounded focus:ring-[#00C2A8] focus:ring-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Featured Only</span>
          </label>

          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={limitedOnly}
              onChange={() => setLimitedOnly((s) => !s)}
              className="w-4 h-4 text-[#00C2A8] bg-gray-100 border-gray-300 rounded focus:ring-[#00C2A8] focus:ring-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Limited Time</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.slice(0, limit).map((offer) => (
            <motion.article 
              key={offer.id} 
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ 
                y: -8, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <div className="relative">
                {renderBadge(offer)}
                <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden flex items-center justify-center group">
                  {(offer.imageURL || offer.image) ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      src={(offer.imageURL || offer.image) || undefined}
                      alt={offer.title}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 text-sm">No image</div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{offer.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">{offer.short_description || offer.description}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    {offer.discounted_price ? (
                      <div className="text-sm">
                        <span className="text-xl font-bold">₹{offer.discounted_price}</span>{" "}
                        {offer.original_price ? <span className="line-through text-sm text-gray-500 ml-2">₹{offer.original_price}</span> : null}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">Starting at ₹{offer.original_price ?? "NA"}</div>
                    )}
                    <div className="mt-1">{renderRemaining(offer)}</div>
                  </div>

                  <div>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={offer.cta_link || `/offers/${offer.slug || offer.id}`}
                      className="inline-block bg-black text-white px-4 py-2 rounded-md text-sm"
                    >
                      {offer.cta_text || "Claim Offer"}
                    </motion.a>
                  </div>
                </div>

                {offer.features && offer.features.length > 0 && (
                  <ul className="mt-3 text-sm text-gray-600 list-disc list-inside">
                    {offer.features.slice(0, 3).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.article>
          ))}
          
        </div>

        {/* VIEW ALL OFFERS BUTTON */}
        {offers.length >= limit && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigateTo('/offers')}
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              View All Offers →
            </button>
          </div>
        )}
        
        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </div>
    </section>
  );
}

