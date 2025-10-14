// Utility functions for phone number formatting and validation

/**
 * Formats a phone number to a standardized international format
 * Supports Russian and Kyrgyzstan numbers
 * @param phone - The phone number to format
 * @returns Formatted phone number or null if invalid
 */
export const formatPhoneNumber = (phone: string): string | null => {
  // Remove all non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Handle empty or too short numbers
  if (cleanPhone.length === 0) {
    return null;
  }
  
  // Ensure the number starts with +
  if (!cleanPhone.startsWith('+')) {
    // If it starts with 8 (Russia), replace with 7
    if (cleanPhone.startsWith('8')) {
      cleanPhone = '+7' + cleanPhone.substring(1);
    } 
    // If it starts with 0 (Kyrgyzstan), replace with 996
    else if (cleanPhone.startsWith('0')) {
      cleanPhone = '+996' + cleanPhone.substring(1);
    }
    // If it starts with 996, add +
    else if (cleanPhone.startsWith('996')) {
      cleanPhone = '+' + cleanPhone;
    }
    // If it starts with 7 (Russia), add +
    else if (cleanPhone.startsWith('7')) {
      cleanPhone = '+' + cleanPhone;
    }
    // For other cases, assume it's a local number and add default Kyrgyzstan code
    else {
      cleanPhone = '+996' + cleanPhone;
    }
  }
  
  // Validate length (rough validation for international format)
  // +7XXXXXXXXXX (12 digits) for Russia
  // +996XXXXXXXX (13 digits) for Kyrgyzstan
  if ((cleanPhone.startsWith('+7') && cleanPhone.length === 12) || 
      (cleanPhone.startsWith('+996') && cleanPhone.length === 13)) {
    return cleanPhone;
  }
  
  // If we have extra digits, try to adjust
  if (cleanPhone.startsWith('+7') && cleanPhone.length > 12) {
    return cleanPhone.substring(0, 12);
  }
  
  if (cleanPhone.startsWith('+996') && cleanPhone.length > 13) {
    return cleanPhone.substring(0, 13);
  }
  
  // If we have fewer digits, it's invalid
  if (cleanPhone.startsWith('+7') && cleanPhone.length < 12) {
    return null;
  }
  
  if (cleanPhone.startsWith('+996') && cleanPhone.length < 13) {
    return null;
  }
  
  return cleanPhone;
};

/**
 * Validates if a phone number is in correct format
 * @param phone - The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Check if it starts with +
  if (!phone.startsWith('+')) {
    return false;
  }
  
  // Remove + and check if all remaining characters are digits
  const cleanPhone = phone.substring(1).replace(/\D/g, '');
  
  // Russian numbers: +7XXXXXXXXXX (11 digits)
  if (phone.startsWith('+7') && cleanPhone.length === 11) {
    return true;
  }
  
  // Kyrgyzstan numbers: +996XXXXXXXX (12 digits)
  if (phone.startsWith('+996') && cleanPhone.length === 12) {
    return true;
  }
  
  return false;
};

/**
 * Formats a phone number for display
 * @param phone - The phone number to format for display
 * @returns Formatted phone number for display
 */
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  
  // Russian format: +7 (XXX) XXX-XXXX
  if (phone.startsWith('+7') && phone.length === 12) {
    const digits = phone.substring(2);
    return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  }
  
  // Kyrgyzstan format: +996 (XXX) XXX-XXX
  if (phone.startsWith('+996') && phone.length === 13) {
    const digits = phone.substring(4);
    return `+996 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  }
  
  // If not in expected format, return as is
  return phone;
};