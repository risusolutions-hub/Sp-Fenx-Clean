// Phone number utility functions

/**
 * Parse phones from various formats (JSON string, array, or single value)
 */
export const parsePhones = (phones) => {
  if (!phones) return [''];
  
  if (Array.isArray(phones)) {
    return phones.length > 0 ? phones : [''];
  }
  
  if (typeof phones === 'string') {
    try {
      const parsed = JSON.parse(phones);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Not JSON, treat as single phone
      return [phones];
    }
  }
  
  return [''];
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Indian format: +91 XXXXX XXXXX
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  return phone;
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

/**
 * Get primary phone from phones array
 */
export const getPrimaryPhone = (phones) => {
  const parsed = parsePhones(phones);
  return parsed[0] || '-';
};
