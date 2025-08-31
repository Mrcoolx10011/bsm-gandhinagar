import React, { useState } from 'react';

interface ImageKitImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  transformation?: string[];
}

export const ImageKitImage: React.FC<ImageKitImageProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  priority = false,
  quality = 80,
  transformation = []
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate ImageKit URL with transformations
  const generateImageKitUrl = (originalUrl: string) => {
    if (!originalUrl.includes('imagekit.io')) {
      return originalUrl; // Return original if not ImageKit URL
    }

    // Extract the base URL and image path
    const urlParts = originalUrl.split('?');
    const baseUrl = urlParts[0];
    
    // Build transformation parameters
    const transforms = [
      `w-${width}`,
      `h-${height}`,
      `q-${quality}`,
      'f-auto', // Auto format (WebP, AVIF)
      'c-maintain_ratio',
      ...transformation
    ];
    
    // Add transformation parameters to ImageKit URL
    const transformString = transforms.join(',');
    const finalUrl = baseUrl.replace(/\/([^\/]+)$/, `/tr:${transformString}/$1`);
    
    return finalUrl;
  };

  // Generate multiple sizes for responsive images
  const generateSrcSet = () => {
    const sizes = [width * 0.5, width, width * 1.5, width * 2];
    return sizes.map(size => {
      const url = generateImageKitUrl(src).replace(`w-${width}`, `w-${Math.round(size)}`);
      return `${url} ${Math.round(size)}w`;
    }).join(', ');
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      <img
        src={generateImageKitUrl(src)}
        srcSet={generateSrcSet()}
        sizes={`(max-width: 768px) ${width * 0.7}px, ${width}px`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${error ? 'hidden' : ''}`}
        style={{ width: '100%', height: 'auto', maxWidth: `${width}px` }}
      />
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-sm">Logo unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
};
