// ============================================================================
// MOYASAR PAYMENT SERVICE
// Official API Docs: https://moyasar.com/docs/api/
// ============================================================================

import type {
  MoyasarPaymentRequest,
  MoyasarPaymentResponse,
  MoyasarRefundRequest,
  MoyasarRefundResponse,
  Payment,
  PaymentMethodType,
  PaymentStatus,
} from '../types/payment';

const MOYASAR_API_URL = 'https://api.moyasar.com/v1';
const MOYASAR_API_KEY = import.meta.env.VITE_MOYASAR_API_KEY || '';
const MOYASAR_PUBLISHABLE_KEY = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || '';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert amount to halalas (smallest currency unit)
 * Moyasar expects amounts in halalas (1 SAR = 100 halalas)
 */
export function toHalalas(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert halalas back to SAR
 */
export function fromHalalas(halalas: number): number {
  return halalas / 100;
}

/**
 * Get authorization header for Moyasar API
 */
function getAuthHeaders(): HeadersInit {
  const credentials = btoa(`${MOYASAR_API_KEY}:`);
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Map Moyasar status to our internal PaymentStatus
 */
function mapMoyasarStatus(moyasarStatus: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    'initiated': PaymentStatus.PENDING,
    'paid': PaymentStatus.PAID,
    'failed': PaymentStatus.FAILED,
    'authorized': PaymentStatus.AUTHORIZED,
    'captured': PaymentStatus.CAPTURED,
    'refunded': PaymentStatus.REFUNDED,
    'voided': PaymentStatus.CANCELLED,
  };

  return statusMap[moyasarStatus] || PaymentStatus.PENDING;
}

// ============================================================================
// MOYASAR API CALLS
// ============================================================================

/**
 * Create a payment with Moyasar
 */
export async function createMoyasarPayment(
  paymentRequest: MoyasarPaymentRequest
): Promise<MoyasarPaymentResponse> {
  try {
    const response = await fetch(`${MOYASAR_API_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment creation failed');
    }

    const data: MoyasarPaymentResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Moyasar payment creation error:', error);
    throw error;
  }
}

/**
 * Fetch payment status from Moyasar
 */
export async function fetchMoyasarPayment(
  paymentId: string
): Promise<MoyasarPaymentResponse> {
  try {
    const response = await fetch(`${MOYASAR_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payment');
    }

    const data: MoyasarPaymentResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Moyasar fetch payment error:', error);
    throw error;
  }
}

/**
 * Refund a payment through Moyasar
 */
export async function refundMoyasarPayment(
  paymentId: string,
  refundRequest: MoyasarRefundRequest
): Promise<MoyasarRefundResponse> {
  try {
    const response = await fetch(
      `${MOYASAR_API_URL}/payments/${paymentId}/refund`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(refundRequest),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Refund failed');
    }

    const data: MoyasarRefundResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Moyasar refund error:', error);
    throw error;
  }
}

/**
 * List all payments (for admin purposes)
 */
export async function listMoyasarPayments(
  page: number = 1
): Promise<MoyasarPaymentResponse[]> {
  try {
    const response = await fetch(
      `${MOYASAR_API_URL}/payments?page=${page}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list payments');
    }

    const data = await response.json();
    return data.payments || [];
  } catch (error) {
    console.error('Moyasar list payments error:', error);
    throw error;
  }
}

// ============================================================================
// PAYMENT PROCESSING HELPERS
// ============================================================================

/**
 * Process a credit card payment
 */
export async function processCreditCardPayment(
  orderId: string,
  amount: number,
  cardDetails: {
    name: string;
    number: string;
    cvc: string;
    month: string;
    year: string;
  },
  callbackUrl: string,
  description: string
): Promise<MoyasarPaymentResponse> {
  const paymentRequest: MoyasarPaymentRequest = {
    amount: toHalalas(amount),
    currency: 'SAR',
    description,
    callback_url: callbackUrl,
    source: {
      type: 'creditcard',
      name: cardDetails.name,
      number: cardDetails.number.replace(/\s/g, ''),
      cvc: cardDetails.cvc,
      month: cardDetails.month,
      year: cardDetails.year,
    },
    metadata: {
      order_id: orderId,
    },
  };

  return createMoyasarPayment(paymentRequest);
}

/**
 * Process an Apple Pay payment
 */
export async function processApplePayPayment(
  orderId: string,
  amount: number,
  token: string,
  callbackUrl: string,
  description: string
): Promise<MoyasarPaymentResponse> {
  const paymentRequest: MoyasarPaymentRequest = {
    amount: toHalalas(amount),
    currency: 'SAR',
    description,
    callback_url: callbackUrl,
    source: {
      type: 'applepay',
      token,
    },
    metadata: {
      order_id: orderId,
    },
  };

  return createMoyasarPayment(paymentRequest);
}

/**
 * Verify webhook signature (if Moyasar provides webhook signatures)
 * Note: Check Moyasar docs for their specific signature verification method
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Implement signature verification based on Moyasar's documentation
  // This is a placeholder - update with actual verification logic
  console.warn('Webhook signature verification not implemented');
  return true;
}

// ============================================================================
// PAYMENT STATUS HELPERS
// ============================================================================

/**
 * Check if payment is successful
 */
export function isPaymentSuccessful(status: PaymentStatus): boolean {
  return status === PaymentStatus.PAID || status === PaymentStatus.CAPTURED;
}

/**
 * Check if payment is pending
 */
export function isPaymentPending(status: PaymentStatus): boolean {
  return status === PaymentStatus.PENDING || status === PaymentStatus.AUTHORIZED;
}

/**
 * Check if payment failed
 */
export function isPaymentFailed(status: PaymentStatus): boolean {
  return status === PaymentStatus.FAILED || status === PaymentStatus.CANCELLED;
}

/**
 * Get payment status display text
 */
export function getPaymentStatusText(status: PaymentStatus): string {
  const statusText: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Pending',
    [PaymentStatus.AUTHORIZED]: 'Authorized',
    [PaymentStatus.CAPTURED]: 'Captured',
    [PaymentStatus.PAID]: 'Paid',
    [PaymentStatus.FAILED]: 'Failed',
    [PaymentStatus.REFUNDED]: 'Refunded',
    [PaymentStatus.PARTIALLY_REFUNDED]: 'Partially Refunded',
    [PaymentStatus.CANCELLED]: 'Cancelled',
  };

  return statusText[status] || status;
}

/**
 * Get payment method display text
 */
export function getPaymentMethodText(method: PaymentMethodType): string {
  const methodText: Record<PaymentMethodType, string> = {
    [PaymentMethodType.CREDITCARD]: 'Credit Card',
    [PaymentMethodType.MADA]: 'MADA',
    [PaymentMethodType.APPLEPAY]: 'Apple Pay',
    [PaymentMethodType.STC_PAY]: 'STC Pay',
    [PaymentMethodType.BANK_TRANSFER]: 'Bank Transfer',
  };

  return methodText[method] || method;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Check if Moyasar is configured
 */
export function isMoyasarConfigured(): boolean {
  return Boolean(MOYASAR_API_KEY && MOYASAR_PUBLISHABLE_KEY);
}

/**
 * Get publishable key for frontend
 */
export function getMoyasarPublishableKey(): string {
  return MOYASAR_PUBLISHABLE_KEY;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const moyasarService = {
  // API calls
  createPayment: createMoyasarPayment,
  fetchPayment: fetchMoyasarPayment,
  refundPayment: refundMoyasarPayment,
  listPayments: listMoyasarPayments,

  // Payment processing
  processCreditCard: processCreditCardPayment,
  processApplePay: processApplePayPayment,

  // Utilities
  toHalalas,
  fromHalalas,
  mapMoyasarStatus,
  verifyWebhookSignature,

  // Status helpers
  isPaymentSuccessful,
  isPaymentPending,
  isPaymentFailed,
  getPaymentStatusText,
  getPaymentMethodText,

  // Configuration
  isConfigured: isMoyasarConfigured,
  getPublishableKey: getMoyasarPublishableKey,
};

export default moyasarService;
