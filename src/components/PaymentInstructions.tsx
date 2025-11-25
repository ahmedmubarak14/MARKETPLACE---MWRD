import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from './ui/LoadingSpinner';
import bankTransferService from '../services/bankTransferService';
import type { BankDetails, Order } from '../types/types';

interface PaymentInstructionsProps {
  order: Order;
  onPaymentReferenceAdded?: () => void;
}

export const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({
  order,
  onPaymentReferenceAdded,
}) => {
  const toast = useToast();
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentReference, setPaymentReference] = useState(order.paymentReference || '');
  const [paymentNotes, setPaymentNotes] = useState(order.paymentNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    setIsLoading(true);
    try {
      const data = await bankTransferService.getActiveBankDetails();
      setBankDetails(data);
    } catch (error) {
      console.error('Error loading bank details:', error);
      toast.error('Failed to load bank details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReference = async () => {
    if (!paymentReference.trim()) {
      toast.error('Please enter a payment reference');
      return;
    }

    setIsSaving(true);
    try {
      await bankTransferService.addPaymentReference(
        order.id,
        paymentReference,
        paymentNotes
      );
      toast.success('Payment reference saved successfully');
      onPaymentReferenceAdded?.();
    } catch (error) {
      console.error('Error saving reference:', error);
      toast.error('Failed to save payment reference');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!bankDetails) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-yellow-600 text-2xl">warning</span>
          <div>
            <p className="font-medium text-yellow-900">Bank details not configured</p>
            <p className="text-sm text-yellow-700 mt-1">
              Please contact support for payment instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Status Header */}
      <div className={`rounded-xl p-6 ${
        order.paymentConfirmedAt
          ? 'bg-green-50 border border-green-200'
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-start gap-3">
          <span className={`material-symbols-outlined text-2xl ${
            order.paymentConfirmedAt ? 'text-green-600' : 'text-blue-600'
          }`}>
            {order.paymentConfirmedAt ? 'check_circle' : 'info'}
          </span>
          <div>
            <p className={`font-medium ${
              order.paymentConfirmedAt ? 'text-green-900' : 'text-blue-900'
            }`}>
              {order.paymentConfirmedAt ? 'Payment Confirmed' : 'Awaiting Payment'}
            </p>
            <p className={`text-sm mt-1 ${
              order.paymentConfirmedAt ? 'text-green-700' : 'text-blue-700'
            }`}>
              {order.paymentConfirmedAt
                ? `Your payment was confirmed on ${new Date(order.paymentConfirmedAt).toLocaleDateString()}`
                : 'Please transfer the payment to the bank account below'}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Details Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-[#0A2540] text-white px-6 py-4">
          <h3 className="text-lg font-semibold">MWRD Bank Account Details</h3>
          <p className="text-sm text-gray-300 mt-1">Transfer payment to this account</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Bank Name */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Bank Name</p>
              <p className="font-semibold text-gray-900 text-lg">{bankDetails.bankName}</p>
            </div>
            <button
              onClick={() => copyToClipboard(bankDetails.bankName, 'Bank name')}
              className="p-2 text-gray-600 hover:text-[#0A2540] transition-colors"
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </div>

          {/* Account Name */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Account Name</p>
              <p className="font-semibold text-gray-900 text-lg">{bankDetails.accountName}</p>
            </div>
            <button
              onClick={() => copyToClipboard(bankDetails.accountName, 'Account name')}
              className="p-2 text-gray-600 hover:text-[#0A2540] transition-colors"
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </div>

          {/* Account Number */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Account Number</p>
              <p className="font-semibold text-gray-900 text-lg font-mono">{bankDetails.accountNumber}</p>
            </div>
            <button
              onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
              className="p-2 text-gray-600 hover:text-[#0A2540] transition-colors"
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </div>

          {/* IBAN */}
          {bankDetails.iban && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">IBAN</p>
                <p className="font-semibold text-gray-900 text-lg font-mono">{bankDetails.iban}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.iban!, 'IBAN')}
                className="p-2 text-gray-600 hover:text-[#0A2540] transition-colors"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>
          )}

          {/* SWIFT Code */}
          {bankDetails.swiftCode && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">SWIFT Code</p>
                <p className="font-semibold text-gray-900 text-lg font-mono">{bankDetails.swiftCode}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.swiftCode!, 'SWIFT code')}
                className="p-2 text-gray-600 hover:text-[#0A2540] transition-colors"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>
          )}

          {/* Amount */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">Amount to Transfer</p>
            <p className="font-bold text-green-900 text-2xl">{order.amount.toFixed(2)} {bankDetails.currency}</p>
          </div>

          {/* Notes */}
          {bankDetails.notes && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Important</p>
              <p className="text-sm text-blue-700">{bankDetails.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Reference Form */}
      {!order.paymentConfirmedAt && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">After Making the Transfer</h4>
          <p className="text-sm text-gray-600 mb-4">
            Please provide your payment reference number so we can confirm your payment quickly.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference / Transaction ID *
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter your bank transfer reference number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
                placeholder="Any additional information about your payment"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={handleSaveReference}
              disabled={isSaving || !paymentReference.trim()}
              className="w-full px-6 py-3 bg-[#0A2540] text-white rounded-lg hover:bg-[#0A2540]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  <span>Submit Payment Reference</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Payment confirmation typically takes 1-2 business days</p>
          <p>• Make sure to include the order number in your transfer reference</p>
          <p>• Contact support@mwrd.com if you have any questions</p>
          <p>• Keep your transaction receipt for your records</p>
        </div>
      </div>
    </div>
  );
};
