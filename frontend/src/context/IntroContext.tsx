import React, { createContext, useContext, useState, ReactNode } from 'react';

interface IntroContextType {
  hasViewedIntro: boolean;
  setHasViewedIntro: (value: boolean) => void;
  hasViewedPricingIntro: boolean;
  setHasViewedPricingIntro: (value: boolean) => void;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export const IntroProvider = ({ children }: { children: ReactNode }) => {
  const [hasViewedIntro, setHasViewedIntro] = useState(false);
  const [hasViewedPricingIntro, setHasViewedPricingIntro] = useState(false);

  return (
    <IntroContext.Provider value={{ 
      hasViewedIntro, 
      setHasViewedIntro,
      hasViewedPricingIntro,
      setHasViewedPricingIntro
    }}>
      {children}
    </IntroContext.Provider>
  );
};

export const useIntro = () => {
  const context = useContext(IntroContext);
  if (context === undefined) {
    throw new Error('useIntro must be used within an IntroProvider');
  }
  return context;
};
