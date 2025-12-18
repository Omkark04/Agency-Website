// frontend/src/utils/analytics.ts
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics 4
 */
export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        debug_mode: import.meta.env.DEV, // Enable debug mode in development
      },
    });
    console.log('✅ Google Analytics initialized:', GA_MEASUREMENT_ID);
  } else {
    console.warn('⚠️ Google Analytics Measurement ID not found');
  }
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path, title });
  }
};

/**
 * Track custom event
 */
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

/**
 * Track button click
 */
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('Button', 'Click', `${buttonName}${location ? ` - ${location}` : ''}`);
};

/**
 * Track form submission
 */
export const trackFormSubmit = (formName: string, success: boolean) => {
  trackEvent('Form', success ? 'Submit Success' : 'Submit Error', formName);
};

/**
 * Track user login
 */
export const trackLogin = (method: string) => {
  trackEvent('User', 'Login', method);
};

/**
 * Track user registration
 */
export const trackRegistration = (method: string) => {
  trackEvent('User', 'Registration', method);
};

/**
 * Track order/purchase
 */
export const trackPurchase = (orderId: string, value: number, currency: string = 'USD') => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event('purchase', {
      transaction_id: orderId,
      value,
      currency,
    });
  }
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackButtonClick,
  trackFormSubmit,
  trackLogin,
  trackRegistration,
  trackPurchase,
};
