import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import bankTransferService from '../../services/bankTransferService';
import type { Order } from '../../types/types';

interface MarkAsPaidButtonProps {
  order: Order;
  adminId: string;
  onSuccess?: () => void;
}

export const MarkAsPaidButton: React.FC<MarkAsPaidButtonProps> = ({
  order,
  adminId,
  onSuccess,
}) => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState(order.paymentReference || '');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    if (!paymentReference.trim()) {
      toast.error('Please enter a payment reference');
      return;
    }

    setIsProcessing(true);
    try {
      await bankTransferService.markOrderAsPaid(
        order.id,
        adminId,
        paymentReference,
        paymentNotes
      );
      toast.success('Payment confirmed successfully');
      setShowModal(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't show button if already paid
  if (order.paymentConfirmedAt) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <span className="material-symbols-outlined">check_circle</span>
        <span className="text-sm font-medium">Payment Confirmed</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
      >
        <span className="material-symbols-outlined">payments</span>
        Mark as Paid
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Payment Received</h3>
              <p className="text-sm text-gray-600 mt-1">
                Verify that payment has been received in the bank account
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Order ID</span>
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {order.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-bold text-lg text-gray-900">
                    {order.amount.toFixed(2)} SAR
                  </span>
                </div>
                {order.paymentReference && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Client Reference</span>
                    <span className="font-mono text-sm text-gray-900">
                      {order.paymentReference}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Reference Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Transfer Reference *
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Enter verified transaction reference"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Reference number from your bank statement
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  placeholder="Any additional notes about this payment"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-yellow-600 text-lg">warning</span>
                  <p className="text-xs text-yellow-800">
                    Only confirm after verifying the payment in your bank account. This action will update the order status to "In Transit".
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing || !paymentReference.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Confirm Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
