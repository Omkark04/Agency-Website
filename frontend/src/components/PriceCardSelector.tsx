// frontend/src/components/PriceCardSelector.tsx
import React, { useState, useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import { listPriceCards } from '../api/pricecards';
import type { PriceCard } from '../api/pricecards';

interface PriceCardSelectorProps {
  serviceId: number;
  onSelect: (priceCard: PriceCard) => void;
  onCancel: () => void;
}

export const PriceCardSelector: React.FC<PriceCardSelectorProps> = ({
  serviceId,
  onSelect,
  onCancel
}) => {
  const [priceCards, setPriceCards] = useState<PriceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<PriceCard | null>(null);

  useEffect(() => {
    fetchPriceCards();
  }, [serviceId]);

  const fetchPriceCards = async () => {
    try {
      // Fetch price cards for this service using the same API as Pricing.tsx
      const response = await listPriceCards({ service: serviceId, is_active: true });
      setPriceCards(response.data);
    } catch (error) {
      console.error('Failed to fetch price cards:', error);
      setPriceCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (card: PriceCard) => {
    setSelectedCard(card);
  };

  const handleConfirm = () => {
    if (selectedCard) {
      onSelect(selectedCard);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Plan</h2>
        <p className="text-gray-600">Choose the pricing plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {priceCards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleSelect(card)}
            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
              selectedCard?.id === card.id
                ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            {selectedCard?.id === card.id && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <FiCheck className="text-white h-5 w-5" />
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{card.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-black text-blue-600">
                ₹{typeof card.price === 'string' ? parseFloat(card.price).toLocaleString('en-IN') : Number(card.price).toLocaleString('en-IN')}
              </span>
            </div>

            <ul className="space-y-3">
              {card.features?.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <FiCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {priceCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No pricing plans available for this service</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedCard}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          Continue with {selectedCard?.title || 'Selected Plan'}
        </button>
      </div>
    </div>
  );
};

export default PriceCardSelector;
