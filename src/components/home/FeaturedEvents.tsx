import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, X, Users, Share2, Download, ExternalLink, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getEventImageAlt, getGalleryImageAlt } from '../../utils/seo';

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
  imageAlt?: string;
  gallery?: string[];
  attendees: number;
  maxAttendees: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export const FeaturedEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching upcoming events...');
      const response = await fetch('/api/events?upcoming=true');
      console.log('Events API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Events API data:', data);
        // Show only first 3 events for featured section
        setEvents(data.slice(0, 3));
      } else {
        console.error('Failed to fetch events:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = (event: Event) => {
    setSelectedEvent(event);
    setCurrentImageIndex(0);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    document.body.style.overflow = 'unset';
  };

  const getCombinedImages = (event: Event) => {
    const images = [event.image];
    if (event.gallery && event.gallery.length > 0) {
      images.push(...event.gallery);
    }
    return images;
  };

  const nextImage = () => {
    if (selectedEvent) {
      const totalImages = getCombinedImages(selectedEvent).length;
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const prevImage = () => {
    if (selectedEvent) {
      const totalImages = getCombinedImages(selectedEvent).length;
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGoogleMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };
  
  return (
    <section id="featured-events" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4"
          >
            Upcoming Events
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Join us in our upcoming events and be part of positive change
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
            <p className="text-gray-600">Check back soon for new events!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {events.map((event, index) => (
            <motion.div
              key={event.id || event._id || `event-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={getEventImageAlt(event)}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                    {event.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleLearnMore(event)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <span>View Event Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
            </div>

            <div className="text-center">
              <motion.a
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                href="/events"
                className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                <span>View All Events</span>
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </div>
          </>
        )}
      </div>

      {/* Event Detail Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={closeModal}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" aria-hidden="true"></div>

            {/* Modal panel */}
            <div 
              className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {/* Modal Header Image with Gallery Carousel */}
              <div className="relative w-full bg-gray-900">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <img
                    src={getCombinedImages(selectedEvent)[currentImageIndex]}
                    alt={currentImageIndex === 0 ? getEventImageAlt(selectedEvent) : getGalleryImageAlt(selectedEvent, currentImageIndex, getCombinedImages(selectedEvent).length)}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Gallery Navigation */}
                {getCombinedImages(selectedEvent).length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {getCombinedImages(selectedEvent).length}
                    </div>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {getCombinedImages(selectedEvent).map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white w-6' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>

              {/* Modal Content */}
              <div className="bg-white px-6 sm:px-8 py-6 max-h-[60vh] overflow-y-auto">
                {/* Event Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Date</p>
                      <p className="text-gray-900 font-semibold">{formatDate(selectedEvent.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Time</p>
                      <p className="text-gray-900 font-semibold">{selectedEvent.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl sm:col-span-2">
                    <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Location</p>
                      <p className="text-gray-900 font-semibold">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">About This Event</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Attendance Info */}
                <div className="mb-6 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      Registration Status
                    </h3>
                    <span className="text-2xl font-bold text-orange-600">
                      {Math.round((selectedEvent.attendees / selectedEvent.maxAttendees) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-4 overflow-hidden mb-3 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((selectedEvent.attendees / selectedEvent.maxAttendees) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-semibold">
                      {selectedEvent.attendees} Registered
                    </span>
                    <span className="text-gray-700 font-semibold">
                      {selectedEvent.maxAttendees - selectedEvent.attendees} Spots Left
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <a
                    href="/events"
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Calendar className="w-5 h-5" />
                    View All Events
                  </a>
                  <a
                    href={getGoogleMapsUrl(selectedEvent.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white border-2 border-orange-600 text-orange-600 py-4 px-6 rounded-xl hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
                  >
                    <MapPin className="w-5 h-5" />
                    Get Directions
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

