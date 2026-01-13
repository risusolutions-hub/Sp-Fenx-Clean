/**
 * Validation utilities for forms
 */

// Email validation
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// Required field validation
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Min length validation
export const minLength = (value, min) => {
  if (!value) return false;
  return String(value).length >= min;
};

// Max length validation
export const maxLength = (value, max) => {
  if (!value) return true;
  return String(value).length <= max;
};

// Number range validation
export const inRange = (value, min, max) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

// Create form validator
export const createValidator = (rules) => {
  return (values) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = values[field];
      
      for (const rule of fieldRules) {
        if (rule.required && !isRequired(value)) {
          errors[field] = rule.message || `${field} is required`;
          break;
        }
        if (rule.email && value && !isValidEmail(value)) {
          errors[field] = rule.message || 'Invalid email address';
          break;
        }
        if (rule.phone && value && !isValidPhone(value)) {
          errors[field] = rule.message || 'Invalid phone number';
          break;
        }
        if (rule.minLength && !minLength(value, rule.minLength)) {
          errors[field] = rule.message || `Minimum ${rule.minLength} characters required`;
          break;
        }
        if (rule.maxLength && !maxLength(value, rule.maxLength)) {
          errors[field] = rule.message || `Maximum ${rule.maxLength} characters allowed`;
          break;
        }
        if (rule.custom && !rule.custom(value, values)) {
          errors[field] = rule.message || 'Invalid value';
          break;
        }
      }
    });
    
    return errors;
  };
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-+()]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z]+$/,
  numeric: /^[0-9]+$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
};

export default {
  isValidEmail,
  isValidPhone,
  isRequired,
  minLength,
  maxLength,
  inRange,
  createValidator,
  patterns
};
