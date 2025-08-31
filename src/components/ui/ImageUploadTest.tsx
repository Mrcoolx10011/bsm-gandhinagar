import React, { useState } from 'react';
import { ImageUploader } from '../admin/ImageUploader';

export const ImageUploadTest: React.FC = () => {
  const [uploadedImageData, setUploadedImageData] = useState<any>(null);

  const handleImageUpload = (imageData: any) => {
    console.log('Image uploaded:', imageData);
    setUploadedImageData(imageData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        🖼️ ImageKit Upload Test
      </h2>
      
      <div className="mb-6">
        <ImageUploader
          onImageUpload={handleImageUpload}
          folder="posts"
          maxSize={10}
        />
      </div>

      {uploadedImageData && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            ✅ Upload Successful!
          </h3>
          
          <div className="space-y-2 text-sm">
            <div>
              <strong>Image URL:</strong>{' '}
              <a 
                href={uploadedImageData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {uploadedImageData.url}
              </a>
            </div>
            
            {uploadedImageData.thumbnailUrl && (
              <div>
                <strong>Thumbnail URL:</strong>{' '}
                <a 
                  href={uploadedImageData.thumbnailUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {uploadedImageData.thumbnailUrl}
                </a>
              </div>
            )}
            
            <div>
              <strong>File ID:</strong> {uploadedImageData.fileId}
            </div>
            
            <div>
              <strong>Size:</strong> {Math.round(uploadedImageData.size / 1024)} KB
            </div>
            
            <div>
              <strong>Dimensions:</strong> {uploadedImageData.width} x {uploadedImageData.height}px
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Full Size Image:</h4>
              <img 
                src={uploadedImageData.url} 
                alt="Uploaded full size" 
                className="w-full h-32 object-cover rounded border"
              />
            </div>
            
            {uploadedImageData.thumbnailUrl && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Thumbnail:</h4>
                <img 
                  src={uploadedImageData.thumbnailUrl} 
                  alt="Uploaded thumbnail" 
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📋 Test Instructions:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Drag and drop an image or click to select</li>
          <li>• Image will be uploaded to ImageKit</li>
          <li>• Both full size and thumbnail will be created</li>
          <li>• URLs and metadata will be displayed below</li>
          <li>• Images are stored in: bsm-gandhinagar/posts/</li>
        </ul>
      </div>
    </div>
  );
};
