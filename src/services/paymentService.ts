// ============================================================================
// PAYMENT SERVICE - Database & Moyasar Integration
// ============================================================================

import { supabase } from '../lib/supabase';
import moyasarService from './moyasarService';
import type {
  Payment,
  Invoice,
  Refund,
  PaymentStatus,
  PaymentMethodType,
  InvoiceStatus,
  CheckoutFormData,
  PaymentIntent,
  MoyasarPaymentResponse,
} from '../types/payment';

// ============================================================================
// PAYMENT OPERATIONS
// ============================================================================

/**
 * Create a payment record in the database
 */
export async function createPayment(payment: Partial<Payment>): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();

  if (error) throw new Error(`Failed to create payment: ${error.message}`);
  return data;
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error) {
    console.error('Error fetching payment:', error);
    return null;
  }

  return data;
}

/**
 * Get payments for an order
 */
export async function getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
  return data || [];
}

/**
 * Get payments for a client
 */
export async function getPaymentsByClientId(clientId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
  return data || [];
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  additionalData?: Partial<Payment>
): Promise<Payment> {
  const updateData: Partial<Payment> = {
    status,
    ...additionalData,
  };

  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update payment: ${error.message}`);
  return data;
}

// ============================================================================
// PAYMENT PROCESSING
// ============================================================================

/**
 * Process a checkout and create payment with Moyasar
 */
export async function processCheckout(
  orderId: string,
  clientId: string,
  amount: number,
  checkoutData: CheckoutFormData,
  callbackUrl: string
): Promise<{ payment: Payment; moyasarResponse: MoyasarPaymentResponse }> {
  try {
    // 1. Create payment record in database
    const payment = await createPayment({
      order_id: orderId,
      client_id: clientId,
      amount,
      currency: 'SAR',
      payment_method: PaymentMethodType.CREDITCARD,
      status: PaymentStatus.PENDING,
      description: `Payment for order ${orderId}`,
      callback_url: callbackUrl,
    });

    // 2. Process payment with Moyasar
    const moyasarResponse = await moyasarService.processCreditCard(
      orderId,
      amount,
      {
        name: checkoutData.cardName,
        number: checkoutData.cardNumber,
        cvc: checkoutData.cvc,
        month: checkoutData.expiryMonth,
        year: checkoutData.expiryYear,
      },
      callbackUrl,
      `Order #${orderId}`
    );

    // 3. Update payment with Moyasar details
    const updatedPayment = await updatePaymentStatus(
      payment.id,
      moyasarService.mapMoyasarStatus(moyasarResponse.status),
      {
        moyasar_payment_id: moyasarResponse.id,
        moyasar_transaction_url: moyasarResponse.source.transaction_url,
        card_last_four: moyasarResponse.source.number,
        card_brand: moyasarResponse.source.company,
        metadata: moyasarResponse.metadata,
      }
    );

    return { payment: updatedPayment, moyasarResponse };
  } catch (error) {
    console.error('Checkout processing error:', error);
    throw error;
  }
}

/**
 * Sync payment status with Moyasar
 */
export async function syncPaymentWithMoyasar(paymentId: string): Promise<Payment> {
  const payment = await getPaymentById(paymentId);
  if (!payment || !payment.moyasar_payment_id) {
    throw new Error('Payment not found or missing Moyasar ID');
  }

  const moyasarPayment = await moyasarService.fetchPayment(payment.moyasar_payment_id);

  const updatedPayment = await updatePaymentStatus(
    paymentId,
    moyasarService.mapMoyasarStatus(moyasarPayment.status),
    {
      moyasar_transaction_url: moyasarPayment.source.transaction_url,
    }
  );

  return updatedPayment;
}

// ============================================================================
// INVOICE OPERATIONS
// ============================================================================

/**
 * Create an invoice
 */
export async function createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) throw new Error(`Failed to create invoice: ${error.message}`);
  return data;
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }

  return data;
}

/**
 * Get invoices for a client
 */
export async function getInvoicesByClientId(clientId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
  return data || [];
}

/**
 * Get invoice for an order
 */
export async function getInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }

  return data;
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
): Promise<Invoice> {
  const updateData: Partial<Invoice> = { status };

  if (status === InvoiceStatus.PAID) {
    updateData.paid_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update invoice: ${error.message}`);
  return data;
}

/**
 * Generate invoice for order
 */
export async function generateInvoiceForOrder(
  orderId: string,
  clientId: string,
  supplierId: string,
  subtotal: number,
  taxPercent: number = 15
): Promise<Invoice> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term

  const invoice = await createInvoice({
    order_id: orderId,
    client_id: clientId,
    supplier_id: supplierId,
    subtotal,
    tax_percent: taxPercent,
    status: InvoiceStatus.DRAFT,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    terms: 'Payment due within 30 days of invoice date.',
  });

  return invoice;
}

// ============================================================================
// REFUND OPERATIONS
// ============================================================================

/**
 * Create a refund
 */
export async function createRefund(refund: Partial<Refund>): Promise<Refund> {
  const { data, error } = await supabase
    .from('refunds')
    .insert([refund])
    .select()
    .single();

  if (error) throw new Error(`Failed to create refund: ${error.message}`);
  return data;
}

/**
 * Process a refund through Moyasar
 */
export async function processRefund(
  paymentId: string,
  amount: number,
  reason: string,
  processedBy: string
): Promise<Refund> {
  const payment = await getPaymentById(paymentId);
  if (!payment || !payment.moyasar_payment_id) {
    throw new Error('Payment not found or missing Moyasar ID');
  }

  // Create refund in Moyasar
  const moyasarRefund = await moyasarService.refundPayment(
    payment.moyasar_payment_id,
    {
      amount: moyasarService.toHalalas(amount),
      reason,
    }
  );

  // Create refund record in database
  const refund = await createRefund({
    payment_id: paymentId,
    order_id: payment.order_id,
    moyasar_refund_id: moyasarRefund.id,
    amount,
    reason,
    status: PaymentStatus.PENDING,
    processed_by: processedBy,
  });

  // Update payment status
  await updatePaymentStatus(paymentId, PaymentStatus.REFUNDED, {
    refunded_at: new Date().toISOString(),
  });

  return refund;
}

/**
 * Get refunds for a payment
 */
export async function getRefundsByPaymentId(paymentId: string): Promise<Refund[]> {
  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .eq('payment_id', paymentId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch refunds: ${error.message}`);
  return data || [];
}

// ============================================================================
// PAYMENT STATISTICS
// ============================================================================

/**
 * Get payment statistics for a client
 */
export async function getClientPaymentStats(clientId: string) {
  const payments = await getPaymentsByClientId(clientId);

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === PaymentStatus.PAID).length,
    pending: payments.filter(p => p.status === PaymentStatus.PENDING).length,
    failed: payments.filter(p => p.status === PaymentStatus.FAILED).length,
    totalAmount: payments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return stats;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const paymentService = {
  // Payments
  createPayment,
  getPaymentById,
  getPaymentsByOrderId,
  getPaymentsByClientId,
  updatePaymentStatus,
  processCheckout,
  syncPaymentWithMoyasar,

  // Invoices
  createInvoice,
  getInvoiceById,
  getInvoicesByClientId,
  getInvoiceByOrderId,
  updateInvoiceStatus,
  generateInvoiceForOrder,

  // Refunds
  createRefund,
  processRefund,
  getRefundsByPaymentId,

  // Statistics
  getClientPaymentStats,
};

export default paymentService;
