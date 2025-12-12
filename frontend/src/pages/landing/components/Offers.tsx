// frontend/src/pages/landing/components/Offers.tsx
import { useEffect, useState } from "react";
import { listOffers } from "@/api/offers";
import type { Offer } from "@/api/offers";

type Props = {
  limit?: number; // optional: limit number of cards
  showFeaturedOnly?: boolean; // default false
};

export default function Offers({ limit = 6, showFeaturedOnly = false }: Props) {
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Latest Offers</h2>
          <div>Loading offers...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Latest Offers</h2>
          <div className="text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Latest Offers</h2>
          <div className="text-gray-500">No offers available at the moment. Check back soon!</div>
        </div>
      </section>
    );
  }

  return (
    <section id="offers" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Latest Offers</h2>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={() => setFeaturedOnly((s) => !s)}
                className="form-checkbox h-4 w-4"
              />
              <span className="text-sm">Featured</span>
            </label>

            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={limitedOnly}
                onChange={() => setLimitedOnly((s) => !s)}
                className="form-checkbox h-4 w-4"
              />
              <span className="text-sm">Limited time</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.slice(0, limit).map((offer) => (
            <article key={offer.id} className="relative bg-white rounded-xl shadow p-4 overflow-hidden">
              <div className="relative">
                {renderBadge(offer)}
                <div className="h-44 w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                  {offer.image ? (
                    // Image urls are served from Cloudinary or backend media URL (fully-qualified)
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold">{offer.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{offer.short_description || offer.description}</p>

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
                    <a
                      href={offer.cta_link || `/offers/${offer.slug || offer.id}`}
                      className="inline-block bg-black text-white px-4 py-2 rounded-md text-sm"
                    >
                      {offer.cta_text || "Claim Offer"}
                    </a>
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
