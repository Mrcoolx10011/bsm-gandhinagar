import ImageKit from 'imagekit';

// Server-side ImageKit instance
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Client-side configuration
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
};

// Helper function to generate optimized URLs
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('imagekit.io')) {
    return url;
  }

  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'auto',
    crop = 'maintain_ratio'
  } = options;

  const transforms = [
    `w-${width}`,
    `h-${height}`,
    `q-${quality}`,
    `f-${format}`,
    `c-${crop}`
  ].join(',');

  return url.replace(/\/([^\/]+)$/, `/tr:${transforms}/$1`);
};
