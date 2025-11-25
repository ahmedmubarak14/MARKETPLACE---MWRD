import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from './ui/LoadingSpinner';
import customItemRequestService from '../services/customItemRequestService';
import { RequestPriority } from '../types/types';

interface CustomItemRequestFormProps {
  clientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CustomItemRequestForm: React.FC<CustomItemRequestFormProps> = ({
  clientId,
  onSuccess,
  onCancel,
}) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    specifications: '',
    category: '',
    quantity: 1,
    targetPrice: '',
    deadline: '',
    priority: RequestPriority.MEDIUM,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemName.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await customItemRequestService.createCustomRequest({
        clientId,
        itemName: formData.itemName,
        description: formData.description,
        specifications: formData.specifications || undefined,
        category: formData.category || undefined,
        quantity: formData.quantity,
        targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
        currency: 'SAR',
        deadline: formData.deadline || undefined,
        priority: formData.priority,
        referenceImages: [],
        attachmentUrls: [],
      });

      toast.success('Custom item request submitted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Request Custom Item</h2>
        <p className="text-gray-600 mt-1">
          Can't find what you're looking for? Request a custom item and we'll source it for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            required
            placeholder="e.g., Industrial Grade Safety Gloves"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Describe the item you need in detail..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
          />
        </div>

        {/* Specifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specifications (Optional)
          </label>
          <textarea
            name="specifications"
            value={formData.specifications}
            onChange={handleInputChange}
            rows={3}
            placeholder="Material, dimensions, standards, certifications, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g., Safety Equipment"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Target Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Price per Unit (SAR)
            </label>
            <input
              type="number"
              name="targetPrice"
              value={formData.targetPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Your budget per unit</p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
            >
              <option value={RequestPriority.LOW}>Low</option>
              <option value={RequestPriority.MEDIUM}>Medium</option>
              <option value={RequestPriority.HIGH}>High</option>
              <option value={RequestPriority.URGENT}>Urgent</option>
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Needed By (Optional)
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
            <div>
              <p className="text-sm font-medium text-blue-900">What happens next?</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Our team will review your request within 24-48 hours</li>
                <li>• We'll source the item from verified suppliers</li>
                <li>• You'll receive a quote with pricing and delivery time</li>
                <li>• Approve the quote to proceed with your order</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-[#0A2540] text-white rounded-lg hover:bg-[#0A2540]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                <span>Submit Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
