import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS, QUOTES, USERS, RFQS } from '../../services/mockData';
import { Quote, UserRole } from '../../types/types';

interface AdminPortalProps {
  activeTab: string;
}

declare global {
  interface Window {
    Chart: any;
  }
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeTab }) => {
  const { t } = useTranslation();
  // State for individual quote overrides (Manual)
  const [editingQuotes, setEditingQuotes] = useState<Record<string, number>>({});
  
  // State for Global Universal Margin
  const [globalMargin, setGlobalMargin] = useState<number>(15);
  
  // State for Category-based Margins
  const [categoryMargins, setCategoryMargins] = useState<Record<string, number>>({
    'Electronics': 12,
    'Furniture': 20,
    'Industrial': 18,
    'Footwear': 15,
    'Accessories': 25
  });

  // User Management Sub-tab state
  const [userViewMode, setUserViewMode] = useState<'suppliers' | 'clients'>('suppliers');

  // Charts Refs
  const salesChartRef = useRef<HTMLCanvasElement>(null);
  const marginChartRef = useRef<HTMLCanvasElement>(null);
  const ordersChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  // Helper: Get category for a quote based on the first item in its RFQ
  const getQuoteCategory = (quote: Quote): string => {
    const rfq = RFQS.find(r => r.id === quote.rfqId);
    if (!rfq || rfq.items.length === 0) return 'General';
    const product = PRODUCTS.find(p => p.id === rfq.items[0].productId);
    return product ? product.category : 'General';
  };

  // Helper: Determine effective margin and source
  const getEffectiveMarginData = (quote: Quote) => {
    const category = getQuoteCategory(quote);
    
    // 1. Check for Manual Override
    if (editingQuotes[quote.id] !== undefined) {
      return { value: editingQuotes[quote.id], source: t('admin.margins.manualOverride'), type: 'manual' };
    }
    
    // 2. Check for Category Margin
    if (categoryMargins[category] !== undefined) {
      return { value: categoryMargins[category], source: `${t('admin.margins.categoryPrefix')} ${category}`, type: 'category' };
    }

    // 3. Default to Global Margin
    return { value: globalMargin, source: t('admin.margins.universalMargin'), type: 'global' };
  };

  const handleManualMarginChange = (quoteId: string, val: number) => {
    setEditingQuotes({ ...editingQuotes, [quoteId]: val });
  };

  const handleCategoryMarginChange = (category: string, val: number) => {
    setCategoryMargins({ ...categoryMargins, [category]: val });
  };

  const resetQuoteMargin = (quoteId: string) => {
    const newEditing = { ...editingQuotes };
    delete newEditing[quoteId];
    setEditingQuotes(newEditing);
  };

  // Initialize Charts for the Overview Tab
  useEffect(() => {
    if (activeTab === 'overview' && window.Chart) {
      // Cleanup previous charts
      chartInstances.current.forEach(chart => chart.destroy());
      chartInstances.current = [];

      const colors = {
        'neutral-800': '#111318',
        'neutral-100': '#f0f2f4',
        'neutral-600': '#616f89',
        'neutral-200': '#dbdfe6',
        'chart-blue': '#3b82f6',
        'chart-green': '#22c55e',
        'chart-purple': '#8b5cf6',
      };

      const commonTooltipOptions = {
        enabled: true,
        backgroundColor: colors['neutral-800'],
        titleColor: colors['neutral-100'],
        bodyColor: colors['neutral-100'],
        borderColor: colors['neutral-600'],
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === 'yMargin') {
                label += context.parsed.y.toFixed(1) + '%';
              } else if (context.dataset.label === 'Orders') {
                 label += context.parsed.y;
              } else {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
              }
            }
            return label;
          }
        }
      };

      const commonChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } },
        elements: { point: { radius: 0, hoverRadius: 5 }, line: { tension: 0.4 } },
      };

      // Sales Chart
      if (salesChartRef.current) {
        const ctx = salesChartRef.current.getContext('2d');
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

            const chart = new window.Chart(ctx, {
            type: 'line',
            data: {
              labels: Array.from({length: 30}, (_, i) => `${t('admin.margins.day')} ${i + 1}`),
              datasets: [{
                label: t('admin.overview.sales'),
                data: [35, 45, 55, 50, 60, 75, 80, 70, 85, 95, 100, 110, 120, 115, 130, 140, 150, 145, 160, 170, 165, 180, 190, 200, 195, 210, 220, 230, 225, 240].map(v => v * 1000),
                borderColor: colors['chart-blue'],
                borderWidth: 2,
                fill: true,
                backgroundColor: gradient,
              }]
            },
            options: { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, tooltip: commonTooltipOptions } }
          });
          chartInstances.current.push(chart);
        }
      }

      // Margin Chart
      if (marginChartRef.current) {
        const ctx = marginChartRef.current.getContext('2d');
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

            const chart = new window.Chart(ctx, {
            type: 'line',
            data: {
              labels: Array.from({length: 30}, (_, i) => `${t('admin.margins.day')} ${i + 1}`),
              datasets: [{
                label: t('admin.overview.margin'),
                data: [20, 19.5, 19, 19.2, 18.8, 19, 18.5, 18.6, 18.2, 18.4, 18, 18.1, 17.8, 17.9, 18.2, 18.5, 18.3, 18, 17.5, 17.8, 18, 18.2, 18.5, 18.4, 18.6, 18.3, 18.1, 18.4, 18.2, 18.4],
                borderColor: colors['chart-purple'],
                borderWidth: 2,
                fill: true,
                backgroundColor: gradient,
              }]
            },
            options: { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, tooltip: { ...commonTooltipOptions, callbacks: { label: (context: any) => `${t('admin.overview.margin')}: ${context.parsed.y.toFixed(1)}%` } } } }
          });
          chartInstances.current.push(chart);
        }
      }

      // Orders Chart
      if (ordersChartRef.current) {
        const chart = new window.Chart(ordersChartRef.current, {
          type: 'bar',
          data: {
            labels: Array.from({length: 30}, (_, i) => `${t('admin.margins.day')} ${i + 1}`),
            datasets: [{
              label: t('admin.margins.orders'),
              data: [80, 90, 100, 95, 110, 120, 115, 130, 140, 135, 150, 160, 155, 170, 180, 175, 190, 200, 195, 210, 220, 215, 230, 240, 235, 250, 260, 255, 270, 280],
              backgroundColor: colors['chart-green'],
              borderRadius: 2,
              barThickness: 4,
            }]
          },
          options: { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, tooltip: { ...commonTooltipOptions, callbacks: { label: (context: any) => `${t('admin.margins.orders')}: ${context.parsed.y}` } } } }
        });
        chartInstances.current.push(chart);
      }

      // Revenue Main Chart
      if (revenueChartRef.current) {
        const chart = new window.Chart(revenueChartRef.current, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                label: t('admin.overview.sales'),
                data: [65000, 59000, 80000, 81000, 56000, 55000, 40000, 72000, 95000, 105000, 115000, 128000],
                backgroundColor: colors['chart-blue'],
                borderColor: colors['chart-blue'],
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'ySales',
              },
              {
                label: t('admin.overview.margin'),
                data: [18, 19, 20, 19, 21, 22, 19, 18, 18.5, 19, 18.2, 18.4],
                backgroundColor: colors['chart-green'],
                borderColor: colors['chart-green'],
                type: 'line',
                tension: 0.4,
                yAxisID: 'yMargin',
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: colors['chart-green'],
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false }, tooltip: commonTooltipOptions },
            scales: {
              x: { grid: { display: false }, ticks: { color: colors['neutral-600'] } },
              ySales: {
                type: 'linear',
                position: 'left',
                grid: { color: colors['neutral-200'], borderDash: [4, 4] },
                ticks: { color: colors['neutral-600'], callback: (value: any) => '$' + value / 1000 + 'k' }
              },
              yMargin: {
                type: 'linear',
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: colors['neutral-600'], callback: (value: any) => value + '%' }
              }
            }
          }
        });
        chartInstances.current.push(chart);
      }
    }
  }, [activeTab]);

  if (activeTab === 'overview') {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
        {/* Header from Design */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-neutral-200 dark:border-neutral-600/50 bg-white dark:bg-neutral-800 px-8 py-3 sticky top-0 z-10">
          <div className="flex flex-1 items-center gap-8">
            <label className="flex flex-col !h-10 max-w-md w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-neutral-600 dark:text-neutral-200 flex bg-neutral-100 dark:bg-neutral-600/30 items-center justify-center pl-3 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input 
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-neutral-800 dark:text-white focus:outline-none border-none bg-neutral-100 dark:bg-neutral-600/30 h-full placeholder:text-neutral-600 dark:placeholder:text-neutral-200 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" 
                  placeholder={t('admin.overview.searchPlaceholder')} 
                />
              </div>
            </label>
          </div>
          <div className="flex flex-initial justify-end gap-4 items-center">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-600/30 text-neutral-800 dark:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZdY1np0K0nYpFYxH6huL8l275ppgN8ImHZQIKoc_Q-Gdt8dvGPDTQXs8Sk1_ZeFL04mGg4gzpQP7w3FJGacZ5qaLtQTIw-n4NXot4cb2mner5tdkhl8wHkrR9IpwPWfQL3jRJU3ecz7UwaKbIYbClwI7Q9mG-jNP_Pfj6fPNqIVANhovGgiIDHnnQipZagPuBsEzWwwiBqYaaiyNYMQZpf_Vs3qKXz8AQIhJCYWX5mGuarxkURrH08bJmV1408KQzNVE40LzqWDdX")' }}
            ></div>
          </div>
        </header>

        <div className="flex-1 p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <p className="text-neutral-800 dark:text-white text-3xl font-bold leading-tight tracking-tight min-w-72">{t('admin.overview.title')}</p>
              <div className="flex gap-2">
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-neutral-800 dark:border dark:border-neutral-600/50 pl-3 pr-2 shadow-sm hover:bg-neutral-50">
                  <p className="text-neutral-800 dark:text-white text-sm font-medium leading-normal">{t('admin.overview.last30Days')}</p>
                  <span className="material-symbols-outlined text-neutral-800 dark:text-white text-base">expand_more</span>
                </button>
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-neutral-800 dark:border dark:border-neutral-600/50 pl-3 pr-2 shadow-sm hover:bg-neutral-50">
                  <p className="text-neutral-800 dark:text-white text-sm font-medium leading-normal">{t('admin.overview.customRange')}</p>
                  <span className="material-symbols-outlined text-neutral-800 dark:text-white text-base">expand_more</span>
                </button>
              </div>
            </div>

            {/* KPI Cards with Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sales */}
              <div className="flex flex-col justify-between gap-4 rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600/50">
                <div className="flex flex-col gap-2">
                  <p className="text-neutral-600 dark:text-neutral-200 text-sm font-medium leading-normal">{t('admin.overview.totalSales')}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-neutral-800 dark:text-white tracking-tight text-3xl font-bold leading-tight">$1,284,567</p>
                    <p className="text-positive dark:text-positive text-sm font-medium leading-normal flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">arrow_upward</span>
                      <span>+5.2%</span>
                    </p>
                  </div>
                </div>
                <div className="h-24 -mx-6 -mb-6"><canvas ref={salesChartRef}></canvas></div>
              </div>

              {/* Margin */}
              <div className="flex flex-col justify-between gap-4 rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600/50">
                <div className="flex flex-col gap-2">
                  <p className="text-neutral-600 dark:text-neutral-200 text-sm font-medium leading-normal">{t('admin.overview.averageMargin')}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-neutral-800 dark:text-white tracking-tight text-3xl font-bold leading-tight">18.4%</p>
                    <p className="text-negative dark:text-negative text-sm font-medium leading-normal flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">arrow_downward</span>
                      <span>-0.8%</span>
                    </p>
                  </div>
                </div>
                <div className="h-24 -mx-6 -mb-6"><canvas ref={marginChartRef}></canvas></div>
              </div>

              {/* Orders */}
              <div className="flex flex-col justify-between gap-4 rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600/50">
                <div className="flex flex-col gap-2">
                  <p className="text-neutral-600 dark:text-neutral-200 text-sm font-medium leading-normal">{t('admin.overview.totalOrders')}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-neutral-800 dark:text-white tracking-tight text-3xl font-bold leading-tight">3,456</p>
                    <p className="text-positive dark:text-positive text-sm font-medium leading-normal flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">arrow_upward</span>
                      <span>+12.1%</span>
                    </p>
                  </div>
                </div>
                <div className="h-24 -mx-6 -mb-6"><canvas ref={ordersChartRef}></canvas></div>
              </div>
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Breakdown */}
              <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600/50">
                <div className="flex justify-between items-center">
                  <h3 className="text-neutral-800 dark:text-white text-lg font-bold">{t('admin.overview.revenueBreakdown')}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-chart-blue"></div>
                      <span className="text-neutral-600 dark:text-neutral-200">{t('admin.overview.sales')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-chart-green"></div>
                      <span className="text-neutral-600 dark:text-neutral-200">{t('admin.overview.margin')}</span>
                    </div>
                  </div>
                </div>
                <div className="h-80"><canvas ref={revenueChartRef}></canvas></div>
              </div>

              {/* Pending Actions */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600/50">
                <h3 className="text-neutral-800 dark:text-white text-lg font-bold">{t('admin.overview.pendingActions')}</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { type: t('admin.overview.newSupplier'), desc: `ABC Corp ${t('admin.overview.awaitsVerification')}` },
                    { type: t('admin.overview.productApproval'), desc: `SKU-123 ${t('admin.overview.needsApproval')}` },
                    { type: t('admin.overview.newSupplier'), desc: `Innovate Inc. ${t('admin.overview.verification')}` },
                    { type: t('admin.overview.newClient'), desc: `Tech Solutions LLC ${t('admin.overview.onboard')}` },
                  ].map((action, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-600/20 transition-colors">
                      <div className="flex flex-col">
                        <p className="text-xs text-neutral-600 dark:text-neutral-200">{action.type}</p>
                        <p className="text-sm font-medium text-neutral-800 dark:text-white">{action.desc}</p>
                      </div>
                      <a className="text-primary text-sm font-bold hover:underline" href="#">{t('admin.overview.view')}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600/50 overflow-hidden">
              <h3 className="text-neutral-800 dark:text-white text-lg font-bold p-6 pb-2">{t('admin.overview.recentOrders')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-neutral-600 dark:text-neutral-200 uppercase bg-neutral-100/50 dark:bg-neutral-600/20">
                    <tr>
                      <th className="px-6 py-3" scope="col">{t('admin.overview.orderId')}</th>
                      <th className="px-6 py-3" scope="col">{t('admin.overview.client')}</th>
                      <th className="px-6 py-3" scope="col">{t('common.status')}</th>
                      <th className="px-6 py-3" scope="col">{t('admin.overview.value')}</th>
                      <th className="px-6 py-3" scope="col">{t('admin.overview.date')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-800 dark:text-white">
                    {[
                      { id: '#ORD-00876', client: 'Quantum Industries', statusKey: 'shipped', color: 'green', value: '$12,450.00', date: '2023-10-26' },
                      { id: '#ORD-00875', client: 'Apex Solutions', statusKey: 'processing', color: 'yellow', value: '$8,200.50', date: '2023-10-26' },
                      { id: '#ORD-00874', client: 'Pioneer Logistics', statusKey: 'delivered', color: 'blue', value: '$25,000.00', date: '2023-10-25' },
                      { id: '#ORD-00873', client: 'Starlight Corp', statusKey: 'cancelled', color: 'red', value: '$5,600.00', date: '2023-10-25' },
                      { id: '#ORD-00872', client: 'Nexus Enterprises', statusKey: 'delivered', color: 'blue', value: '$18,990.00', date: '2023-10-24' },
                    ].map((order, i) => (
                      <tr key={i} className="border-b last:border-0 dark:border-neutral-600/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{order.id}</td>
                        <td className="px-6 py-4">{order.client}</td>
                        <td className="px-6 py-4">
                          <span className={`bg-${order.color}-100 dark:bg-${order.color}-900/50 text-${order.color}-800 dark:text-${order.color}-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full`}>
                            {t(`admin.overview.${order.statusKey}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4">{order.value}</td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-200">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'approvals') {
    const pendingProducts = PRODUCTS.filter(p => p.status === 'PENDING');
    
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
         {/* Header */}
         <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 bg-white px-8 py-3 dark:border-b-gray-700 dark:bg-background-dark sticky top-0 z-10">
            <div className="flex items-center gap-8">
            <label className="flex w-full min-w-40 max-w-64 flex-col !h-10">
            <div className="flex h-full w-full flex-1 items-stretch rounded-lg">
            <div className="flex items-center justify-center rounded-l-lg border-r-0 bg-background-light pl-4 text-[#616f89] dark:bg-gray-700">
            <span className="material-symbols-outlined text-xl"> search </span>
            </div>
            <input className="form-input flex h-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-l-0 border-none bg-background-light px-4 pl-2 text-base font-normal leading-normal text-[#111318] placeholder:text-[#616f89] focus:outline-0 focus:ring-0 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" placeholder={t('common.search')} value=""/>
            </div>
            </label>
            </div>
            <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex gap-2">
            <button className="flex h-10 min-w-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-transparent px-2.5 text-sm font-bold leading-normal tracking-[0.015em] text-[#111318] hover:bg-gray-100 dark:text-white dark:hover:bg-primary/20">
            <span className="material-symbols-outlined text-2xl text-gray-600 dark:text-gray-300"> notifications </span>
            </button>
            <button className="flex h-10 min-w-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-transparent px-2.5 text-sm font-bold leading-normal tracking-[0.015em] text-[#111318] hover:bg-gray-100 dark:text-white dark:hover:bg-primary/20">
            <span className="material-symbols-outlined text-2xl text-gray-600 dark:text-gray-300"> help </span>
            </button>
            </div>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" data-alt="User avatar" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZdY1np0K0nYpFYxH6huL8l275ppgN8ImHZQIKoc_Q-Gdt8dvGPDTQXs8Sk1_ZeFL04mGg4gzpQP7w3FJGacZ5qaLtQTIw-n4NXot4cb2mner5tdkhl8wHkrR9IpwPWfQL3jRJU3ecz7UwaKbIYbClwI7Q9mG-jNP_Pfj6fPNqIVANhovGgiIDHnnQipZagPuBsEzWwwiBqYaaiyNYMQZpf_Vs3qKXz8AQIhJCYWX5mGuarxkURrH08bJmV1408KQzNVE40LzqWDdX")'}}></div>
            </div>
         </header>

         <main className="flex-1 p-8">
            <div className="mx-auto max-w-7xl">
               {/* PageHeading */}
               <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-72 flex-col gap-2">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#111318] dark:text-white">{t('admin.approvals.productApprovalQueue')}</h1>
                  <p className="text-base font-normal leading-normal text-[#616f89] dark:text-gray-400">{pendingProducts.length} {t('admin.approvals.itemsAwaitingReview')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                  <button className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-x-2 overflow-hidden rounded-lg bg-white px-4 text-sm font-medium leading-normal text-red-600 ring-1 ring-inset ring-red-300 hover:bg-red-50 dark:bg-transparent dark:text-red-500 dark:ring-red-500 dark:hover:bg-red-500/10">{t('admin.approvals.rejectSelected')}</button>
                  <button className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-x-2 overflow-hidden rounded-lg bg-[#135bec] px-4 text-sm font-medium leading-normal text-white hover:bg-[#135bec]/90">{t('admin.approvals.approveSelected')}</button>
                  </div>
               </div>

               {/* Chips/Filters */}
               <div className="mt-6 flex flex-wrap gap-3 border-b border-b-gray-200 pb-4 dark:border-b-gray-700">
                  <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white pl-4 pr-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-600 dark:hover:bg-gray-700">
                  <p className="text-sm font-medium leading-normal text-[#111318] dark:text-white">{t('admin.approvals.supplier')}</p>
                  <span className="material-symbols-outlined text-lg text-[#111318] dark:text-white"> expand_more </span>
                  </button>
                  <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white pl-4 pr-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-600 dark:hover:bg-gray-700">
                  <p className="text-sm font-medium leading-normal text-[#111318] dark:text-white">{t('admin.approvals.category')}</p>
                  <span className="material-symbols-outlined text-lg text-[#111318] dark:text-white"> expand_more </span>
                  </button>
                  <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white pl-4 pr-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-600 dark:hover:bg-gray-700">
                  <p className="text-sm font-medium leading-normal text-[#111318] dark:text-white">{t('admin.approvals.dateSubmitted')}</p>
                  <span className="material-symbols-outlined text-lg text-[#111318] dark:text-white"> expand_more </span>
                  </button>
               </div>

               {/* Table */}
               <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-background-dark">
                  <table className="min-w-full flex-1">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="w-12 px-6 py-3">
                  <input className="h-4 w-4 rounded border-gray-300 text-[#135bec] focus:ring-[#135bec] dark:border-gray-600 dark:bg-gray-700" type="checkbox"/>
                  </th>
                  <th className="px-6 py-3">{t('admin.approvals.product')}</th>
                  <th className="px-6 py-3">{t('admin.approvals.supplier')}</th>
                  <th className="px-6 py-3">{t('admin.approvals.costPrice')}</th>
                  <th className="px-6 py-3">{t('admin.approvals.submitted')}</th>
                  <th className="relative px-6 py-3"><span className="sr-only">{t('common.actions')}</span></th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                     {pendingProducts.map(product => {
                        const supplier = USERS.find(u => u.id === product.supplierId);
                        // Mock date based on index to show some variance like in design
                        const dates = ['2023-10-26', '2023-10-26', '2023-10-25', '2023-10-24'];
                        const displayDate = dates[pendingProducts.indexOf(product) % dates.length];

                        return (
                           <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="whitespace-nowrap px-6 py-4">
                              <input className="h-4 w-4 rounded border-gray-300 text-[#135bec] focus:ring-[#135bec] dark:border-gray-600 dark:bg-gray-700" type="checkbox"/>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-4">
                              <div className="h-10 w-10 flex-shrink-0">
                              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-10" style={{backgroundImage: `url("${product.image}")`}}></div>
                              </div>
                              <div>
                              <div className="text-sm font-medium text-[#111318] dark:text-white">{product.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku || 'N/A'}</div>
                              </div>
                              </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{supplier?.companyName || t('admin.approvals.unknownSupplier')}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">${product.costPrice?.toFixed(2)}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{displayDate}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                              <button className="flex h-8 items-center justify-center gap-1 rounded-md bg-yellow-100 px-3 text-xs font-semibold text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:hover:bg-yellow-500/30 transition-colors">{t('admin.approvals.info')}</button>
                              <button className="flex h-8 items-center justify-center gap-1 rounded-md bg-red-100 px-3 text-xs font-semibold text-red-800 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors">{t('admin.approvals.reject')}</button>
                              <button className="flex h-8 items-center justify-center gap-1 rounded-md bg-green-100 px-3 text-xs font-semibold text-green-800 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30 transition-colors">{t('admin.approvals.approve')}</button>
                              </div>
                              </td>
                           </tr>
                        );
                     })}
                     
                     {pendingProducts.length === 0 && (
                        <tr>
                           <td colSpan={6} className="py-20 text-center">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <span className="material-symbols-outlined text-gray-300 text-3xl">check_circle</span>
                              </div>
                              <p className="text-gray-500 font-medium">{t('admin.approvals.allCaughtUp')}</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
                  </table>
               </div>
            </div>
         </main>
      </div>
    );
  }

  if (activeTab === 'margins') {
    const categories = Object.keys(categoryMargins);
    
    return (
      <div className="space-y-8 p-8">
        
        {/* New Margin Configuration Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
           <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
             <span className="material-symbols-outlined text-blue-600">settings_applications</span>
             {t('admin.margins.globalMarginConfig')}
           </h2>
           <div className="grid lg:grid-cols-3 gap-12">
              
              {/* Universal Margin */}
              <div className="lg:col-span-1 space-y-4 border-r border-slate-100 pr-8">
                 <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t('admin.margins.universalMargin')}</h3>
                 <p className="text-sm text-slate-400 mb-4">{t('admin.margins.universalMarginDesc')}</p>
                 <div className="flex items-center gap-4">
                    <div className="relative w-full">
                       <input 
                         type="number" 
                         value={globalMargin}
                         onChange={(e) => setGlobalMargin(Number(e.target.value))}
                         className="w-full pl-4 pr-12 py-4 text-3xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">%</span>
                    </div>
                 </div>
              </div>

              {/* Category Margins */}
              <div className="lg:col-span-2 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t('admin.margins.categoryMargins')}</h3>
                    <button className="text-xs font-bold text-blue-600 hover:underline">{t('admin.margins.addCategory')}</button>
                 </div>
                 <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map(cat => (
                       <div key={cat} className="flex flex-col gap-1 p-3 rounded-xl border border-slate-200 bg-white">
                          <label className="text-xs font-bold text-slate-500 uppercase">{cat}</label>
                          <div className="flex items-center gap-2">
                             <input 
                               type="number" 
                               value={categoryMargins[cat]}
                               onChange={(e) => handleCategoryMarginChange(cat, Number(e.target.value))}
                               className="w-full bg-transparent font-bold text-lg text-slate-800 outline-none border-b border-dashed border-slate-300 focus:border-blue-500"
                             />
                             <span className="text-sm font-bold text-slate-400">%</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-end">
            <div>
               <h2 className="text-2xl font-bold text-slate-900">{t('admin.margins.quoteManager')}</h2>
               <p className="text-slate-500 mt-1">{t('admin.margins.quoteManagerDesc')}</p>
            </div>
        </div>
        
        <div className="space-y-6">
          {QUOTES.map(quote => {
             const { value: currentMargin, source, type } = getEffectiveMarginData(quote);
             const calculatedPrice = quote.supplierPrice * (1 + currentMargin / 100);
             const profit = calculatedPrice - quote.supplierPrice;
             const category = getQuoteCategory(quote);
             
             return (
            <div key={quote.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-all ${type === 'manual' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'}`}>
              <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900">Quote #{quote.id}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-sm text-slate-500">Ref: RFQ #{quote.rfqId.toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-xs font-bold">{category}</span>
                  </div>
                  <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          quote.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                          {quote.status.replace(/_/g, ' ')}
                      </span>
                  </div>
              </div>
              
              <div className="p-8 grid lg:grid-cols-3 gap-8 items-center">
                  {/* Parties */}
                  <div className="space-y-4 lg:border-r lg:border-slate-100 lg:pr-8">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">S</div>
                              <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase">From Supplier</p>
                                  <p className="text-sm font-bold text-slate-900">Global Parts Inc</p>
                              </div>
                          </div>
                      </div>
                       <div className="flex items-center justify-center">
                           <span className="material-symbols-outlined text-slate-300">arrow_downward</span>
                       </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">C</div>
                              <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase">To Client</p>
                                  <p className="text-sm font-bold text-slate-900">Tech Solutions Ltd</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Calculation */}
                  <div className="col-span-2 flex flex-col md:flex-row items-center gap-6 justify-between">
                      
                      <div className="text-center p-4">
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Cost Price</p>
                          <p className="text-2xl font-mono font-bold text-slate-700">${quote.supplierPrice.toLocaleString()}</p>
                          <p className="text-xs text-slate-400 mt-1">Lead: {quote.leadTime}</p>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                              <button 
                                onClick={() => handleManualMarginChange(quote.id, Math.max(0, currentMargin - 1))}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-blue-600"
                              >-</button>
                              <div className="text-center w-24">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Margin</p>
                                  <p className={`text-xl font-bold ${type === 'manual' ? 'text-blue-600' : 'text-slate-700'}`}>{currentMargin}%</p>
                              </div>
                              <button 
                                onClick={() => handleManualMarginChange(quote.id, currentMargin + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-blue-600"
                              >+</button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                type === 'manual' ? 'bg-blue-100 text-blue-700' : 
                                type === 'category' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {source}
                            </span>
                            {type === 'manual' && (
                                <button 
                                    onClick={() => resetQuoteMargin(quote.id)} 
                                    className="text-[10px] text-slate-400 hover:text-red-500 underline"
                                    title="Reset to default"
                                >
                                    Reset
                                </button>
                            )}
                          </div>
                      </div>

                      <div className="text-center bg-emerald-50 p-6 rounded-2xl border border-emerald-100 min-w-[180px]">
                          <p className="text-xs font-bold text-emerald-600/70 uppercase mb-2">Final Client Price</p>
                          <p className="text-3xl font-mono font-bold text-emerald-700">${calculatedPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                          <p className="text-xs font-bold text-emerald-600 mt-2">+ ${profit.toLocaleString(undefined, {maximumFractionDigits: 0})} Profit</p>
                      </div>
                      
                      <button className="w-12 h-12 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined">send</span>
                      </button>
                  </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    );
  }

  // Unified Users Management View (Supports Suppliers and Clients)
  if (activeTab === 'users') {
    // -- SUPPLIER LOGIC --
    const supplierUsers = USERS.filter(u => u.role === UserRole.SUPPLIER && u.status);
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success"><span className="size-1.5 rounded-full bg-success"></span>{t('status.approved')}</span>;
            case 'PENDING':
                return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning"><span className="size-1.5 rounded-full bg-warning"></span>{t('admin.users.pendingApproval')}</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-danger/10 text-danger"><span className="size-1.5 rounded-full bg-danger"></span>{t('status.rejected')}</span>;
            case 'REQUIRES_ATTENTION':
                return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"><span className="size-1.5 rounded-full bg-yellow-500"></span>{t('admin.users.requiresAttention')}</span>;
            default:
                return null;
        }
    };
    const getKycBadge = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success"><span className="size-1.5 rounded-full bg-success"></span>{t('admin.users.verified')}</span>;
            case 'IN_REVIEW':
                return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning"><span className="size-1.5 rounded-full bg-warning"></span>{t('admin.users.inReview')}</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-danger/10 text-danger"><span className="size-1.5 rounded-full bg-danger"></span>{t('status.rejected')}</span>;
            case 'INCOMPLETE':
                 return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"><span className="size-1.5 rounded-full bg-yellow-500"></span>{t('admin.users.incomplete')}</span>;
            default:
                return null;
        }
    };

    // -- CLIENT LOGIC --
    const clientUsers = USERS.filter(u => u.role === UserRole.CLIENT && u.status);
    const getClientStatusBadge = (status: string) => {
       switch (status) {
          case 'ACTIVE':
             return (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/50 px-2.5 py-1 text-xs font-medium text-green-800 dark:text-green-300">
                   <span className="size-2 rounded-full bg-green-500"></span>{t('admin.users.active')}
                </div>
             );
          case 'PENDING':
             return (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/50 px-2.5 py-1 text-xs font-medium text-orange-800 dark:text-orange-300">
                   <span className="size-2 rounded-full bg-orange-500"></span>{t('status.pending')}
                </div>
             );
          case 'DEACTIVATED':
             return (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/50 px-2.5 py-1 text-xs font-medium text-red-800 dark:text-red-300">
                   <span className="size-2 rounded-full bg-red-500"></span>{t('admin.users.deactivated')}
                </div>
             );
          default: return null;
       }
    };

    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
        {/* Shared Header */}
        <header className="flex sticky top-0 z-10 items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm px-8 py-3">
          <div className="flex-1"></div>
          <div className="flex flex-1 justify-end items-center gap-4">
            <label className="flex flex-col min-w-40 !h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-[#616f89] dark:text-gray-400 flex bg-gray-100 dark:bg-gray-800 items-center justify-center pl-3 rounded-l-lg">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input 
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-800 dark:text-gray-200 focus:outline-0 focus:ring-0 border-none bg-gray-100 dark:bg-gray-800 h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 pl-2 text-sm" 
                  placeholder={t('admin.users.globalSearch')} 
                />
              </div>
            </label>
            <div className="flex gap-2">
              <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
            </div>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAJ7fHXw9w99tcCAF8HBhK1huQwUZ07R3_NvN5poow1YURUP0c5X3bRBhYLgHdzwmD0eMnEbhAqhMCnsWTT3-aXbUpmz44qLvn0sxbOm361wtpRiXSz67tLD3GhhdoZhSMW6lNSPjOGM4x1JofOq6VDhXJNHUR-ZHANS80HMBtNctQItZsn_ND2ix5MmY19C4QZ9OPSOvmv8TepWM7dsS25O7YBr-3_o2_L-khhnsssZOYeBz-HJDP0yyjlWqAyMyM7rV6zKaHaBPBz")' }}></div>
          </div>
        </header>

        <main className="flex-1 p-8">
          
          {/* Top Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 inline-flex shadow-sm">
                <button 
                  onClick={() => setUserViewMode('suppliers')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${userViewMode === 'suppliers' ? 'bg-[#135bec] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <span className="material-symbols-outlined text-lg">storefront</span>
                  {t('admin.users.suppliers')}
                </button>
                <button 
                   onClick={() => setUserViewMode('clients')}
                   className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${userViewMode === 'clients' ? 'bg-[#135bec] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>group</span>
                  {t('admin.users.clients')}
                </button>
            </div>
          </div>

          {/* --- SUPPLIER VIEW --- */}
          {userViewMode === 'suppliers' && (
             <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* PageHeading */}
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <p className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">{t('admin.users.supplierManagement')}</p>
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold">
                    <span className="material-symbols-outlined mr-2 text-lg">add</span>
                    <span>{t('admin.users.addSupplier')}</span>
                    </button>
                </div>

                {/* ToolBar */}
                <div className="flex justify-between items-center gap-2 p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex gap-2 items-center">
                    <label className="flex flex-col min-w-40 !h-10 max-w-64">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                        <div className="text-[#616f89] dark:text-gray-400 flex bg-gray-100 dark:bg-gray-800 items-center justify-center pl-3 rounded-l-lg">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input 
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-800 dark:text-gray-200 focus:outline-0 focus:ring-0 border-none bg-gray-100 dark:bg-gray-800 h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 pl-2 text-sm" 
                            placeholder={t('admin.users.searchSuppliers')} 
                        />
                        </div>
                    </label>
                    <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
                        <span className="material-symbols-outlined text-xl">filter_list</span>
                        <span>{t('admin.users.filter')}</span>
                    </button>
                    </div>
                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 gap-2 text-sm font-bold min-w-0 px-4">
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span className="truncate">{t('admin.users.export')}</span>
                    </button>
                </div>

                {/* Table */}
                <div className="mt-2 @container">
                    <div className="flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-800">
                        <tr className="bg-gray-50 dark:bg-gray-900">
                            <th className="px-4 py-3 w-12 text-center">
                            <input className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-primary/50" type="checkbox"/>
                            </th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{t('admin.users.supplierName')}</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{t('admin.users.status')}</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{t('admin.users.kycStatus')}</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{t('admin.users.dateJoined')}</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{t('admin.users.actions')}</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {supplierUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-4 py-2 w-12 text-center">
                                    <input className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-primary/50" type="checkbox"/>
                                </td>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{user.companyName}</td>
                                <td className="px-4 py-2 text-sm">
                                    {getStatusBadge(user.status || 'PENDING')}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    {getKycBadge(user.kycStatus || 'INCOMPLETE')}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{user.dateJoined}</td>
                                <td className="px-4 py-2 text-sm font-medium text-primary cursor-pointer hover:underline">{t('admin.users.review')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
             </div>
          )}

          {/* --- CLIENT VIEW --- */}
          {userViewMode === 'clients' && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               {/* PageHeading */}
               <div className="flex flex-wrap items-center justify-between gap-3">
                 <p className="text-text-light dark:text-text-dark text-3xl font-black tracking-tight">{t('admin.users.clientManagement')}</p>
                 <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                   <span className="material-symbols-outlined !text-xl">add</span>
                   <span className="truncate">{t('admin.users.addClient')}</span>
                 </button>
               </div>

               {/* Toolbar / Action Bar */}
               <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-content-light dark:bg-content-dark p-4">
                 <div className="flex items-center gap-2 flex-1 min-w-64">
                   <label className="flex flex-col w-full">
                     <div className="flex w-full flex-1 items-stretch rounded-lg h-10">
                       <div className="text-subtext-light dark:text-subtext-dark flex border-none bg-background-light dark:bg-background-dark items-center justify-center pl-3.5 rounded-l-lg border-r-0">
                         <span className="material-symbols-outlined !text-xl">search</span>
                       </div>
                       <input 
                         className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-background-light dark:bg-background-dark h-full placeholder:text-subtext-light dark:placeholder:text-subtext-dark px-4 rounded-l-none border-l-0 pl-2 text-sm" 
                         placeholder={t('admin.users.searchClients')} 
                       />
                     </div>
                   </label>
                 </div>
                 <div className="flex items-center gap-2">
                   <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-transparent text-subtext-light dark:text-subtext-dark text-sm font-medium border border-border-light dark:border-border-dark hover:bg-primary/10">
                     <span className="truncate">Status: All</span>
                     <span className="material-symbols-outlined !text-xl">expand_more</span>
                   </button>
                   <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-transparent text-subtext-light dark:text-subtext-dark text-sm font-medium border border-border-light dark:border-border-dark hover:bg-primary/10">
                     <span className="material-symbols-outlined !text-xl">calendar_today</span>
                     <span className="truncate">Date Range</span>
                   </button>
                   <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-transparent text-subtext-light dark:text-subtext-dark text-sm font-medium border border-border-light dark:border-border-dark hover:bg-primary/10 opacity-50 cursor-not-allowed">
                     <span className="truncate">Bulk Actions</span>
                     <span className="material-symbols-outlined !text-xl">expand_more</span>
                   </button>
                 </div>
               </div>

               {/* Table */}
               <div className="overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-content-light dark:bg-content-dark">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark/50">
                       <tr>
                         <th className="px-4 py-3 text-center w-12">
                           <input className="h-5 w-5 rounded border-2 border-border-light dark:border-border-dark bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0" type="checkbox"/>
                         </th>
                         <th className="px-4 py-3 text-sm font-medium text-subtext-light dark:text-subtext-dark">{t('admin.users.clients')}</th>
                         <th className="px-4 py-3 text-sm font-medium text-subtext-light dark:text-subtext-dark">{t('admin.users.company')}</th>
                         <th className="px-4 py-3 text-sm font-medium text-subtext-light dark:text-subtext-dark">{t('admin.users.email')}</th>
                         <th className="px-4 py-3 text-sm font-medium text-subtext-light dark:text-subtext-dark">{t('admin.users.status')}</th>
                         <th className="px-4 py-3 text-sm font-medium text-subtext-light dark:text-subtext-dark">{t('admin.users.dateJoined')}</th>
                         <th className="px-4 py-3 text-sm font-medium text-subtext-light dark:text-subtext-dark text-right">{t('admin.users.actions')}</th>
                       </tr>
                     </thead>
                     <tbody className="text-text-light dark:text-text-dark">
                        {clientUsers.map(client => (
                          <tr key={client.id} className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="h-[72px] px-4 py-2 text-center w-12">
                              <input className="h-5 w-5 rounded border-2 border-border-light dark:border-border-dark bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0" type="checkbox"/>
                            </td>
                            <td className="h-[72px] px-4 py-2 text-sm font-medium">{client.name}</td>
                            <td className="h-[72px] px-4 py-2 text-sm text-subtext-light dark:text-subtext-dark">{client.companyName}</td>
                            <td className="h-[72px] px-4 py-2 text-sm text-subtext-light dark:text-subtext-dark">{client.email}</td>
                            <td className="h-[72px] px-4 py-2 text-sm">
                               {getClientStatusBadge(client.status || 'PENDING')}
                            </td>
                            <td className="h-[72px] px-4 py-2 text-sm text-subtext-light dark:text-subtext-dark">{client.dateJoined}</td>
                            <td className="h-[72px] px-4 py-2 text-right">
                              <button className="p-2 text-subtext-light dark:text-subtext-dark rounded-full hover:bg-primary/10 hover:text-primary transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
                 
                 {/* Pagination */}
                 <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-border-light dark:border-border-dark">
                   <p className="text-sm text-subtext-light dark:text-subtext-dark">{t('admin.users.showingResults', { count: clientUsers.length, total: clientUsers.length })}</p>
                   <div className="flex items-center gap-2">
                     <button className="flex items-center justify-center rounded-lg size-9 border border-border-light dark:border-border-dark text-subtext-light dark:text-subtext-dark hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                       <span className="material-symbols-outlined !text-xl">chevron_left</span>
                     </button>
                     <button className="flex items-center justify-center rounded-lg size-9 border border-primary bg-primary/20 text-primary font-bold">1</button>
                     <button className="flex items-center justify-center rounded-lg size-9 border border-border-light dark:border-border-dark text-subtext-light dark:text-subtext-dark hover:bg-primary/10 hover:text-primary">
                       <span className="material-symbols-outlined !text-xl">chevron_right</span>
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- LOGISTICS VIEW ---
  if (activeTab === 'logistics') {
    const shipments = [
      { id: 'SH-001', order: 'ORD-78952', supplier: 'Supplier Alpha', client: 'Client-A8B4', status: 'In Transit', eta: 'Jan 25, 2024', location: 'Distribution Center - NYC' },
      { id: 'SH-002', order: 'ORD-78951', supplier: 'Supplier Beta', client: 'Client-C2D9', status: 'Delivered', eta: 'Jan 20, 2024', location: 'Delivered' },
      { id: 'SH-003', order: 'ORD-78950', supplier: 'Supplier Gamma', client: 'Client-F5E1', status: 'Preparing', eta: 'Jan 28, 2024', location: 'Warehouse - LA' },
      { id: 'SH-004', order: 'ORD-78949', supplier: 'Supplier Delta', client: 'Client-B3F7', status: 'In Transit', eta: 'Jan 26, 2024', location: 'In Transit - Route 66' },
    ];

    return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-background-dark p-8 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{t('logistics.title')}</h2>
            <p className="text-subtext-light dark:text-subtext-dark mt-1">{t('logistics.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-subtext-light dark:text-subtext-dark bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-base mr-2 inline-block align-middle">download</span>
              {t('logistics.export')}
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-base mr-2 inline-block align-middle">add</span>
              {t('logistics.newShipment')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subtext-light dark:text-subtext-dark">{t('logistics.inTransit')}</p>
                <p className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mt-2">24</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">local_shipping</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subtext-light dark:text-subtext-dark">{t('logistics.deliveredToday')}</p>
                <p className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mt-2">12</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">check_circle</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subtext-light dark:text-subtext-dark">{t('logistics.preparing')}</p>
                <p className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mt-2">8</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">package</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subtext-light dark:text-subtext-dark">{t('logistics.delayed')}</p>
                <p className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mt-2">3</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">warning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border-light dark:border-border-dark">
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{t('logistics.activeShipments')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                <tr>
                  <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark uppercase text-xs tracking-wider">{t('logistics.shipmentId')}</th>
                  <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark uppercase text-xs tracking-wider">{t('logistics.orderId')}</th>
                  <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark uppercase text-xs tracking-wider">{t('logistics.route')}</th>
                  <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark uppercase text-xs tracking-wider">{t('logistics.status')}</th>
                  <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark uppercase text-xs tracking-wider">{t('logistics.eta')}</th>
                  <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark uppercase text-xs tracking-wider">{t('logistics.location')}</th>
                  <th className="px-6 py-4 font-semibold text-subtext-light dark:text-subtext-dark uppercase text-xs tracking-wider text-right">{t('logistics.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {shipments.map(shipment => (
                  <tr key={shipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{shipment.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-subtext-light dark:text-subtext-dark">{shipment.order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{shipment.supplier}</span>
                        <span className="text-xs text-subtext-light dark:text-subtext-dark">→ {shipment.client}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        shipment.status === 'In Transit' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                        shipment.status === 'Delivered' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                        'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          shipment.status === 'In Transit' ? 'bg-blue-500' :
                          shipment.status === 'Delivered' ? 'bg-green-500' :
                          'bg-amber-500'
                        }`}></span>
                        {shipment.status === 'In Transit' ? t('status.inTransit') : 
                         shipment.status === 'Delivered' ? t('status.delivered') : 
                         t('status.preparing')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-subtext-light dark:text-subtext-dark">{shipment.eta}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-subtext-light dark:text-subtext-dark">{shipment.location}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary text-sm font-bold hover:underline">
                        {t('logistics.track')}
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

  return (
    <div className="p-8 md:p-12 flex items-center justify-center h-96 flex-col text-center rounded-2xl">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
         <span className="material-symbols-outlined text-4xl text-slate-300">construction</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900">{t('comingSoon.title')}</h3>
      <p className="text-slate-500 max-w-md mt-2 leading-relaxed">{t('comingSoon.description')}</p>
    </div>
  );
};