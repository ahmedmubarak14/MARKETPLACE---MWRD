import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { paymentService } from '../services/paymentService';
import moyasarService from '../services/moyasarService';
import type { CheckoutFormData, PaymentSummary } from '../types/payment';

interface CheckoutProps {
  orderId: string;
  clientId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({
  orderId,
  clientId,
  amount,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    saveCard: false,
  });

  const paymentSummary: PaymentSummary = {
    subtotal: amount,
    tax: amount * 0.15,
    discount: 0,
    total: amount + amount * 0.15,
    currency: 'SAR',
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
    }

    if (name === 'expiryMonth') {
      formattedValue = value.slice(0, 2);
      if (parseInt(formattedValue) > 12) formattedValue = '12';
    }

    if (name === 'expiryYear') {
      formattedValue = value.slice(0, 2);
    }

    if (name === 'cvc') {
      formattedValue = value.slice(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.cardName.trim()) {
      toast.error(t('errors.cardholderRequired'));
      return false;
    }

    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 15 || cardNumber.length > 16) {
      toast.error(t('errors.invalidCardNumber'));
      return false;
    }

    if (!formData.expiryMonth || parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) {
      toast.error(t('errors.invalidExpiryMonth'));
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    if (!formData.expiryYear || parseInt(formData.expiryYear) < currentYear) {
      toast.error(t('errors.invalidExpiryYear'));
      return false;
    }

    if (formData.cvc.length < 3) {
      toast.error(t('errors.invalidCvc'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!moyasarService.isConfigured()) {
      toast.error(t('errors.paymentGatewayNotConfigured'));
      return;
    }

    setIsProcessing(true);

    try {
      const callbackUrl = `${window.location.origin}/payment/callback`;

      const result = await paymentService.processCheckout(
        orderId,
        clientId,
        paymentSummary.total,
        formData,
        callbackUrl
      );

      if (moyasarService.isPaymentSuccessful(result.payment.status)) {
        toast.success(t('toast.paymentSuccessful'));
        onSuccess();
      } else if (moyasarService.isPaymentPending(result.payment.status)) {
        toast.info(t('toast.paymentProcessing'));
      } else {
        toast.error(result.payment.failure_reason || t('errors.paymentFailed'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(t('errors.paymentFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!moyasarService.isConfigured()) {
      toast.warning(t('toast.paymentGatewayWarning'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#0A2540] text-white px-8 py-6">
            <h1 className="text-2xl font-bold">{t('checkout.title')}</h1>
            <p className="text-gray-300 mt-1">{t('checkout.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('checkout.paymentDetails')}</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.cardholderName')}
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder={t('checkout.cardholderPlaceholder')}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.cardNumber')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder={t('checkout.cardNumberPlaceholder')}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
                    />
                    <div className="absolute right-3 top-3 flex gap-1">
                      <span className="material-symbols-outlined text-blue-600 text-xl">credit_card</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('checkout.cardSupports')}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.month')}
                    </label>
                    <input
                      type="number"
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      placeholder={t('checkout.monthPlaceholder')}
                      min="1"
                      max="12"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.year')}
                    </label>
                    <input
                      type="number"
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                      placeholder={t('checkout.yearPlaceholder')}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.cvc')}
                    </label>
                    <input
                      type="number"
                      name="cvc"
                      value={formData.cvc}
                      onChange={handleInputChange}
                      placeholder={t('checkout.cvcPlaceholder')}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="saveCard"
                    checked={formData.saveCard}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#0A2540] border-gray-300 rounded focus:ring-[#0A2540]"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {t('checkout.saveCard')}
                  </label>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-[#0A2540] text-white rounded-lg hover:bg-[#0A2540]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>{t('checkout.processing')}</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">lock</span>
                        <span>{t('checkout.pay')} {paymentSummary.total.toFixed(2)} {paymentSummary.currency}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600 text-xl">verified_user</span>
                  <div>
                    <p className="text-sm font-medium text-green-900">{t('checkout.securePayment')}</p>
                    <p className="text-xs text-green-700 mt-1">
                      {t('checkout.securePaymentDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('checkout.orderSummary')}</h2>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>{t('checkout.subtotal')}</span>
                  <span>{paymentSummary.subtotal.toFixed(2)} {paymentSummary.currency}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>{t('checkout.vat')}</span>
                  <span>{paymentSummary.tax.toFixed(2)} {paymentSummary.currency}</span>
                </div>

                {paymentSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('checkout.discount')}</span>
                    <span>-{paymentSummary.discount.toFixed(2)} {paymentSummary.currency}</span>
                  </div>
                )}

                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>{t('common.total')}</span>
                    <span>{paymentSummary.total.toFixed(2)} {paymentSummary.currency}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">{t('checkout.acceptedMethods')}</p>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium">
                    MADA
                  </div>
                  <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium">
                    VISA
                  </div>
                  <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium">
                    Mastercard
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">{t('checkout.needHelp')}</p>
                <p className="text-xs text-blue-700 mt-1">
                  {t('checkout.supportContact')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>{t('checkout.poweredBy')}</p>
        </div>
      </div>
    </div>
  );
};
