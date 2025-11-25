// ============================================================================
// BANK TRANSFER SERVICE - Phase One Payment System
// ============================================================================

import { supabase } from '../lib/supabase';
import type { BankDetails, Order, OrderStatus } from '../types/types';

// ============================================================================
// BANK DETAILS OPERATIONS
// ============================================================================

/**
 * Get active bank details (MWRD's bank account)
 */
export async function getActiveBankDetails(): Promise<BankDetails | null> {
  const { data, error } = await supabase
    .from('bank_details')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching bank details:', error);
    return null;
  }

  return data;
}

/**
 * Get all bank details (Admin only)
 */
export async function getAllBankDetails(): Promise<BankDetails[]> {
  const { data, error } = await supabase
    .from('bank_details')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch bank details: ${error.message}`);
  return data || [];
}

/**
 * Create new bank details
 */
export async function createBankDetails(
  bankDetails: Omit<BankDetails, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BankDetails> {
  // If setting as active, deactivate all others first
  if (bankDetails.isActive) {
    await supabase
      .from('bank_details')
      .update({ is_active: false })
      .eq('is_active', true);
  }

  const { data, error } = await supabase
    .from('bank_details')
    .insert([{
      bank_name: bankDetails.bankName,
      account_name: bankDetails.accountName,
      account_number: bankDetails.accountNumber,
      iban: bankDetails.iban,
      swift_code: bankDetails.swiftCode,
      branch_name: bankDetails.branchName,
      branch_code: bankDetails.branchCode,
      currency: bankDetails.currency,
      notes: bankDetails.notes,
      is_active: bankDetails.isActive,
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to create bank details: ${error.message}`);
  return data;
}

/**
 * Update bank details
 */
export async function updateBankDetails(
  id: string,
  updates: Partial<Omit<BankDetails, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<BankDetails> {
  // If setting as active, deactivate all others first
  if (updates.isActive) {
    await supabase
      .from('bank_details')
      .update({ is_active: false })
      .eq('is_active', true)
      .neq('id', id);
  }

  const updateData: any = {};
  if (updates.bankName) updateData.bank_name = updates.bankName;
  if (updates.accountName) updateData.account_name = updates.accountName;
  if (updates.accountNumber) updateData.account_number = updates.accountNumber;
  if (updates.iban !== undefined) updateData.iban = updates.iban;
  if (updates.swiftCode !== undefined) updateData.swift_code = updates.swiftCode;
  if (updates.branchName !== undefined) updateData.branch_name = updates.branchName;
  if (updates.branchCode !== undefined) updateData.branch_code = updates.branchCode;
  if (updates.currency) updateData.currency = updates.currency;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('bank_details')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update bank details: ${error.message}`);
  return data;
}

/**
 * Set active bank details (deactivates all others)
 */
export async function setActiveBankDetails(id: string): Promise<void> {
  // Deactivate all
  await supabase
    .from('bank_details')
    .update({ is_active: false })
    .eq('is_active', true);

  // Activate selected
  const { error } = await supabase
    .from('bank_details')
    .update({ is_active: true })
    .eq('id', id);

  if (error) throw new Error(`Failed to set active bank details: ${error.message}`);
}

/**
 * Delete bank details
 */
export async function deleteBankDetails(id: string): Promise<void> {
  const { error } = await supabase
    .from('bank_details')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete bank details: ${error.message}`);
}

// ============================================================================
// ORDER PAYMENT CONFIRMATION
// ============================================================================

/**
 * Mark order as paid (Admin confirms payment received)
 */
export async function markOrderAsPaid(
  orderId: string,
  adminId: string,
  paymentReference?: string,
  paymentNotes?: string
): Promise<Order> {
  const updateData: any = {
    status: 'IN_TRANSIT',
    payment_confirmed_at: new Date().toISOString(),
    payment_confirmed_by: adminId,
  };

  if (paymentReference) {
    updateData.payment_reference = paymentReference;
  }

  if (paymentNotes) {
    updateData.payment_notes = paymentNotes;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(`Failed to mark order as paid: ${error.message}`);

  // Update invoice status
  await supabase
    .from('invoices')
    .update({
      status: 'PAID',
      paid_date: new Date().toISOString().split('T')[0],
    })
    .eq('order_id', orderId);

  return data;
}

/**
 * Client adds payment reference to order
 */
export async function addPaymentReference(
  orderId: string,
  paymentReference: string,
  paymentNotes?: string
): Promise<Order> {
  const updateData: any = {
    payment_reference: paymentReference,
  };

  if (paymentNotes) {
    updateData.payment_notes = paymentNotes;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(`Failed to add payment reference: ${error.message}`);
  return data;
}

/**
 * Get orders pending payment confirmation
 */
export async function getPendingPaymentOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'PENDING_PAYMENT')
    .order('date', { ascending: false });

  if (error) throw new Error(`Failed to fetch pending orders: ${error.message}`);
  return data || [];
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

/**
 * Get orders for a client
 */
export async function getClientOrders(clientId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false });

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return data || [];
}

// ============================================================================
// PAYMENT STATISTICS
// ============================================================================

/**
 * Get payment statistics for admin dashboard
 */
export async function getPaymentStatistics() {
  // Get all orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, amount');

  if (error) throw new Error(`Failed to fetch statistics: ${error.message}`);

  const stats = {
    pendingPayment: {
      count: 0,
      amount: 0,
    },
    paid: {
      count: 0,
      amount: 0,
    },
    total: {
      count: orders?.length || 0,
      amount: 0,
    },
  };

  orders?.forEach(order => {
    stats.total.amount += order.amount;

    if (order.status === 'PENDING_PAYMENT') {
      stats.pendingPayment.count++;
      stats.pendingPayment.amount += order.amount;
    } else if (order.status === 'IN_TRANSIT' || order.status === 'DELIVERED') {
      stats.paid.count++;
      stats.paid.amount += order.amount;
    }
  });

  return stats;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const bankTransferService = {
  // Bank details
  getActiveBankDetails,
  getAllBankDetails,
  createBankDetails,
  updateBankDetails,
  setActiveBankDetails,
  deleteBankDetails,

  // Order payment
  markOrderAsPaid,
  addPaymentReference,
  getPendingPaymentOrders,
  getOrderById,
  getClientOrders,

  // Statistics
  getPaymentStatistics,
};

export default bankTransferService;
