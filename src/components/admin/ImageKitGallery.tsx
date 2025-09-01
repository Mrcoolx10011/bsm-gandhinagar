import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Eye, Trash2, Loader, Image as ImageIcon } from 'lucide-react';

interface ImageKitFile {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width: number;
  height: number;
  filePath: string;
  tags: string[];
  createdAt: string;
}

interface ImageKitGalleryProps {
  folder?: string;
  className?: string;
  onImageSelect?: (image: ImageKitFile) => void;
  selectable?: boolean;
}

export const ImageKitGallery: React.FC<ImageKitGalleryProps> = ({
  folder = '',
  className = '',
  onImageSelect,
  selectable = false
}) => {
  const [images, setImages] = useState<ImageKitFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/imagekit-list?folder=${folder}`);
      const data = await response.json();
      
      if (data.success) {
        setImages(data.files || []);
      } else {
        setError(data.error || 'Failed to fetch images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images from ImageKit');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    
    try {
      const response = await fetch(`/api/imagekit-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setImages(images.filter(img => img.fileId !== fileId));
      } else {
        alert('Failed to delete image: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleImageSelect = (image: ImageKitFile) => {
    if (selectable && onImageSelect) {
      setSelectedImage(image.fileId);
      onImageSelect(image);
    }
  };

  const openImageInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const downloadImage = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchImages();
  }, [folder]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading images from ImageKit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Images</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchImages}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <ImageIcon className="mr-2" size={20} />
          ImageKit Gallery ({folder})
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({images.length} images)
          </span>
        </h3>
        <button
          onClick={fetchImages}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={16} className="mr-1" />
          Refresh
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
          <p>No images found in the "{folder}" folder</p>
          <p className="text-sm mt-1">Upload some images to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.fileId}
              className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
                selectable ? 'cursor-pointer' : ''
              } ${selectedImage === image.fileId ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleImageSelect(image)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.thumbnailUrl || image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageInNewTab(image.url);
                      }}
                      className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                      title="View Full Size"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image.url, image.name);
                      }}
                      className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image.fileId, image.name);
                      }}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <h4 className="font-medium text-sm text-gray-800 truncate" title={image.name}>
                  {image.name}
                </h4>
                <div className="text-xs text-gray-500 mt-1">
                  <div>{image.width} × {image.height}</div>
                  <div>{(image.size / 1024).toFixed(1)} KB</div>
                  <div>{new Date(image.createdAt).toLocaleDateString()}</div>
                </div>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {image.tags.length > 2 && (
                      <span className="text-gray-400 text-xs">+{image.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageKitGallery;
