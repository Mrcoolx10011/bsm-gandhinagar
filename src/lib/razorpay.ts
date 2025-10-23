/**
 * Razorpay Integration Library
 * Handles UPI and Dynamic QR Code payments
 */

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: {
    campaign?: string;
    isAnonymous?: boolean;
    message?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  error?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Load Razorpay script dynamically
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
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Create Razorpay order on backend
 */
export const createRazorpayOrder = async (
  amount: number,
  currency: string = 'INR'
): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch('/api/razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      orderId: '',
      amount: 0,
      currency: 'INR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Verify payment on backend
 */
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/razorpay-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Initialize Razorpay payment with UPI support
 */
export const initiateRazorpayPayment = async (
  options: Omit<RazorpayOptions, 'key' | 'order_id'> & { 
    razorpayKey: string;
    orderId?: string;
  }
): Promise<void> => {
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  const razorpayOptions: RazorpayOptions = {
    key: options.razorpayKey,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    order_id: options.orderId,
    prefill: options.prefill,
    notes: options.notes,
    theme: options.theme,
    handler: options.handler,
    modal: options.modal,
  };

  const razorpay = new window.Razorpay(razorpayOptions);
  razorpay.open();
};

/**
 * Generate QR Code for UPI payment
 */
export const generateUpiQrCode = async (
  amount: number,
  orderId: string
): Promise<{ success: boolean; qrCodeUrl?: string; error?: string }> => {
  try {
    console.log('🔍 Requesting QR code from API...');
    const response = await fetch('/api/razorpay-qrcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, orderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }

    const data = await response.json();
    console.log('📱 QR code API response:', data);
    
    // If we got a UPI string, convert it to QR code using a QR code generator
    if (data.success && data.qrCodeUrl) {
      console.log('🔄 Converting UPI string to QR code image...');
      console.log('Original UPI string:', data.qrCodeUrl);
      
      // Import QRCode library dynamically
      const QRCode = (await import('qrcode')).default;
      
      // Generate QR code image as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(data.qrCodeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      console.log('✅ QR code image generated:', qrCodeDataUrl.substring(0, 50) + '...');
      
      return {
        ...data, // Include other data like amount, merchantName, etc.
        success: true,
        qrCodeUrl: qrCodeDataUrl, // Override with QR code image (base64 data URL)
        originalUpiString: data.qrCodeUrl, // Keep original for reference
      };
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
