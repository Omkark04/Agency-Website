// Razorpay Checkout Utility
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

/**
 * Load Razorpay checkout script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay checkout modal
 * Returns a promise that resolves with payment verification data
 */
export const initializeRazorpayCheckout = (
  options: RazorpayOptions
): Promise<{
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
} | null> => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded'));
      return;
    }

    const razorpayOptions: RazorpayOptions = {
      ...options,
      handler: (response) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          resolve(null); // User closed the modal
        }
      }
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  });
};

/**
 * Complete payment flow:
 * 1. Load Razorpay script
 * 2. Open checkout modal
 * 3. Return verification data
 */
export const completeRazorpayPayment = async (
  razorpayKey: string,
  orderId: string,
  amount: number,
  orderDetails: {
    title: string;
    description?: string;
  },
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  }
): Promise<{
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
} | null> => {
  // Load Razorpay script
  const loaded = await loadRazorpayScript();
  
  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  // Initialize checkout
  const options: RazorpayOptions = {
    key: razorpayKey,
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    order_id: orderId,
    name: 'UdyogWorks',
    description: orderDetails.description || orderDetails.title,
    image: '/logo.png', // Optional: Add your logo path
    prefill,
    theme: {
      color: '#ff9f00' // Orange theme color
    },
    handler: () => {}, // Will be overridden in initializeRazorpayCheckout
  };

  return initializeRazorpayCheckout(options);
};

export default {
  loadRazorpayScript,
  initializeRazorpayCheckout,
  completeRazorpayPayment
};
