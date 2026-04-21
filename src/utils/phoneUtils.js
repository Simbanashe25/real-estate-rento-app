/**
 * Formats a phone number for use in a WhatsApp link (wa.me),
 * specifically handling Zimbabwean numbers.
 * 
 * @param {string} phone - The phone number to format
 * @returns {string} - The formatted number for WhatsApp
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '263771234567'; // Default fallback
  
  // Strip all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0, it's likely a local Zim number (e.g., 0771234567)
  if (cleaned.startsWith('0')) {
    cleaned = '263' + cleaned.substring(1);
  } 
  // If it starts with 7 (e.g., 771234567), it's a Zim number without country code or leading zero
  else if (cleaned.length === 9 && (cleaned.startsWith('71') || cleaned.startsWith('73') || cleaned.startsWith('77') || cleaned.startsWith('78'))) {
    cleaned = '263' + cleaned;
  }
  // If it's already got the 263 prefix, we're good
  
  return cleaned;
};
