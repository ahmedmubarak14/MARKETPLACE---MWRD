/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

// HTML entities for escaping
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export const escapeHtml = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
};

/**
 * Remove HTML tags from string
 */
export const stripHtml = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Sanitize string for safe display - removes HTML and trims whitespace
 */
export const sanitizeText = (str: string): string => {
  if (typeof str !== 'string') return '';
  return stripHtml(str).trim();
};

/**
 * Sanitize string for use in URLs
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '';

  // Only allow http, https, and relative URLs
  const trimmed = url.trim();
  if (trimmed.startsWith('javascript:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('vbscript:')) {
    return '';
  }

  try {
    // If it's a valid URL, return it
    new URL(trimmed);
    return trimmed;
  } catch {
    // If it's a relative URL, allow it
    if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
      return trimmed;
    }
    // Try adding https
    try {
      new URL(`https://${trimmed}`);
      return `https://${trimmed}`;
    } catch {
      return '';
    }
  }
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim().replace(/[<>]/g, '');
};

/**
 * Sanitize search query - removes special characters that could cause issues
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';
  // Remove control characters and normalize whitespace
  return query
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200); // Limit length
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== 'string') return '';
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\:*?"<>|]/g, '')
    .trim();
};

/**
 * Sanitize numeric input
 */
export const sanitizeNumber = (value: unknown, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
};

/**
 * Sanitize object - recursively sanitize all string values
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const result = { ...obj };

  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) :
        item
      );
    }
  }

  return result;
};

/**
 * Validate and sanitize ID strings (UUIDs, database IDs)
 */
export const sanitizeId = (id: string): string => {
  if (typeof id !== 'string') return '';
  // Allow alphanumeric, hyphens, and underscores
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);
};
