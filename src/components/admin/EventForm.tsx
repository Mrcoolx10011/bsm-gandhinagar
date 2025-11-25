import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, MapPin, Tag, Users, FileText, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Event {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  gallery?: string[];
  attendees: number;
  maxAttendees: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

interface EventFormProps {
  event?: Event;
  onSave: (event: Omit<Event, 'id'> | Event) => void;
  onClose: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Healthcare',
    image: '',
    gallery: [] as string[],
    attendees: 0,
    maxAttendees: 50,
    status: 'active' as 'active' | 'inactive'
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    if (event) {
      // Ensure date is in the correct format for the date input (YYYY-MM-DD)
      const eventDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
      
      setFormData({
        title: event.title,
        description: event.description,
        date: eventDate,
        time: event.time,
        location: event.location,
        category: event.category,
        image: event.image || '',
        gallery: event.gallery || [],
        attendees: event.attendees || 0,
        maxAttendees: event.maxAttendees || 50,
        status: event.status
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (event) {
      // Update existing event
      const eventId = event.id || event._id;
      onSave({ ...formData, id: eventId, _id: event._id });
    } else {
      // Create new event
      onSave(formData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setUploadingImage(true);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('folder', 'events'); // Upload to events folder

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const imageUrl = result.imageUrl;
        setFormData(prev => ({ ...prev, image: imageUrl }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // Add gallery image from URL
  const addGalleryImage = () => {
    if (!galleryUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(galleryUrl);
      setFormData(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), galleryUrl]
      }));
      setGalleryUrl('');
      toast.success('Gallery image added');
    } catch (error) {
      toast.error('Please enter a valid URL');
    }
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index)
    }));
    toast.success('Gallery image removed');
  };

  // Handle gallery image upload
  const handleGalleryImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setUploadingGallery(true);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('folder', 'events/gallery');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const imageUrl = result.imageUrl;
        setFormData(prev => ({
          ...prev,
          gallery: [...(prev.gallery || []), imageUrl]
        }));
        toast.success('Gallery image uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload gallery image');
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast.error('Failed to upload gallery image');
    } finally {
      setUploadingGallery(false);
    }
  };

  // Handle gallery file input change
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleGalleryImageUpload(file);
    }
  };

  const categories = ['Healthcare', 'Education', 'Environment', 'Community Development', 'Emergency Relief'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Enter event description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Event Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Event Time *
                </label>
                <input
                  type="text"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Max Attendees *
                </label>
                <input
                  type="number"
                  name="maxAttendees"
                  required
                  min="1"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image
              </label>
              
              {/* Image Upload Area */}
              <div className="space-y-4">
                {!formData.image ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="event-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="event-image-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
                          <p className="text-sm text-gray-600">Uploading image...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Click to upload event image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                {/* OR divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-sm text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                
                {/* URL input as backup option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Gallery Images Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Event Gallery (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">Add multiple images to showcase your event</p>
              
              {/* Upload or Add URL Section */}
              <div className="space-y-4 mb-4">
                {/* Upload Button */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryFileChange}
                    className="hidden"
                    id="gallery-image-upload"
                    disabled={uploadingGallery}
                  />
                  <label
                    htmlFor="gallery-image-upload"
                    className="cursor-pointer flex items-center justify-center gap-3"
                  >
                    {uploadingGallery ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Click to upload gallery image
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* OR divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-xs text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Add URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={galleryUrl}
                    onChange={(e) => setGalleryUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addGalleryImage();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Or enter image URL and click Add"
                  />
                  <button
                    type="button"
                    onClick={addGalleryImage}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Gallery Preview Grid */}
              {formData.gallery && formData.gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.gallery.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium mb-1">No gallery images added yet</p>
                  <p className="text-xs text-gray-500">Upload images or add URLs above to create a gallery</p>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{event ? 'Update Event' : 'Create Event'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

