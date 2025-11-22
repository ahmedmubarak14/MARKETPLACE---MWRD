/**
 * Utility functions for exporting data to various formats
 */

/**
 * Convert array of objects to CSV string
 */
export const arrayToCSV = <T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string => {
  if (data.length === 0) return '';

  // Create header row
  const headers = columns.map(col => `"${col.header}"`).join(',');

  // Create data rows
  const rows = data.map(item =>
    columns
      .map(col => {
        const value = item[col.key];
        // Handle different types
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (typeof value === 'number') return value.toString();
        if (value instanceof Date) return `"${value.toISOString()}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
};

/**
 * Download a string as a file
 */
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data to CSV and trigger download
 */
export const exportToCSV = <T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[],
  filename: string
): void => {
  const csv = arrayToCSV(data, columns);
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Generate a simple text-based invoice
 */
export const generateInvoice = (order: {
  id: string;
  date: string;
  status: string;
  amount: number;
  items?: { name: string; quantity: number; price: number }[];
  billingAddress?: { name: string; address: string; city: string };
}): string => {
  const lines = [
    '═══════════════════════════════════════════════════════════════',
    '                           INVOICE                              ',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Invoice Number: ${order.id}`,
    `Date: ${order.date}`,
    `Status: ${order.status}`,
    '',
    '───────────────────────────────────────────────────────────────',
    'ITEMS',
    '───────────────────────────────────────────────────────────────',
  ];

  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      lines.push(`${item.name}`);
      lines.push(`  Qty: ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`);
    });
  } else {
    lines.push('Order items details not available');
  }

  lines.push('');
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push(`TOTAL: $${order.amount.toFixed(2)}`);
  lines.push('───────────────────────────────────────────────────────────────');

  if (order.billingAddress) {
    lines.push('');
    lines.push('BILLING ADDRESS:');
    lines.push(order.billingAddress.name);
    lines.push(order.billingAddress.address);
    lines.push(order.billingAddress.city);
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('Thank you for your business!');
  lines.push('mwrd B2B Marketplace');
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
};

/**
 * Download invoice as text file
 */
export const downloadInvoice = (order: {
  id: string;
  date: string;
  status: string;
  amount: number;
  items?: { name: string; quantity: number; price: number }[];
  billingAddress?: { name: string; address: string; city: string };
}): void => {
  const invoice = generateInvoice(order);
  downloadFile(invoice, `invoice-${order.id}.txt`, 'text/plain;charset=utf-8;');
};
