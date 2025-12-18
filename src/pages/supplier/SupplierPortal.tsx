import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS, RFQS, QUOTES } from '../../services/mockData';
import { Product } from '../../types/types';

interface SupplierPortalProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const SupplierPortal: React.FC<SupplierPortalProps> = ({ activeTab, onNavigate }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState(PRODUCTS.filter(p => p.supplierId === 'u2'));
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Reset editing state when changing tabs
  useEffect(() => {
    if (activeTab !== 'products') {
        setEditingProduct(null);
    }
  }, [activeTab]);

  const handleDraftQuote = (rfqId: string) => {
      onNavigate('quotes');
  };

  const handleSaveProduct = () => {
    setTimeout(() => {
        alert("Product changes saved successfully!");
        setEditingProduct(null);
    }, 500);
  };

  // --- VIEWS ---

  const DashboardView = () => {
    const pendingRFQs = RFQS.slice(0, 4);
    const getStatusBadge = (status: string) => {
        if (status === 'OPEN') return <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">Awaiting Quote</span>;
        if (status === 'QUOTED') return <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Quote Submitted</span>;
        return <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Quote Accepted</span>;
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500 p-8">
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                <h1 className="text-neutral-800 text-3xl font-bold tracking-tight">{t('supplier.dashboard.title')}</h1>
                <p className="text-neutral-500 text-base font-normal">{t('supplier.dashboard.welcomeMessage')}</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-neutral-700 text-base font-medium leading-normal">{t('supplier.dashboard.newRfqs')}</p>
                        <span className="material-symbols-outlined text-amber-500">new_releases</span>
                    </div>
                    <p className="text-amber-500 tracking-tight text-4xl font-bold leading-tight">5</p>
                    <button onClick={() => onNavigate('requests')} className="text-sm font-medium text-[#137fec] hover:underline mt-2 text-left">{t('supplier.dashboard.viewRfqs')}</button>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-neutral-700 text-base font-medium leading-normal">{t('supplier.dashboard.quotesSubmitted')}</p>
                        <span className="material-symbols-outlined text-neutral-500">receipt_long</span>
                    </div>
                    <p className="text-neutral-800 tracking-tight text-4xl font-bold leading-tight">12</p>
                    <button onClick={() => onNavigate('orders')} className="text-sm font-medium text-[#137fec] hover:underline mt-2 text-left">{t('supplier.dashboard.viewQuotes')}</button>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-neutral-700 text-base font-medium leading-normal">{t('supplier.dashboard.manageProducts')}</p>
                        <span className="material-symbols-outlined text-neutral-500">inventory_2</span>
                    </div>
                    <p className="text-neutral-800 tracking-tight text-4xl font-bold leading-tight">154</p>
                    <button onClick={() => onNavigate('products')} className="text-sm font-medium text-[#137fec] hover:underline mt-2 text-left">{t('supplier.dashboard.viewCatalog')}</button>
                </div>
            </div>

            {/* Pending Actions Table */}
            <div className="space-y-6">
                <h2 className="text-neutral-800 text-xl font-bold leading-tight tracking-tight">{t('supplier.dashboard.pendingActions')}</h2>
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">RFQ ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">Due Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {pendingRFQs.map((rfq) => (
                                <tr key={rfq.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-neutral-800 text-sm font-medium">RFQ-{rfq.id.toUpperCase()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500 text-sm">{rfq.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(rfq.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleDraftQuote(rfq.id)} className="text-[#137fec] font-semibold hover:underline flex items-center gap-1">
                                            View & Quote <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
  };

  const EditProductView = ({ product, onBack }: { product: Product, onBack: () => void }) => {
    return (
        <div className="w-full mx-auto animate-in fade-in zoom-in-95 duration-300 p-6 lg:p-8">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <button onClick={onBack} className="text-neutral-400 text-sm font-medium hover:text-[#137fec]">Products</button>
                <span className="text-neutral-400 text-sm font-medium">/</span>
                <button className="text-neutral-400 text-sm font-medium hover:text-[#137fec]">{product.name}</button>
                <span className="text-neutral-400 text-sm font-medium">/</span>
                <span className="text-neutral-500 text-sm font-medium">Edit</span>
            </div>

            {/* PageHeading */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <p className="text-neutral-500 text-2xl lg:text-3xl font-bold tracking-tight">{t('supplier.products.editProduct')}</p>
                    <p className="text-neutral-400 text-sm">{t('supplier.products.uploadHint')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Pending Approval</span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Live</span>
                </div>
            </div>

            {/* ActionPanel */}
            <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 sm:flex-row sm:items-center mb-8">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined !text-xl text-yellow-600 mt-0.5">warning</span>
                    <div className="flex flex-col gap-1">
                        <p className="text-yellow-900 text-sm font-semibold">Pending Approval</p>
                        <p className="text-yellow-700 text-sm">Changes submitted will require admin approval before going live.</p>
                    </div>
                </div>
            </div>

            {/* Form Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Product Info */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="rounded-lg border border-neutral-300 bg-white p-6">
                        <div className="flex flex-col gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-500 mb-1.5">Item Name</label>
                                <input className="form-input w-full rounded-lg border-neutral-300 bg-neutral-100/50 focus:border-[#137fec] focus:ring-[#137fec] text-sm py-2.5" type="text" defaultValue={product.name} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-500 mb-1.5">Product ID / SKU</label>
                                <input className="form-input w-full rounded-lg border-neutral-300 bg-neutral-200/50 text-neutral-400 text-sm py-2.5" disabled readOnly type="text" defaultValue={product.sku || `SKU-${product.id}`} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-500 mb-1.5">Description</label>
                                <textarea className="form-textarea w-full rounded-lg border-neutral-300 bg-neutral-100/50 focus:border-[#137fec] focus:ring-[#137fec] text-sm" rows={5} defaultValue={product.description}></textarea>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-1.5">Cost Price</label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 text-sm">USD</span>
                                        <input className="form-input w-full rounded-lg border-neutral-300 bg-neutral-100/50 focus:border-[#137fec] focus:ring-[#137fec] text-sm pl-12 py-2.5" type="text" defaultValue={product.costPrice} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-1.5">Category</label>
                                    <select className="form-select w-full rounded-lg border-neutral-300 bg-neutral-100/50 focus:border-[#137fec] focus:ring-[#137fec] text-sm py-2.5" defaultValue={product.category}>
                                        <option>Office Furniture</option>
                                        <option>Electronics</option>
                                        <option>Industrial</option>
                                        <option>Safety Gear</option>
                                        <option>Footwear</option>
                                        <option>Accessories</option>
                                        <option>Kitchenware</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Product Images */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="rounded-lg border border-neutral-300 bg-white p-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-neutral-500">Product Images</h3>
                                <p className="text-sm text-neutral-400 mt-1">Upload high-quality images. The first image is primary.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group aspect-square">
                                    <img className="rounded-lg object-cover w-full h-full" src={product.image} alt="Primary" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 rounded-lg transition-opacity">
                                        <button className="bg-white/20 p-1.5 rounded-full text-white backdrop-blur-sm"><span className="material-symbols-outlined !text-base">close</span></button>
                                    </div>
                                </div>
                                <div className="relative group aspect-square bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-300">
                                     <span className="material-symbols-outlined text-4xl">image</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-neutral-100 hover:bg-neutral-200/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <span className="material-symbols-outlined text-neutral-400 !text-3xl">upload_file</span>
                                        <p className="mb-2 text-sm text-neutral-400"><span className="font-semibold">Click to upload</span></p>
                                        <p className="text-xs text-neutral-400">PNG, JPG or GIF (MAX. 800x400px)</p>
                                    </div>
                                    <input className="hidden" type="file"/>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-neutral-300">
                <button onClick={onBack} className="flex items-center justify-center rounded-lg h-10 bg-neutral-200 text-neutral-500 text-sm font-semibold px-4 hover:bg-neutral-300">Cancel</button>
                <button onClick={handleSaveProduct} className="flex items-center justify-center rounded-lg h-10 bg-[#137fec] text-white text-sm font-semibold px-4 hover:bg-[#137fec]/90">Save Changes</button>
            </div>
        </div>
    );
  };

  const ProductsView = () => {
      return (
        <div className="p-8 mx-auto max-w-7xl animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-neutral-800">{t('supplier.products.title')}</h1>
                    <p className="text-neutral-500">{t('supplier.products.subtitle')}</p>
                </div>
                <button onClick={() => alert("Add Product Demo")} className="bg-[#137fec] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#137fec]/90">
                    <span className="material-symbols-outlined">add</span>
                    {t('supplier.products.addNewProduct')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all group">
                        <div className="aspect-[4/3] relative bg-neutral-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${product.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {product.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1 gap-2">
                            <h3 className="font-bold text-neutral-800 truncate" title={product.name}>{product.name}</h3>
                            <p className="text-sm text-neutral-500 line-clamp-2 flex-1">{product.description}</p>
                            <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                                <span className="font-mono text-sm font-bold text-neutral-700">${product.costPrice}</span>
                                <button 
                                    onClick={() => setEditingProduct(product)}
                                    className="text-[#137fec] text-sm font-bold hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-base">edit</span> Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
  };

  const RequestsView = () => {
      return (
          <div className="p-8 mx-auto max-w-7xl animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-neutral-800 mb-6">{t('supplier.rfqs.title')}</h1>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase">RFQ ID</th>
                            <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase">Items</th>
                            <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {RFQS.map(rfq => (
                            <tr key={rfq.id} className="hover:bg-neutral-50">
                                <td className="px-6 py-4 font-medium text-neutral-800">#{rfq.id.toUpperCase()}</td>
                                <td className="px-6 py-4 text-neutral-500">{rfq.date}</td>
                                <td className="px-6 py-4 text-neutral-500">{rfq.items.length} Items</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${rfq.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{rfq.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onNavigate('quotes')} className="text-[#137fec] font-bold text-sm hover:underline">Submit Quote</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )
  }

  const BrowseRFQsView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const allRFQs = RFQS; // In production, this would fetch from API
    const filteredRFQs = allRFQs.filter(rfq =>
      rfq.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="w-full max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-20 py-8 font-display text-[#0d141b] animate-in fade-in duration-300">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap justify-between gap-3 items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-black tracking-[-0.033em]">Browse RFQs/RFPs</h1>
              <p className="text-[#4c739a] text-base">Discover new opportunities and submit your quotes</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label className="flex flex-col h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white border border-[#e7edf3] focus-within:ring-2 focus-within:ring-[#137fec]/50">
                  <div className="text-[#4c739a] flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#0d141b] focus:outline-none border-none bg-transparent h-full placeholder:text-[#4c739a] px-2 text-base font-normal leading-normal"
                    placeholder="Search RFQs by ID or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>
            <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-[#e7edf3] px-4 hover:border-[#4c739a] transition-colors">
              <span className="material-symbols-outlined text-xl">filter_list</span>
              <p className="text-sm font-medium">Filters</p>
            </button>
          </div>

          {/* RFQ Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
            {filteredRFQs.map(rfq => {
              const firstItem = PRODUCTS.find(p => p.id === rfq.items[0]?.productId);
              return (
                <div key={rfq.id} className="group flex flex-col rounded-xl border border-[#e7edf3] bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="p-6 flex flex-col gap-4 flex-grow">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-lg text-[#0d141b]">RFQ-{rfq.id.toUpperCase()}</h3>
                        <p className="text-sm text-[#4c739a]">{firstItem?.name || 'Multiple Items'}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        rfq.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                        rfq.status === 'QUOTED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rfq.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <p className="text-[#4c739a]">Posted Date</p>
                        <p className="font-medium text-[#0d141b]">{rfq.date}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[#4c739a]">Items</p>
                        <p className="font-medium text-[#0d141b]">{rfq.items.length} items</p>
                      </div>
                    </div>

                    <div className="border-t border-[#e7edf3] pt-4 mt-auto">
                      <p className="text-xs text-[#4c739a] line-clamp-2">
                        {rfq.items.map((item, idx) => {
                          const prod = PRODUCTS.find(p => p.id === item.productId);
                          return prod ? `${prod.name} (${item.quantity}x)` : '';
                        }).filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#f6f7f8] border-t border-[#e7edf3]">
                    <button
                      onClick={() => handleDraftQuote(rfq.id)}
                      className="w-full flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold bg-[#137fec] text-white hover:bg-[#137fec]/90 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base mr-2">rate_review</span>
                      Submit Quote
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRFQs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-[#f6f7f8] rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-[#4c739a]">search_off</span>
              </div>
              <h3 className="text-xl font-bold text-[#0d141b]">No RFQs Found</h3>
              <p className="text-[#4c739a] max-w-md mt-2">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const QuotesView = () => {
    const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);
    const [quoteDetails, setQuoteDetails] = useState({
      unitPrice: '',
      shippingCost: '',
      tax: '',
      leadTime: '',
      notes: ''
    });

    const pendingRFQs = RFQS.filter(rfq => rfq.status === 'OPEN');
    const rfq = selectedRFQ ? RFQS.find(r => r.id === selectedRFQ) : null;

    const calculateTotal = () => {
      if (!rfq) return 0;
      const totalItems = rfq.items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = parseFloat(quoteDetails.unitPrice || '0') * totalItems;
      const shipping = parseFloat(quoteDetails.shippingCost || '0');
      const tax = parseFloat(quoteDetails.tax || '0');
      return subtotal + shipping + tax;
    };

    const handleSubmitQuote = () => {
      alert('Quote submitted successfully!');
      setSelectedRFQ(null);
      setQuoteDetails({
        unitPrice: '',
        shippingCost: '',
        tax: '',
        leadTime: '',
        notes: ''
      });
    };

    if (!selectedRFQ) {
      return (
        <div className="w-full max-w-screen-xl mx-auto px-6 md:px-10 py-8 animate-in fade-in duration-300">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-neutral-800">Create Quote</h1>
              <p className="text-neutral-500">Select an RFQ to start building your quote</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRFQs.map(rfq => {
                const firstItem = PRODUCTS.find(p => p.id === rfq.items[0]?.productId);
                return (
                  <div key={rfq.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedRFQ(rfq.id)}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-neutral-800">RFQ-{rfq.id.toUpperCase()}</h3>
                        <p className="text-sm text-neutral-500">{rfq.date}</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">OPEN</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium">{rfq.items.length}</span> items requested
                      </p>
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {firstItem?.name || 'Multiple products'}
                      </p>
                    </div>
                    <button className="mt-4 w-full py-2 px-4 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90 transition-colors">
                      Create Quote
                    </button>
                  </div>
                );
              })}
            </div>

            {pendingRFQs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-neutral-400">request_quote</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-800">No Open RFQs</h3>
                <p className="text-neutral-500 max-w-md mt-2">There are currently no open RFQs available for quoting. Check back later or browse the RFQs section.</p>
                <button onClick={() => onNavigate('browse')} className="mt-4 px-6 py-2 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90">
                  Browse RFQs
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-screen-xl mx-auto px-6 md:px-10 py-8 animate-in fade-in duration-300">
        <div className="flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedRFQ(null)} className="text-sm font-medium text-neutral-500 hover:text-[#137fec]">Quotes</button>
            <span className="text-sm text-neutral-400">/</span>
            <span className="text-sm font-medium text-neutral-800">RFQ-{rfq?.id.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Quote Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-800 mb-4">Quote Details</h2>

                {/* RFQ Items */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-neutral-600 uppercase mb-3">Requested Items</h3>
                  <div className="space-y-2">
                    {rfq?.items.map((item, idx) => {
                      const product = PRODUCTS.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img src={product?.image} alt={product?.name} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <p className="font-medium text-neutral-800">{product?.name}</p>
                              <p className="text-sm text-neutral-500">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">Unit Price (USD)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">$</span>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#137fec] focus:border-[#137fec]"
                          placeholder="0.00"
                          value={quoteDetails.unitPrice}
                          onChange={(e) => setQuoteDetails({...quoteDetails, unitPrice: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">Lead Time</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#137fec] focus:border-[#137fec]"
                        placeholder="e.g., 3-5 business days"
                        value={quoteDetails.leadTime}
                        onChange={(e) => setQuoteDetails({...quoteDetails, leadTime: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">Shipping Cost (USD)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">$</span>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#137fec] focus:border-[#137fec]"
                          placeholder="0.00"
                          value={quoteDetails.shippingCost}
                          onChange={(e) => setQuoteDetails({...quoteDetails, shippingCost: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">Tax (USD)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">$</span>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#137fec] focus:border-[#137fec]"
                          placeholder="0.00"
                          value={quoteDetails.tax}
                          onChange={(e) => setQuoteDetails({...quoteDetails, tax: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">Additional Notes</label>
                    <textarea
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#137fec] focus:border-[#137fec]"
                      rows={4}
                      placeholder="Any special conditions, warranties, or additional information..."
                      value={quoteDetails.notes}
                      onChange={(e) => setQuoteDetails({...quoteDetails, notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">Quote Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-medium text-neutral-800">
                      ${(parseFloat(quoteDetails.unitPrice || '0') * (rfq?.items.reduce((sum, item) => sum + item.quantity, 0) || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-medium text-neutral-800">${parseFloat(quoteDetails.shippingCost || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tax</span>
                    <span className="font-medium text-neutral-800">${parseFloat(quoteDetails.tax || '0').toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 flex justify-between">
                    <span className="font-bold text-neutral-800">Total</span>
                    <span className="font-bold text-xl text-neutral-800">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleSubmitQuote}
                    disabled={!quoteDetails.unitPrice || !quoteDetails.leadTime}
                    className="w-full py-3 px-4 bg-[#137fec] text-white rounded-lg font-bold hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Quote
                  </button>
                  <button
                    onClick={() => setSelectedRFQ(null)}
                    className="w-full py-3 px-4 bg-white text-neutral-600 border border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
                    <p className="text-xs text-blue-700">Your quote will be reviewed by the admin before being sent to the client.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrdersView = () => {
    const [activeOrderTab, setActiveOrderTab] = useState<'pending' | 'completed' | 'won'>('won');

    return (
      <div className="flex flex-col h-full font-display bg-background-light dark:bg-background-dark animate-in fade-in duration-500">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-8 py-3 sticky top-0 z-10">
            <label className="flex flex-col min-w-40 !h-10 max-w-sm">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-slate-500 dark:text-slate-400 flex border-none bg-slate-100 dark:bg-slate-800 items-center justify-center pl-3 rounded-l-lg border-r-0">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>search</span>
            </div>
            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 focus:border-none h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" placeholder="Search..." defaultValue=""/>
            </div>
            </label>
            <div className="flex items-center gap-4">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">chat_bubble</span>
            </button>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCKElWVK48vCLvGHqhzjpMQ0iLTiTSvfb7xH7tjZBd_FMOshpe_JK6Kr5aDfIYwLAjRz3DR6Ft6PlwcKrX5vpnu0i6p22S0OW0mXY4iXwgH4bTnJ5yqVhNc4-AKky04lXMmjcKrQAzJJKLrFNrOvdPwzVBKkXPzAp_EZqKejKj0Cu8HCmg3NanNyWnT_t6RlmgcKmn4ghEBpDRS-stUffwQY_MMRFrY0FrALkSquFfP8Y_sHBdkkyZUqpVp7ogPoEu1yv_l9TT0HL04")'}}></div>
            </div>
        </header>

        <main className="flex-1 p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">Orders Management</p>
        <button className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 transition-colors">
        <span className="material-symbols-outlined" style={{fontSize: '20px'}}>add</span>
        <span>New Order</span>
        </button>
        </div>
        <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
        <nav aria-label="Tabs" className="-mb-px flex space-x-6">
            <button 
                onClick={() => setActiveOrderTab('won')}
                className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold ${activeOrderTab === 'won' ? 'border-[#137fec] text-[#137fec]' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300'}`}
            >
                Won Purchase Orders
            </button>
            <button 
                onClick={() => setActiveOrderTab('completed')}
                className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-medium ${activeOrderTab === 'completed' ? 'border-[#137fec] text-[#137fec]' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300'}`}
            >
                Completed Orders
            </button>
            <button 
                onClick={() => setActiveOrderTab('pending')}
                className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-medium ${activeOrderTab === 'pending' ? 'border-[#137fec] text-[#137fec]' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300'}`}
            >
                Pending Orders
            </button>
        </nav>
        </div>
        
        {/* --- PENDING ORDERS TABLE --- */}
        {activeOrderTab === 'pending' && (
            <div>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
            <label className="flex flex-col min-w-40 h-11 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-slate-500 dark:text-slate-400 flex border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>search</span>
            </div>
            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-[#137fec] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#137fec] h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" placeholder="Search by Order ID, Client..." defaultValue=""/>
            </div>
            </label>
            </div>
            <div className="flex gap-3">
            <button className="flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <p className="text-sm font-medium leading-normal">Status</p>
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>expand_more</span>
            </button>
            <button className="flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined mr-1" style={{fontSize: '20px'}}>calendar_today</span>
            <p className="text-sm font-medium leading-normal">Date Range</p>
            </button>
            </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
            <tr>
            <th className="p-4" scope="col"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></th>
            <th className="px-6 py-3" scope="col">Order ID</th>
            <th className="px-6 py-3" scope="col">Client</th>
            <th className="px-6 py-3" scope="col">Items / Quantity</th>
            <th className="px-6 py-3" scope="col">Order Date</th>
            <th className="px-6 py-3" scope="col">Status</th>
            <th className="px-6 py-3 text-right" scope="col">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#OD78952</td>
            <td className="px-6 py-4">Client-A8B4</td>
            <td className="px-6 py-4">5 items / 25 units</td>
            <td className="px-6 py-4">Jan 12, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-500"></span>Pending
                                                    </span>
            </td>
            <td className="px-6 py-4 text-right">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </button>
            </td>
            </tr>
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#OD78950</td>
            <td className="px-6 py-4">Client-C2D9</td>
            <td className="px-6 py-4">2 items / 10 units</td>
            <td className="px-6 py-4">Jan 09, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-500"></span>Processing
                                                    </span>
            </td>
            <td className="px-6 py-4 text-right">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </button>
            </td>
            </tr>
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#OD78948</td>
            <td className="px-6 py-4">Client-F5E1</td>
            <td className="px-6 py-4">1 item / 1 unit</td>
            <td className="px-6 py-4">Jan 05, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-500"></span>Shipped
                                                    </span>
            </td>
            <td className="px-6 py-4 text-right">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </button>
            </td>
            </tr>
            </tbody>
            </table>
            </div>
            <nav aria-label="Table navigation" className="flex items-center justify-between p-4">
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-900 dark:text-white">1-3</span> of <span className="font-semibold text-slate-900 dark:text-white">15</span></span>
            <div className="inline-flex items-center -space-x-px">
            <button className="flex items-center justify-center h-9 px-3 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">Previous</button>
            <button className="flex items-center justify-center h-9 w-9 leading-tight text-[#137fec] bg-[#137fec]/10 border border-[#137fec] hover:bg-[#137fec]/20 hover:text-[#137fec] dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors">1</button>
            <button className="flex items-center justify-center h-9 w-9 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">2</button>
            <button className="flex items-center justify-center h-9 px-3 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">Next</button>
            </div>
            </nav>
            </div>
            </div>
        )}

        {/* --- WON ORDERS TABLE --- */}
        {activeOrderTab === 'won' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-3xl">This section lists all purchase orders where your quote has been accepted by the client. Client names are anonymized for privacy. You can search, filter, and view detailed information for each won order.</p>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
            <label className="flex flex-col min-w-40 h-11 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-slate-500 dark:text-slate-400 flex border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>search</span>
            </div>
            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-[#137fec] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#137fec] h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" placeholder="Search by Order ID, Client..." defaultValue=""/>
            </div>
            </label>
            </div>
            <div className="flex gap-3">
            <button className="flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <p className="text-sm font-medium leading-normal">Status</p>
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>expand_more</span>
            </button>
            <button className="flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined mr-1" style={{fontSize: '20px'}}>calendar_today</span>
            <p className="text-sm font-medium leading-normal">Date Range</p>
            </button>
            </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
            <tr>
            <th className="p-4" scope="col"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></th>
            <th className="px-6 py-3" scope="col">Order ID</th>
            <th className="px-6 py-3" scope="col">Client</th>
            <th className="px-6 py-3" scope="col">Items / Quantity</th>
            <th className="px-6 py-3" scope="col">Acceptance Date</th>
            <th className="px-6 py-3" scope="col">Status</th>
            <th className="px-6 py-3 text-right" scope="col">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#PO-86753</td>
            <td className="px-6 py-4">Client-A8B4</td>
            <td className="px-6 py-4">5 items / 25 units</td>
            <td className="px-6 py-4">Jan 12, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>Quote Accepted
                                                    </span>
            </td>
            <td className="px-6 py-4 text-right">
            <a className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline" href="#">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </a>
            </td>
            </tr>
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#PO-86751</td>
            <td className="px-6 py-4">Client-C2D9</td>
            <td className="px-6 py-4">2 items / 10 units</td>
            <td className="px-6 py-4">Jan 09, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>Quote Accepted
                                                    </span>
            </td>
            <td className="px-6 py-4 text-right">
            <a className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline" href="#">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </a>
            </td>
            </tr>
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#PO-86749</td>
            <td className="px-6 py-4">Client-F5E1</td>
            <td className="px-6 py-4">1 item / 1 unit</td>
            <td className="px-6 py-4">Jan 05, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>Quote Accepted
                                                    </span>
            </td>
            <td className="px-6 py-4 text-right">
            <a className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline" href="#">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </a>
            </td>
            </tr>
            </tbody>
            </table>
            </div>
            <nav aria-label="Table navigation" className="flex items-center justify-between p-4">
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-900 dark:text-white">1-3</span> of <span className="font-semibold text-slate-900 dark:text-white">15</span></span>
            <div className="inline-flex items-center -space-x-px">
            <button className="flex items-center justify-center h-9 px-3 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">Previous</button>
            <button className="flex items-center justify-center h-9 w-9 leading-tight text-[#137fec] bg-[#137fec]/10 border border-[#137fec] hover:bg-[#137fec]/20 hover:text-[#137fec] dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors">1</button>
            <button className="flex items-center justify-center h-9 w-9 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">2</button>
            <button className="flex items-center justify-center h-9 px-3 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">Next</button>
            </div>
            </nav>
            </div>
            </div>
        )}
        
        {/* --- COMPLETED ORDERS TABLE --- */}
        {activeOrderTab === 'completed' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-3xl">This section lists all successfully delivered and closed orders. You can search, filter, and view detailed information for each completed order. Client names are anonymized for privacy.</p>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
            <label className="flex flex-col min-w-40 h-11 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-slate-500 dark:text-slate-400 flex border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>search</span>
            </div>
            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-[#137fec] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#137fec] h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" placeholder="Search by Order ID, Client..." defaultValue=""/>
            </div>
            </label>
            </div>
            <div className="flex gap-3">
            <button className="flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <p className="text-sm font-medium leading-normal">Status</p>
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>expand_more</span>
            </button>
            <button className="flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined mr-1" style={{fontSize: '20px'}}>calendar_today</span>
            <p className="text-sm font-medium leading-normal">Date Range</p>
            </button>
            </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
            <tr>
            <th className="p-4" scope="col"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></th>
            <th className="px-6 py-3" scope="col">Order ID</th>
            <th className="px-6 py-3" scope="col">Client</th>
            <th className="px-6 py-3" scope="col">Items / Quantity</th>
            <th className="px-6 py-3" scope="col">Delivery Date</th>
            <th className="px-6 py-3" scope="col">Final Status</th>
            <th className="px-6 py-3 text-right" scope="col">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#CO-91245</td>
            <td className="px-6 py-4">Client-B3F7</td>
            <td className="px-6 py-4">3 items / 15 units</td>
            <td className="px-6 py-4">Mar 15, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            <span className="size-1.5 rounded-full bg-green-500"></span>Delivered
            </span>
            </td>
            <td className="px-6 py-4 text-right">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </button>
            </td>
            </tr>
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#CO-91240</td>
            <td className="px-6 py-4">Client-D1E5</td>
            <td className="px-6 py-4">8 items / 120 units</td>
            <td className="px-6 py-4">Mar 11, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            <span className="size-1.5 rounded-full bg-slate-500"></span>Closed
            </span>
            </td>
            <td className="px-6 py-4 text-right">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </button>
            </td>
            </tr>
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#CO-91233</td>
            <td className="px-6 py-4">Client-A8B4</td>
            <td className="px-6 py-4">5 items / 25 units</td>
            <td className="px-6 py-4">Feb 28, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            <span className="size-1.5 rounded-full bg-green-500"></span>Delivered
            </span>
            </td>
            <td className="px-6 py-4 text-right">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </button>
            </td>
            </tr>
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4"><input className="form-checkbox rounded text-[#137fec] focus:ring-[#137fec]/50" type="checkbox"/></td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#CO-91225</td>
            <td className="px-6 py-4">Client-G9H2</td>
            <td className="px-6 py-4">1 item / 5 units</td>
            <td className="px-6 py-4">Feb 25, 2024</td>
            <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            <span className="size-1.5 rounded-full bg-slate-500"></span>Closed
            </span>
            </td>
            <td className="px-6 py-4 text-right">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[#137fec] hover:underline">
            <span>View Details</span>
            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
            </button>
            </td>
            </tr>
            </tbody>
            </table>
            </div>
            <nav aria-label="Table navigation" className="flex items-center justify-between p-4">
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-900 dark:text-white">1-4</span> of <span className="font-semibold text-slate-900 dark:text-white">28</span></span>
            <div className="inline-flex items-center -space-x-px">
            <button className="flex items-center justify-center h-9 px-3 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">Previous</button>
            <button className="flex items-center justify-center h-9 w-9 leading-tight text-[#137fec] bg-[#137fec]/10 border border-[#137fec] hover:bg-[#137fec]/20 hover:text-[#137fec] dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors">1</button>
            <button className="flex items-center justify-center h-9 w-9 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">2</button>
            <button className="flex items-center justify-center h-9 px-3 leading-tight text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">Next</button>
            </div>
            </nav>
            </div>
            </div>
        )}

        </main>
      </div>
    )
  }

  if (activeTab === 'dashboard') return <DashboardView />;
  if (activeTab === 'products') {
      if (editingProduct) return <EditProductView product={editingProduct} onBack={() => setEditingProduct(null)} />;
      return <ProductsView />;
  }
  if (activeTab === 'requests') return <RequestsView />;
  if (activeTab === 'browse') return <BrowseRFQsView />;
  if (activeTab === 'quotes') return <QuotesView />;
  if (activeTab === 'orders') return <OrdersView />;

  // Default / Fallback
  return (
    <div className="p-12 text-center">
      <h2 className="text-xl font-bold text-neutral-700">Section Coming Soon</h2>
      <p className="text-neutral-500 mt-2">We are working on the {activeTab} view.</p>
    </div>
  );
};
