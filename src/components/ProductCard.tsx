import React from 'react';
import type { Product } from '../types/types';
import { UserRole } from '../types/types';

interface ProductCardProps {
  product: Product;
  userRole?: UserRole;
  onAddToRFQ?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  userRole = UserRole.CLIENT,
  onAddToRFQ,
  onViewDetails,
}) => {
  const isSupplierOrAdmin = userRole === UserRole.SUPPLIER || userRole === UserRole.ADMIN;
  const showCostPrice = isSupplierOrAdmin;
  const showRetailPrice = product.retailPrice && product.retailPrice > 0;

  // Calculate profit margin for display (admin/supplier only)
  const profitAmount = product.costPrice && product.retailPrice
    ? product.retailPrice - product.costPrice
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Product+Image';
          }}
        />
        {product.status === 'PENDING' && (
          <span className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
            Pending Approval
          </span>
        )}
        {product.sku && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-gray-900 bg-opacity-70 text-white text-xs font-mono rounded">
            {product.sku}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* Pricing Section */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          {/* Retail Price (Client View) */}
          {showRetailPrice && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-600">Price</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#0A2540]">
                  {product.retailPrice!.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600 ml-1">SAR</span>
              </div>
            </div>
          )}

          {/* Cost & Margin (Supplier/Admin View) */}
          {showCostPrice && product.costPrice && (
            <div className="space-y-1 text-sm bg-gray-50 rounded-lg p-3 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Cost Price:</span>
                <span className="font-medium text-gray-900">
                  {product.costPrice.toFixed(2)} SAR
                </span>
              </div>
              {product.marginPercent && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin:</span>
                  <span className="font-medium text-green-600">
                    {product.marginPercent.toFixed(1)}%
                  </span>
                </div>
              )}
              {showRetailPrice && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retail Price:</span>
                    <span className="font-medium text-gray-900">
                      {product.retailPrice!.toFixed(2)} SAR
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1">
                    <span className="text-gray-600">MWRD Profit:</span>
                    <span className="font-bold text-green-600">
                      {profitAmount.toFixed(2)} SAR
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* No Price Set */}
          {!showRetailPrice && !showCostPrice && (
            <p className="text-sm text-gray-500 italic">Request quote for pricing</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(product)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              View Details
            </button>
          )}
          {onAddToRFQ && userRole === UserRole.CLIENT && (
            <button
              onClick={() => onAddToRFQ(product)}
              className="flex-1 px-4 py-2 bg-[#0A2540] text-white rounded-lg hover:bg-[#0A2540]/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
              Add to RFQ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
