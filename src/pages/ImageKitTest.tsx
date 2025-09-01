import React, { useState } from 'react';
import { ImageUploader } from '../components/admin/ImageUploader';
import ImageKitGallery from '../components/admin/ImageKitGallery';

const ImageKitTest: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImageUpload = (imageData: any) => {
    console.log('Image uploaded:', imageData);
    // Refresh the gallery when a new image is uploaded
    setRefreshKey(prev => prev + 1);
  };

  const handleImageSelect = (image: any) => {
    setSelectedImage(image);
    console.log('Image selected:', image);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🖼️ ImageKit Management System
          </h1>
          <p className="text-gray-600 mb-6">
            Upload new images and manage your ImageKit gallery
          </p>

          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Image</h2>
            <ImageUploader
              onImageUpload={handleImageUpload}
              folder=""
              className="max-w-md"
            />
          </div>

          {/* Selected Image Display */}
          {selectedImage && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Selected Image</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={selectedImage.thumbnailUrl || selectedImage.url}
                    alt={selectedImage.name}
                    className="w-full h-48 object-cover rounded border"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedImage.name}</div>
                  <div><strong>File ID:</strong> {selectedImage.fileId}</div>
                  <div><strong>Size:</strong> {(selectedImage.size / 1024).toFixed(1)} KB</div>
                  <div><strong>Dimensions:</strong> {selectedImage.width} × {selectedImage.height}</div>
                  <div><strong>Created:</strong> {new Date(selectedImage.createdAt).toLocaleString()}</div>
                  <div><strong>URL:</strong> 
                    <a href={selectedImage.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1 break-all">
                      {selectedImage.url}
                    </a>
                  </div>
                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div><strong>Tags:</strong> {selectedImage.tags.join(', ')}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gallery Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ImageKitGallery
            key={refreshKey} // Force refresh when new image uploaded
            folder=""
            selectable={true}
            onImageSelect={handleImageSelect}
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Test Instructions:</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Upload images using the drag & drop area above</li>
            <li>• View all uploaded images in the gallery below</li>
            <li>• Click on any image to select it and view details</li>
            <li>• Hover over images to see action buttons (view, download, delete)</li>
            <li>• Use the refresh button to reload the gallery</li>
            <li>• Both full-size images and thumbnails are automatically created</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageKitTest;
