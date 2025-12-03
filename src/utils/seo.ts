/**
 * SEO Utility Functions
 * Generates SEO-friendly alt text for images
 */

interface Event {
  title: string;
  category?: string;
  location?: string;
  imageAlt?: string;
}

/**
 * Generates SEO-friendly alt text for event images
 * Uses custom alt text if provided, otherwise auto-generates from event data
 */
export const getEventImageAlt = (event: Event): string => {
  // Use custom alt text if provided by admin
  if (event.imageAlt && event.imageAlt.trim()) {
    return event.imageAlt.trim();
  }
  
  // Auto-generate SEO-friendly alt text
  const parts = [
    event.title,
    event.category && `${event.category} event`,
    'Bihar Purvanchal Samaj',
    event.location
  ];
  
  return parts.filter(Boolean).join(' - ');
};

/**
 * Generates alt text for gallery images
 */
export const getGalleryImageAlt = (event: Event, index: number, total: number): string => {
  return `${event.title} - Photo ${index + 1} of ${total} from ${event.category || 'event'} in ${event.location || 'Gandhinagar'}`;
};

/**
 * Generates alt text for member photos
 */
export const getMemberImageAlt = (name: string, role?: string): string => {
  if (role) {
    return `${name} - ${role} at Bihar Sanskritik Mandal`;
  }
  return `${name} - Member of Bihar Sanskritik Mandal`;
};

/**
 * Generates alt text for campaign images
 */
export const getCampaignImageAlt = (title: string, category?: string): string => {
  const parts = [
    title,
    category && `${category} campaign`,
    'Bihar Purvanchal Samaj'
  ];
  return parts.filter(Boolean).join(' - ');
};
