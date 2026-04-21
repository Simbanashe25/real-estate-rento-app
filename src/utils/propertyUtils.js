/**
 * Generates a descriptive title for a property based on its attributes,
 * following the style of professional real estate sites like PrivateProperty.
 */
export const getPropertyDisplayTitle = (property) => {
  if (!property) return 'Property';
  
  const { type, beds } = property;
  const bedCount = Number(beds) || 0;
  
  // 1. Handle Room-based listings
  if (type === 'Private Room' || type === 'Shared Room') {
    const label = type === 'Shared Room' ? 'Shared Room' : 'Room';
    if (bedCount > 1) {
      return `${bedCount} ${label}s`;
    }
    return `1 ${label}`;
  }
  
  // 2. Handle Student Housing
  if (type === 'Student Housing') {
    return `Student Housing${bedCount > 0 ? ` (${bedCount} Bed)` : ''}`;
  }
  
  // 3. Handle Entire Homes / Apartments
  // Map "Entire Home" to "House" for a more professional feel
  const displayType = type === 'Entire Home' ? 'House' : (type || 'Property');
  
  if (bedCount === 0) {
    return `Studio ${displayType}`;
  }
  
  return `${bedCount} Bedroom ${displayType}`;
};
