import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (imageData: any) => void;
  currentImage?: string;
  folder?: string;
  maxSize?: number; // in MB
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  currentImage,
  folder = '',
  maxSize = 10,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size should be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload only image files');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setUploadedImage(result.imageUrl);
        onImageUpload({
          url: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          fileId: result.fileId,
          thumbnailId: result.thumbnailId,
          name: result.imageName,
          size: result.size,
          width: result.width,
          height: result.height
        });
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onImageUpload, folder, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: maxSize * 1024 * 1024
  });

  const refreshImage = () => {
    // Force refresh by adding timestamp to image URL
    if (uploadedImage) {
      const url = new URL(uploadedImage);
      url.searchParams.set('t', Date.now().toString());
      setUploadedImage(url.toString());
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    onImageUpload(null);
    setError(null);
  };

  if (uploadedImage) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={uploadedImage}
          alt="Uploaded"
          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
        />
        <button
          onClick={refreshImage}
          className="absolute top-2 right-12 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
          title="Refresh Image"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={removeImage}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          title="Remove Image"
        >
          <X size={16} />
        </button>
        <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded flex items-center text-sm">
          <CheckCircle size={16} className="mr-1" />
          Uploaded Successfully
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-400 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {uploading ? (
            <>
              <div className="relative mb-4">
                <Loader className="h-12 w-12 text-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
              <p className="text-gray-600 font-medium">Uploading to ImageKit...</p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop image here' : `Upload ${folder === 'posts' ? 'Post' : 'Event'} Image`}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag & drop an image or click to select
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>Max size: {maxSize}MB</span>
                <span>•</span>
                <span>JPG, PNG, GIF, WebP</span>
              </div>
              {folder === 'posts' && (
                <p className="text-xs text-blue-500 mt-2">
                  📸 Thumbnail will be auto-generated
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
