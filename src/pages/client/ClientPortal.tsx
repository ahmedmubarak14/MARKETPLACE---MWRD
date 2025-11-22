import React, { useState } from 'react';
import { Product, RFQ } from '../../types/types';
import { useStore } from '../../store/useStore';
import { RfqItemSchema } from '../../lib/validations';

interface ClientPortalProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

interface SelectedItem {
  productId: string;
  quantity: number;
  notes: string;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ activeTab, onNavigate }) => {
  // Get data from store
  const { products, rfqs, quotes, orders, users, currentUser, addRFQ, acceptQuote } = useStore();

  const [rfqItems, setRfqItems] = useState<string[]>([]);
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, SelectedItem>>({});
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [acceptingQuote, setAcceptingQuote] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [rfqError, setRfqError] = useState<string | null>(null);
  const [createRfqSearch, setCreateRfqSearch] = useState('');
  const [rfqStatusFilter, setRfqStatusFilter] = useState<string>('all');

  const toggleRfqItem = (productId: string) => {
    // Logic for simple list
    if (rfqItems.includes(productId)) {
      setRfqItems(rfqItems.filter(id => id !== productId));
    } else {
      setRfqItems([...rfqItems, productId]);
    }
  };

  const toggleSelectedItem = (product: Product) => {
    if (selectedItemsMap[product.id]) {
      const newMap = { ...selectedItemsMap };
      delete newMap[product.id];
      setSelectedItemsMap(newMap);
    } else {
      setSelectedItemsMap({
        ...selectedItemsMap,
        [product.id]: { productId: product.id, quantity: 1, notes: '' }
      });
    }
  };

  const updateItemDetails = (productId: string, field: 'quantity' | 'notes', value: any) => {
    if (selectedItemsMap[productId]) {
      const newValue = field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value;
      setSelectedItemsMap({
        ...selectedItemsMap,
        [productId]: { ...selectedItemsMap[productId], [field]: newValue }
      });

      // Validate the item
      const updatedItem = { ...selectedItemsMap[productId], [field]: newValue };
      const result = RfqItemSchema.safeParse(updatedItem);
      if (!result.success) {
        const error = result.error.errors[0];
        setValidationErrors(prev => ({ ...prev, [productId]: error.message }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[productId];
          return newErrors;
        });
      }
    }
  };

  const submitRfq = () => {
    const selectedKeys = Object.keys(selectedItemsMap);

    // Validate: at least one item
    if (selectedKeys.length === 0) {
      setRfqError('Please add at least one item to your RFQ');
      return;
    }

    // Validate all items
    const errors: Record<string, string> = {};
    let hasErrors = false;

    selectedKeys.forEach(key => {
      const item = selectedItemsMap[key];
      const result = RfqItemSchema.safeParse(item);
      if (!result.success) {
        errors[key] = result.error.errors[0].message;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      setRfqError('Please fix the errors below before submitting');
      return;
    }

    setRfqError(null);
    setValidationErrors({});
    setSubmitted(true);

    // Create RFQ items from selection
    const rfqItemsList = selectedKeys.map(key => ({
      productId: selectedItemsMap[key].productId,
      quantity: selectedItemsMap[key].quantity,
      notes: selectedItemsMap[key].notes
    }));

    // Create new RFQ
    const newRFQ: RFQ = {
      id: `r${Date.now()}`,
      clientId: currentUser?.id || 'u1',
      items: rfqItemsList,
      status: 'OPEN',
      date: new Date().toISOString().split('T')[0]
    };

    // Add to store
    addRFQ(newRFQ);

    setTimeout(() => {
      setSubmitted(false);
      setRfqItems([]);
      setSelectedItemsMap({});
      onNavigate('rfqs');
    }, 1000);
  };

  const handleAcceptQuote = (quoteId: string) => {
    setAcceptingQuote(quoteId);
    setTimeout(() => {
      acceptQuote(quoteId);
      setAcceptingQuote(null);
      onNavigate('orders');
    }, 800);
  };

  const handleViewQuotes = (rfqId: string) => {
    setSelectedRfqId(rfqId);
    onNavigate('view-quotes');
  };

  // --- DASHBOARD VIEW ---
  if (activeTab === 'dashboard') {
    return (
      <div className="p-8 md:p-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-8">
          <div className="flex min-w-72 flex-col gap-1">
            <p className="text-[#111827] text-3xl font-bold leading-tight tracking-tight">Dashboard</p>
            <p className="text-[#6b7280] text-base font-normal leading-normal">Welcome back, John Client</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('browse')}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white border border-gray-300 text-[#111827] text-sm font-medium leading-normal tracking-[0.015em] gap-2 hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span className="truncate">Browse Items</span>
            </button>
            <button 
              onClick={() => onNavigate('create-rfq')}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-medium leading-normal tracking-[0.015em] gap-2 hover:bg-[#137fec]/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              <span className="truncate">Submit New RFQ</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Recent RFQs */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[#111827] text-lg font-semibold">Recent RFQs</h3>
                <button onClick={() => onNavigate('rfqs')} className="text-[#137fec] text-sm font-medium hover:underline">View All</button>
              </div>
              <div className="flex flex-col mt-4">
                {rfqs.slice(0, 3).map(rfq => (
                  <div key={rfq.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-[#111827]">RFQ-{rfq.id.toUpperCase()}</p>
                      <p className="text-sm text-[#6b7280]">{rfq.date}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      rfq.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                      rfq.status === 'QUOTED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rfq.status === 'OPEN' ? 'Pending' : rfq.status === 'QUOTED' ? 'Quoted' : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quotes Received */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[#111827] text-lg font-semibold">Quotes Received</h3>
                <button onClick={() => onNavigate('rfqs')} className="text-[#137fec] text-sm font-medium hover:underline">View All</button>
              </div>
              <div className="flex flex-col mt-4">
                {quotes.filter(q => q.status === 'SENT_TO_CLIENT').slice(0, 5).map(quote => (
                  <div 
                    key={quote.id} 
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors px-2 -mx-2 rounded"
                    onClick={() => handleViewQuotes(quote.rfqId)}
                  >
                    <div>
                      <p className="font-medium text-[#111827] group-hover:text-[#137fec]">For RFQ-{quote.rfqId.toUpperCase()}</p>
                      <p className="text-sm text-[#6b7280]">from Supplier {users.find(u => u.id === quote.supplierId)?.publicId}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[#111827] font-medium">${quote.finalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        <span className="text-xs text-[#137fec] font-medium">View Quote</span>
                    </div>
                  </div>
                ))}
                {quotes.filter(q => q.status === 'SENT_TO_CLIENT').length === 0 && (
                  <p className="text-sm text-gray-400 py-4">No active quotes yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[#111827] text-lg font-semibold">Order History</h3>
            <button onClick={() => onNavigate('orders')} className="text-[#137fec] text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="flex flex-col mt-4">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-[#111827]">{order.id}</p>
                  <p className="text-sm text-[#6b7280]">${order.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW QUOTES DETAIL ---
  if (activeTab === 'view-quotes') {
    const rfq = rfqs.find(r => r.id === selectedRfqId);
    const rfqQuotes = quotes.filter(q => q.rfqId === selectedRfqId && q.status === 'SENT_TO_CLIENT');
    // Helper to get first item name for title
    const firstItem = rfq?.items[0] ? products.find(p => p.id === rfq.items[0].productId) : null;
    const itemTitle = firstItem ? firstItem.name : 'Multiple Items';

    if (!rfq) return <div className="p-12 text-center">RFQ Not Found</div>;

    return (
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
            {/* Breadcrumbs & Heading */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => onNavigate('dashboard')} className="text-slate-500 text-sm font-medium hover:text-[#137fec]">Home</button>
                    <span className="text-slate-500 text-sm font-medium">/</span>
                    <button onClick={() => onNavigate('rfqs')} className="text-slate-500 text-sm font-medium hover:text-[#137fec]">RFQs</button>
                    <span className="text-slate-500 text-sm font-medium">/</span>
                    <span className="text-slate-800 text-sm font-medium">RFQ #{rfq.id.toUpperCase()} - {itemTitle}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-3">
                    <p className="text-slate-900 text-4xl font-black tracking-[-0.033em]">Quotes for RFQ #{rfq.id.toUpperCase()}</p>
                </div>
            </div>

            {/* RFQ Summary Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-500 text-sm font-normal">RFQ Title</p>
                        <p className="text-slate-800 text-sm font-medium">Order of {itemTitle}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-500 text-sm font-normal">Status</p>
                        <p className="text-emerald-600 text-sm font-medium">
                            {rfq.status === 'QUOTED' ? 'Awaiting Decision' : rfq.status}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-500 text-sm font-normal">Submission Date</p>
                        <p className="text-slate-800 text-sm font-medium">{rfq.date}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-500 text-sm font-normal">Quotes Received</p>
                        <p className="text-slate-800 text-sm font-medium">{rfqQuotes.length}</p>
                    </div>
                </div>
            </div>

            {/* Sort/Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-slate-600 font-medium">{rfqQuotes.length} quotes found. Ready for review.</p>
                <div className="flex gap-2 overflow-x-auto">
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-200 pl-3 pr-2 shadow-sm hover:bg-slate-50">
                        <p className="text-slate-700 text-sm font-medium">Price (Low to High)</p>
                        <span className="material-symbols-outlined text-lg text-slate-500">arrow_downward</span>
                    </button>
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-200 pl-3 pr-2 shadow-sm hover:bg-slate-50">
                        <p className="text-slate-700 text-sm font-medium">Delivery Time</p>
                        <span className="material-symbols-outlined text-lg text-slate-500">swap_vert</span>
                    </button>
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-200 pl-3 pr-2 shadow-sm hover:bg-slate-50">
                        <p className="text-slate-700 text-sm font-medium">Rating</p>
                        <span className="material-symbols-outlined text-lg text-slate-500">swap_vert</span>
                    </button>
                </div>
            </div>

            {/* Quote Display Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rfqQuotes.map((quote, idx) => {
                    const supplier = users.find(u => u.id === quote.supplierId);
                    // For visual distinctness like the design, we highlight one as 'recommended' if it has best rating or price, 
                    // or just style them based on index for demo variety
                    const isHighlighted = idx === 1; 
                    const colorNames = ['Violet', 'Indigo', 'Teal', 'Rose', 'Amber'];
                    const displayColor = colorNames[idx % colorNames.length];

                    return (
                        <div key={quote.id} className={`flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300 ${isHighlighted ? 'border border-[#137fec]/50 ring-2 ring-[#137fec]/20 shadow-lg transform -translate-y-1' : 'border border-slate-200 shadow-sm hover:shadow-md'}`}>
                            <div className="p-6 flex flex-col gap-5 flex-grow">
                                <div className="flex items-center justify-between">
                                    <p className={`text-lg font-bold ${isHighlighted ? 'text-[#137fec]' : 'text-slate-800'}`}>
                                        Supplier {displayColor}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <span className="material-symbols-outlined text-amber-500 text-xl" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                        <span className="font-medium text-sm">{supplier?.rating || 4.5}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-slate-500">Estimated Delivery</p>
                                        <p className="font-medium text-slate-700">{quote.leadTime}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-slate-500">Final Price</p>
                                        <p className="font-medium text-slate-700">${quote.finalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                <button
                                    onClick={() => handleAcceptQuote(quote.id)}
                                    disabled={acceptingQuote === quote.id}
                                    className="w-full flex items-center justify-center h-10 px-4 rounded-lg bg-[#137fec] text-white text-sm font-bold hover:bg-[#137fec]/90 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {acceptingQuote === quote.id ? (
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                    ) : (
                                        'Accept Quote'
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}

                {rfqQuotes.length === 0 && (
                     <div className="col-span-full flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl shadow-sm p-12 mt-6">
                        <div className="p-4 bg-[#137fec]/10 rounded-full mb-4">
                            <span className="material-symbols-outlined text-4xl text-[#137fec]">hourglass_empty</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No Quotes Yet</h3>
                        <p className="max-w-md mt-2 text-slate-500">Suppliers are currently reviewing your RFQ. Quotes will appear here as soon as they are submitted. Please check back soon.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  // --- CREATE RFQ VIEW ---
  if (activeTab === 'create-rfq') {
    const createRfqProducts = products.filter(p => {
      const matchesStatus = p.status === 'APPROVED';
      const matchesCategory = p.category === 'Industrial' || p.category === 'Safety Gear' || p.category === 'Electrical';
      const matchesSearch = createRfqSearch === '' ||
        p.name.toLowerCase().includes(createRfqSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(createRfqSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(createRfqSearch.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });

    const selectedKeys = Object.keys(selectedItemsMap);

    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 font-display text-[#343A40]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex flex-col gap-2">
                <p className="text-[#343A40] text-3xl md:text-4xl font-black tracking-[-0.033em]">Submit a New RFQ</p>
                <p className="text-[#6C757D] text-base font-normal">Select items and provide details to receive quotes from our approved suppliers.</p>
              </div>
            </div>
            
            {/* Step 1: Item Selection */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[#343A40] text-xl font-bold tracking-[-0.015em]">Step 1: Select Items</h2>
              {/* SearchBar */}
              <div className="py-1">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-[#DEE2E6] focus-within:ring-2 focus-within:ring-[#0052CC]">
                    <div className="text-[#6C757D] flex bg-[#F7F8FA] items-center justify-center pl-4 rounded-l-lg">
                      <span aria-hidden="true" className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-[#343A40] focus:outline-none border-none bg-[#F7F8FA] h-full placeholder:text-[#6C757D] pl-2 text-base font-normal"
                      placeholder="Search for products or services..."
                      value={createRfqSearch}
                      onChange={(e) => setCreateRfqSearch(e.target.value)}
                    />
                    {createRfqSearch && (
                      <button
                        onClick={() => setCreateRfqSearch('')}
                        className="text-[#6C757D] hover:text-[#343A40] flex items-center justify-center pr-4 bg-[#F7F8FA] rounded-r-lg"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    )}
                  </div>
                </label>
                {createRfqSearch && (
                  <p className="text-sm text-[#6C757D] mt-2">
                    Found {createRfqProducts.length} product{createRfqProducts.length !== 1 ? 's' : ''} matching "{createRfqSearch}"
                  </p>
                )}
              </div>
              
              {/* ImageGrid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                {createRfqProducts.map(product => {
                  const isSelected = !!selectedItemsMap[product.id];
                  return (
                    <div key={product.id} className={`flex flex-col gap-3 rounded-lg border p-3 group relative ${isSelected ? 'border-2 border-[#0052CC] bg-[#0052CC]/5' : 'border-[#DEE2E6]'}`}>
                      {isSelected && (
                        <div className="absolute top-2 right-2 size-5 bg-[#0052CC] text-white rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined" style={{fontSize: '16px'}}>check</span>
                        </div>
                      )}
                      <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-md" style={{ backgroundImage: `url('${product.image}')` }}></div>
                      <div>
                        <p className="text-[#343A40] text-base font-medium line-clamp-1">{product.name}</p>
                        <p className="text-[#6C757D] text-sm font-normal truncate">{product.description}</p>
                      </div>
                      <button 
                        onClick={() => toggleSelectedItem(product)}
                        disabled={isSelected}
                        className={`mt-1 w-full text-center text-sm font-semibold py-2 px-3 rounded-md transition-colors ${
                          isSelected 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#0052CC]/10 text-[#0052CC] hover:bg-[#0052CC]/20'
                        }`}
                      >
                        {isSelected ? 'Added' : 'Add to RFQ'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Specify Details */}
            <div className="flex flex-col gap-6">
              <h2 className="text-[#343A40] text-xl font-bold tracking-[-0.015em] pt-4">Step 2: Specify Details</h2>
              
              {/* Selected Items Table */}
              <div className="overflow-x-auto bg-[#F7F8FA] rounded-lg border border-[#DEE2E6]">
                <table className="w-full text-left">
                  <thead className="text-sm text-[#6C757D] uppercase">
                    <tr>
                      <th className="px-6 py-3" scope="col">Item</th>
                      <th className="px-6 py-3 w-32" scope="col">Quantity</th>
                      <th className="px-6 py-3" scope="col">Notes</th>
                      <th className="px-6 py-3" scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedKeys.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-[#6C757D] text-sm">No items selected yet. Add items from Step 1.</td>
                      </tr>
                    ) : (
                      selectedKeys.map(key => {
                        const item = selectedItemsMap[key];
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <tr key={key} className={`border-t ${validationErrors[key] ? 'border-red-200 bg-red-50/50' : 'border-[#DEE2E6]'}`}>
                            <td className="px-6 py-4 font-medium text-[#343A40]">
                              {product?.name}
                              {validationErrors[key] && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors[key]}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <input
                                className={`w-24 rounded-md border bg-white focus:ring-[#0052CC] focus:border-[#0052CC] px-3 py-1.5 outline-none ${
                                  validationErrors[key] ? 'border-red-400' : 'border-[#DEE2E6]'
                                }`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemDetails(key, 'quantity', parseInt(e.target.value))}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                className="w-full rounded-md border border-[#DEE2E6] bg-white focus:ring-[#0052CC] focus:border-[#0052CC] px-3 py-1.5 outline-none"
                                placeholder="Optional notes..."
                                type="text"
                                maxLength={500}
                                value={item.notes}
                                onChange={(e) => updateItemDetails(key, 'notes', e.target.value)}
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => toggleSelectedItem(product!)}
                                className="text-[#6C757D] hover:text-red-600"
                              >
                                <span aria-hidden="true" className="material-symbols-outlined">delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Overall RFQ Info */}
              <div className="flex flex-col gap-6">
                <h3 className="text-[#343A40] text-lg font-bold">Overall RFQ Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#6C757D] mb-1" htmlFor="rfq-title">RFQ Title</label>
                    <input className="w-full rounded-lg border border-[#DEE2E6] bg-[#F7F8FA] focus:ring-[#0052CC] focus:border-[#0052CC] px-4 py-2.5 outline-none" id="rfq-title" placeholder="e.g. Q3 Maintenance Supplies" type="text"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6C757D] mb-1" htmlFor="delivery-date">Desired Delivery Date</label>
                    <input className="w-full rounded-lg border border-[#DEE2E6] bg-[#F7F8FA] focus:ring-[#0052CC] focus:border-[#0052CC] px-4 py-2.5 outline-none" id="delivery-date" type="date"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6C757D] mb-1" htmlFor="requirements">General Requirements</label>
                  <textarea className="w-full rounded-lg border border-[#DEE2E6] bg-[#F7F8FA] focus:ring-[#0052CC] focus:border-[#0052CC] px-4 py-2.5 outline-none" id="requirements" placeholder="Enter any overall specifications, delivery instructions, or special requirements here." rows={4}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6C757D] mb-1">Attachments</label>
                  <div className="flex justify-center items-center w-full px-6 pt-5 pb-6 border-2 border-[#DEE2E6] border-dashed rounded-lg bg-[#F7F8FA]">
                    <div className="space-y-1 text-center">
                      <span className="material-symbols-outlined text-4xl text-[#6C757D] mx-auto">cloud_upload</span>
                      <div className="flex text-sm text-[#6C757D]">
                        <label className="relative cursor-pointer rounded-md font-medium text-[#0052CC] hover:text-[#0052CC]/80 focus-within:outline-none" htmlFor="file-upload">
                          <span>Upload a file</span>
                          <input className="sr-only" id="file-upload" name="file-upload" type="file"/>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-[#6C757D]/80">PDF, DOCX, PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Summary Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="rounded-xl border border-[#DEE2E6] bg-[#F7F8FA] p-6 flex flex-col gap-6">
                <h3 className="text-[#343A40] text-lg font-bold">RFQ Summary</h3>
                <div className="flex flex-col gap-4">
                  {selectedKeys.map(key => {
                    const item = selectedItemsMap[key];
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <p className="text-[#343A40] line-clamp-1 mr-2">{product?.name}</p>
                        <p className="text-[#6C757D] font-medium whitespace-nowrap">Qty: {item.quantity}</p>
                      </div>
                    )
                  })}
                  {selectedKeys.length === 0 && (
                    <p className="text-sm text-[#6C757D] italic">No items added</p>
                  )}
                  <div className="border-t border-[#DEE2E6]"></div>
                  <div className="flex justify-between items-center font-bold">
                    <p>Total Items</p>
                    <p>{selectedKeys.length}</p>
                  </div>
                </div>
                {/* Validation Error */}
                {rfqError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                    <span className="material-symbols-outlined text-lg shrink-0">error</span>
                    <span>{rfqError}</span>
                  </div>
                )}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={submitRfq}
                    disabled={selectedKeys.length === 0 || submitted || Object.keys(validationErrors).length > 0}
                    className="w-full bg-[#0052CC] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#0052CC]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitted ? (
                      <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
                    ) : (
                      'Submit RFQ'
                    )}
                  </button>
                  <button className="w-full bg-white text-[#6C757D] font-semibold py-3 px-4 rounded-lg border border-[#DEE2E6] hover:bg-gray-50">
                    Save as Draft
                  </button>
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className="w-full text-center text-sm text-[#6C757D] hover:text-[#0052CC]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- BROWSE VIEW ---
  if (activeTab === 'browse') {
    const filteredProducts = products.filter(p => p.status === 'APPROVED' && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="w-full max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-20 py-8 font-display text-[#0d141b]">
        <div className="flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => onNavigate('dashboard')} className="text-sm font-medium text-[#4c739a] hover:text-[#137fec]">Home</button>
            <span className="text-sm text-[#4c739a]">/</span>
            <span className="text-sm font-medium text-[#0d141b]">Browse Items</span>
          </div>
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between gap-3 items-center">
            <h1 className="text-4xl font-black tracking-[-0.033em]">Product Catalog</h1>
            
            {/* Action Floating Button (if items selected) */}
            {rfqItems.length > 0 && (
               <button 
                onClick={submitRfq}
                disabled={submitted}
                className="animate-in fade-in slide-in-from-right-4 bg-[#137fec] text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-[#137fec]/90 transition-all flex items-center gap-2"
               >
                {submitted ? (
                   <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
                ) : (
                   <span className="material-symbols-outlined text-xl">send</span>
                )}
                 Request Quote ({rfqItems.length})
               </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Left Sidebar: Filters */}
          <aside className="col-span-1 lg:col-span-1">
            <div className="sticky top-28 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Filters</h3>
                <button className="text-sm font-medium text-[#137fec] hover:underline">Clear all</button>
              </div>
              {/* Category Filter */}
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#4c739a]">Category</h4>
                <ul className="space-y-2">
                  <li><a className="font-bold text-[#137fec]" href="#">All Categories</a></li>
                  <li><a className="text-[#0d141b] hover:text-[#137fec] transition-colors" href="#">Footwear</a></li>
                  <li><a className="text-[#0d141b] hover:text-[#137fec] transition-colors" href="#">Electronics</a></li>
                  <li><a className="text-[#0d141b] hover:text-[#137fec] transition-colors" href="#">Machinery</a></li>
                </ul>
              </div>
              {/* Brand Filter */}
              <div className="flex flex-col gap-4 border-t border-[#e7edf3] pt-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#4c739a]">Brand</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input defaultChecked className="h-4 w-4 rounded border-[#e7edf3] bg-[#f6f7f8] text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/>
                    <span className="text-sm">Brand Alpha</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input className="h-4 w-4 rounded border-[#e7edf3] bg-[#f6f7f8] text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/>
                    <span className="text-sm">Brand Beta</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input className="h-4 w-4 rounded border-[#e7edf3] bg-[#f6f7f8] text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/>
                    <span className="text-sm">Brand Gamma</span>
                  </label>
                </div>
              </div>
              {/* Certifications Filter */}
              <div className="flex flex-col gap-4 border-t border-[#e7edf3] pt-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#4c739a]">Certifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input className="h-4 w-4 rounded border-[#e7edf3] bg-[#f6f7f8] text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/>
                    <span className="text-sm">ISO 9001</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input defaultChecked className="h-4 w-4 rounded border-[#e7edf3] bg-[#f6f7f8] text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/>
                    <span className="text-sm">Eco Certified</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content: Search, Sort, Grid */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
            {/* SearchBar and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label className="flex flex-col h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white border border-[#e7edf3] focus-within:ring-2 focus-within:ring-[#137fec]/50">
                    <div className="text-[#4c739a] flex items-center justify-center pl-4">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input 
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#0d141b] focus:outline-none border-none bg-transparent h-full placeholder:text-[#4c739a] px-2 text-base font-normal leading-normal" 
                      placeholder="Search for items or SKUs..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </label>
              </div>
              <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-[#e7edf3] px-4 hover:border-[#4c739a] transition-colors">
                <span className="material-symbols-outlined text-xl">swap_vert</span>
                <p className="text-sm font-medium">Sort by: Newest</p>
                <span className="material-symbols-outlined text-xl">expand_more</span>
              </button>
            </div>

            {/* Applied Filters Chips */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#137fec]/20 text-[#137fec] pl-3 pr-2">
                <p className="text-sm font-medium">Available Now</p>
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => {
                 const isSelected = rfqItems.includes(product.id);
                 return (
                  <div key={product.id} className={`group flex flex-col rounded-xl border bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${isSelected ? 'border-[#137fec] ring-1 ring-[#137fec]' : 'border-[#e7edf3]'}`}>
                    <div className="aspect-square w-full bg-cover bg-center relative" style={{ backgroundImage: `url('${product.image}')` }}>
                       {isSelected && (
                         <div className="absolute top-2 right-2 bg-[#137fec] text-white rounded-full p-1 shadow-md animate-in zoom-in">
                           <span className="material-symbols-outlined text-base block">check</span>
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col p-4 flex-grow">
                      <h3 className="font-bold text-lg text-[#0d141b] leading-tight">{product.name}</h3>
                      <p className="text-sm text-[#4c739a] mt-1 flex-grow line-clamp-2">{product.description}</p>
                      <p className="text-xs text-[#4c739a] mt-3 font-mono">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    <div className="p-4 pt-0">
                      <button 
                        onClick={() => toggleRfqItem(product.id)}
                        className={`w-full flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-colors ${
                          isSelected 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-[#137fec] text-white hover:bg-[#137fec]/90'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Add to Quote'}
                      </button>
                    </div>
                  </div>
                 );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#e7edf3] pt-6 mt-2">
              <button className="flex items-center gap-2 rounded-lg h-10 px-3 text-sm font-bold border border-[#e7edf3] bg-white hover:bg-[#f6f7f8] transition-colors text-[#0d141b]">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Previous
              </button>
              <nav className="hidden md:flex items-center gap-2">
                <a className="flex items-center justify-center h-10 w-10 rounded-lg text-sm font-bold hover:bg-[#f6f7f8] transition-colors text-[#0d141b]" href="#">1</a>
                <a className="flex items-center justify-center h-10 w-10 rounded-lg text-sm font-bold bg-[#137fec]/20 text-[#137fec]" href="#">2</a>
                <a className="flex items-center justify-center h-10 w-10 rounded-lg text-sm font-bold hover:bg-[#f6f7f8] transition-colors text-[#0d141b]" href="#">3</a>
                <span className="text-sm font-bold text-[#0d141b]">...</span>
              </nav>
              <button className="flex items-center gap-2 rounded-lg h-10 px-3 text-sm font-bold border border-[#e7edf3] bg-white hover:bg-[#f6f7f8] transition-colors text-[#0d141b]">
                Next
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RFQS VIEW ---
  if (activeTab === 'rfqs') {
    // Filter RFQs based on status
    const filteredRfqs = rfqs.filter(rfq => {
      if (rfqStatusFilter === 'all') return true;
      return rfq.status === rfqStatusFilter;
    });

    return (
      <div className="p-8 md:p-12 space-y-8">
        <div className="flex items-center justify-between bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Request History</h2>
                <p className="text-slate-500 mt-1">Track the status of your RFQs and review incoming quotes.</p>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">Export CSV</button>
                <button onClick={() => onNavigate('create-rfq')} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">New Request</button>
            </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All', count: rfqs.length },
            { value: 'OPEN', label: 'Open', count: rfqs.filter(r => r.status === 'OPEN').length },
            { value: 'QUOTED', label: 'Quoted', count: rfqs.filter(r => r.status === 'QUOTED').length },
            { value: 'CLOSED', label: 'Closed', count: rfqs.filter(r => r.status === 'CLOSED').length }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setRfqStatusFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                rfqStatusFilter === tab.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">RFQ Details</th>
                    <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">Date</th>
                    <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">Items</th>
                    <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">Status</th>
                    <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {filteredRfqs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                      No RFQs found with the selected filter.
                    </td>
                  </tr>
                ) : filteredRfqs.map(rfq => {
                    const rfqQuotesForRow = quotes.filter(q => q.rfqId === rfq.id);
                    const quoteCount = rfqQuotesForRow.length;
                    
                    return (
                    <tr key={rfq.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm">#{rfq.id.toUpperCase()}</span>
                                <span className="text-xs text-slate-400 mt-0.5">General Inquiry</span>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-slate-600 text-sm font-medium">{rfq.date}</td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                    {rfq.items.length} Items
                                </span>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                            ${rfq.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                            ${rfq.status === 'QUOTED' ? 'bg-purple-50 text-purple-700 border-purple-100' : ''}
                            ${rfq.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                        `}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                rfq.status === 'OPEN' ? 'bg-blue-500' : 
                                rfq.status === 'QUOTED' ? 'bg-purple-500' : 'bg-emerald-500'
                            }`}></span>
                            {rfq.status === 'QUOTED' ? 'Action Required' : rfq.status}
                        </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                        {rfq.status === 'QUOTED' ? (
                            <div className="flex items-center justify-end gap-4">
                            <div className="text-right">
                                <p className="font-bold text-slate-900 text-sm">{quoteCount} Quotes</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Available</p>
                            </div>
                            <button 
                                onClick={() => handleViewQuotes(rfq.id)}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
                            >
                                Review Quotes
                            </button>
                            </div>
                        ) : rfq.status === 'CLOSED' ? (
                            <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Completed</span>
                        ) : (
                            <span className="text-slate-400 text-xs font-medium flex items-center justify-end gap-1">
                                <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                                Awaiting Suppliers
                            </span>
                        )}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- ORDERS VIEW ---
  if (activeTab === 'orders') {
    const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
    const [orderSearch, setOrderSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

    const filteredOrders = orders.filter(order => {
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const matchesSearch = orderSearch === '' || order.id.toLowerCase().includes(orderSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const selectedOrderDetails = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;

    if (selectedOrderDetails) {
      return (
        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button onClick={() => onNavigate('dashboard')} className="text-slate-500 text-sm font-medium hover:text-[#137fec]">Home</button>
            <span className="text-slate-400 text-sm">/</span>
            <button onClick={() => setSelectedOrder(null)} className="text-slate-500 text-sm font-medium hover:text-[#137fec]">Orders</button>
            <span className="text-slate-400 text-sm">/</span>
            <span className="text-slate-800 text-sm font-medium">{selectedOrderDetails.id}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Order {selectedOrderDetails.id}</h2>
                  <p className="text-slate-500 mt-1">Placed on {selectedOrderDetails.date}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  selectedOrderDetails.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  selectedOrderDetails.status === 'In Transit' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>{selectedOrderDetails.status}</span>
              </div>
            </div>

            <div className="p-8 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Order Progress</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200">
                  <div className={`h-full bg-[#137fec] transition-all ${
                    selectedOrderDetails.status === 'Delivered' ? 'w-full' :
                    selectedOrderDetails.status === 'In Transit' ? 'w-2/3' : 'w-1/3'
                  }`}></div>
                </div>
                {['Order Placed', 'Processing', 'In Transit', 'Delivered'].map((step, idx) => {
                  const isComplete = (idx === 0) || (idx === 1 && ['Processing', 'In Transit', 'Delivered'].includes(selectedOrderDetails.status)) ||
                    (idx === 2 && ['In Transit', 'Delivered'].includes(selectedOrderDetails.status)) || (idx === 3 && selectedOrderDetails.status === 'Delivered');
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? 'bg-[#137fec] text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {isComplete ? <span className="material-symbols-outlined text-lg">check</span> : <span className="text-sm font-bold">{idx + 1}</span>}
                      </div>
                      <span className={`text-xs font-medium mt-2 ${isComplete ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="text-slate-900 font-medium">${(selectedOrderDetails.amount * 0.9).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="text-slate-900 font-medium">${(selectedOrderDetails.amount * 0.05).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="text-slate-900 font-medium">${(selectedOrderDetails.amount * 0.05).toFixed(2)}</span></div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between"><span className="text-slate-900 font-bold">Total</span><span className="text-slate-900 font-bold">${selectedOrderDetails.amount.toFixed(2)}</span></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Shipping Address</h3>
                <div className="bg-slate-50 rounded-lg p-4 text-slate-600">
                  <p className="font-medium text-slate-900">{currentUser?.companyName || 'Company Name'}</p>
                  <p>123 Business Street, Suite 456</p>
                  <p>City, State 12345</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Back to Orders</button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-[#137fec]/90">Download Invoice</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8 md:p-12 space-y-8">
        <div className="flex items-center justify-between bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Order History</h2>
            <p className="text-slate-500 mt-1">Track and manage all your orders in one place.</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>Export
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="flex w-full items-stretch rounded-lg h-12 bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-[#137fec]/50">
              <div className="text-slate-400 flex items-center justify-center pl-4"><span className="material-symbols-outlined">search</span></div>
              <input className="flex w-full min-w-0 flex-1 text-slate-900 focus:outline-none border-none bg-transparent h-full placeholder:text-slate-400 px-2" placeholder="Search orders by ID..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[{ value: 'all', label: 'All Orders' }, { value: 'In Transit', label: 'In Transit' }, { value: 'Delivered', label: 'Delivered' }].map(tab => (
            <button key={tab.value} onClick={() => setOrderStatusFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${orderStatusFilter === tab.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">Order ID</th>
                  <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">Date</th>
                  <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">Amount</th>
                  <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">Status</th>
                  <th className="px-8 py-5 font-semibold text-slate-600 uppercase text-xs tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-500"><span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">inbox</span>No orders found.</td></tr>
                ) : filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6"><span className="font-bold text-slate-900 text-sm">{order.id}</span></td>
                    <td className="px-8 py-6 text-slate-600 text-sm font-medium">{order.date}</td>
                    <td className="px-8 py-6"><span className="text-slate-900 font-bold">${order.amount.toFixed(2)}</span></td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        order.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setSelectedOrder(order.id)} className="text-[#137fec] text-sm font-bold hover:underline flex items-center justify-end gap-1">
                        View Details<span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- SETTINGS VIEW ---
  if (activeTab === 'settings') {
    const [settingsTab, setSettingsTab] = useState<'profile' | 'notifications' | 'security'>('profile');

    return (
      <div className="p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
            <p className="text-slate-500 mt-1">Manage your account preferences and security settings.</p>
          </div>

          <div className="flex gap-1 mb-8 bg-slate-100 rounded-lg p-1 w-fit">
            {[{ id: 'profile', label: 'Profile', icon: 'person' }, { id: 'notifications', label: 'Notifications', icon: 'notifications' }, { id: 'security', label: 'Security', icon: 'lock' }].map(tab => (
              <button key={tab.id} onClick={() => setSettingsTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${settingsTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {settingsTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-8 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
                <p className="text-slate-500 text-sm mt-1">Update your personal and company information.</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-[#137fec] text-white flex items-center justify-center text-2xl font-bold">{currentUser?.name?.charAt(0) || 'U'}</div>
                  <div>
                    <button className="px-4 py-2 text-sm font-medium text-[#137fec] bg-[#137fec]/10 rounded-lg hover:bg-[#137fec]/20">Change Photo</button>
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label><input type="text" defaultValue={currentUser?.name || ''} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#137fec] outline-none" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Email</label><input type="email" defaultValue={currentUser?.email || ''} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#137fec] outline-none" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label><input type="text" defaultValue={currentUser?.companyName || ''} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#137fec] outline-none" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label><input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#137fec] outline-none" /></div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-[#137fec]/90">Save Changes</button>
              </div>
            </div>
          )}

          {settingsTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-8 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
                <p className="text-slate-500 text-sm mt-1">Choose how you want to be notified about updates.</p>
              </div>
              <div className="p-8 space-y-6">
                {[{ id: 'quotes', label: 'New Quote Received', desc: 'Get notified when a supplier sends you a quote' },
                  { id: 'orders', label: 'Order Updates', desc: 'Track your order status and delivery updates' },
                  { id: 'rfq', label: 'RFQ Status Changes', desc: 'Notifications when your RFQ status changes' }].map(item => (
                  <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                    <div><p className="font-medium text-slate-900">{item.label}</p><p className="text-sm text-slate-500">{item.desc}</p></div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-[#137fec]" /><span className="text-sm text-slate-600">Email</span></label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-[#137fec]" /><span className="text-sm text-slate-600">Push</span></label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-[#137fec]/90">Save Preferences</button>
              </div>
            </div>
          )}

          {settingsTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-8 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
                  <p className="text-slate-500 text-sm mt-1">Update your password to keep your account secure.</p>
                </div>
                <div className="p-8 space-y-6">
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label><input type="password" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#137fec] outline-none" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">New Password</label><input type="password" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#137fec] outline-none" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label><input type="password" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#137fec] outline-none" /></div>
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-[#137fec]/90">Update Password</button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between">
                  <div><h3 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h3><p className="text-slate-500 text-sm mt-1">Add an extra layer of security.</p></div>
                  <button className="px-4 py-2 text-sm font-medium text-[#137fec] bg-[#137fec]/10 rounded-lg hover:bg-[#137fec]/20">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 flex items-center justify-center h-96 flex-col text-center rounded-2xl">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
         <span className="material-symbols-outlined text-4xl text-slate-300">construction</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900">Feature Coming Soon</h3>
      <p className="text-slate-500 max-w-md mt-2 leading-relaxed">We are currently building this module. Please check back later.</p>
    </div>
  );
};