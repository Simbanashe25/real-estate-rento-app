import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * A lightweight SEO component that updates document title and meta tags.
 */
const SEO = ({ title, description, keywords, ogTitle, ogDescription, ogImage }) => {
  const { settings } = useSettings();
  useEffect(() => {
    // Update Title
    const baseTitle = settings.app_name || 'Rentor';
    const newTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} - Find Your Perfect Home`;
    document.title = newTitle;

    // Helper to update or create meta tags
    const updateOrCreateMetaTag = (selector, name, property, content) => {
      if (!content) return;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (name) tag.setAttribute('name', name);
        if (property) tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOrCreateMetaTag('meta[name="description"]', 'description', null, description);
    updateOrCreateMetaTag('meta[property="og:title"]', null, 'og:title', ogTitle || title);
    updateOrCreateMetaTag('meta[property="og:description"]', null, 'og:description', ogDescription || description);
    if (ogImage) updateOrCreateMetaTag('meta[property="og:image"]', null, 'og:image', ogImage);
    
  }, [title, description, keywords, ogTitle, ogDescription, ogImage]);

  return null;
};

export default SEO;
