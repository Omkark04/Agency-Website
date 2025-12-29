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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Your Plan</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Choose the pricing plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {priceCards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleSelect(card)}
            className={`relative border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-200 ${
              selectedCard?.id === card.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
            }`}
          >
            {selectedCard?.id === card.id && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <FiCheck className="text-white h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}

            <div className="mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{card.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{card.description}</p>
            </div>

            <div className="mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                ₹{typeof card.price === 'string' ? parseFloat(card.price).toLocaleString('en-IN') : Number(card.price).toLocaleString('en-IN')}
              </span>
            </div>

            <ul className="space-y-2 sm:space-y-3">
              {card.features?.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {priceCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No pricing plans available for this service</p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedCard}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          Continue with {selectedCard?.title || 'Selected Plan'}
        </button>
      </div>
    </div>
  );
};

export default PriceCardSelector;
