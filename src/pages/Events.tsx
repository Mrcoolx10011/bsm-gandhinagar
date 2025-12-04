import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Filter, Search, Users, ArrowRight, X, Share2, Mail, Phone, Download, Copy, CheckCircle, AlertCircle, Loader, ExternalLink, Facebook, Twitter, Linkedin, MessageCircle, SortAsc, SortDesc, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { EventRegistrationForm } from '../components/events/EventRegistrationForm';
import { getEventImageAlt, getGalleryImageAlt } from '../utils/seo';

interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  imageAlt?: string;
  attendees: number;
  maxAttendees: number;
  gallery: string[];
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'popularity'>('date-asc');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const location = useLocation();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const categories = ['Healthcare', 'Education', 'Environment', 'Community Development', 'Emergency Relief'];

  // Fetch events from API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/events');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // SEO: Update page title and meta tags
  useEffect(() => {
    document.title = 'Events & Programs | Bihar Sanskritik Mandal Gandhinagar';
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Discover upcoming cultural events, festivals, and programs organized by Bihar Sanskritik Mandal Gandhinagar. Join our community celebrations.');
    
    // Add robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow');
    
    return () => {
      document.title = 'Bihar Sanskritik Mandal Gandhinagar';
    };
  }, []);

  // Open event modal if navigated from home page
  useEffect(() => {
    if (location.state?.openEventId && events.length > 0) {
      const eventToOpen = events.find(e => (e.id || e._id) === location.state.openEventId);
      if (eventToOpen) {
        openEventModal(eventToOpen);
        // Clear the state to prevent reopening on subsequent renders
        window.history.replaceState({}, document.title);
      }
    }
  }, [events, location.state]);

  // Filter events when filters change
  useEffect(() => {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by upcoming events
    if (showUpcoming) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(event => event.date >= today);
    }

    // Sort events
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'popularity') {
        return b.attendees - a.attendees;
      }
      return 0;
    });

    setFilteredEvents(filtered);
  }, [events, selectedCategory, searchTerm, showUpcoming, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventStatus = (event: Event) => {
    const today = new Date();
    const eventDate = new Date(event.date);
    const isToday = today.toDateString() === eventDate.toDateString();
    const isPast = eventDate < today && !isToday;
    const isFull = event.attendees >= event.maxAttendees;

    if (isPast) return { label: 'Completed', color: 'bg-gray-500' };
    if (isToday) return { label: 'Today', color: 'bg-green-600' };
    if (isFull) return { label: 'Full', color: 'bg-red-600' };
    return { label: 'Upcoming', color: 'bg-blue-600' };
  };

  const getCountdown = (dateString: string, timeString: string) => {
    try {
      // Parse date and time more safely
      let hours = 9;
      let minutes = 0;
      
      if (timeString) {
        const timeMatch = timeString.match(/(\d+):(\d+)/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          if (timeString.toLowerCase().includes('pm') && hours !== 12) {
            hours += 12;
          }
          if (timeString.toLowerCase().includes('am') && hours === 12) {
            hours = 0;
          }
        }
      }
      
      const eventDateTime = new Date(dateString);
      if (isNaN(eventDateTime.getTime())) {
        return null;
      }
      
      eventDateTime.setHours(hours, minutes, 0, 0);
      const now = new Date();
      const diff = eventDateTime.getTime() - now.getTime();

      if (diff < 0) return null;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return `${days}d ${hrs}h`;
      if (hrs > 0) return `${hrs}h ${mins}m`;
      return `${mins}m`;
    } catch (error) {
      console.error('Error calculating countdown:', error);
      return null;
    }
  };

  const generateCalendarLink = (event: Event) => {
    try {
      // Parse the date and time more safely
      const dateStr = event.date;
      const timeStr = event.time;
      
      // Extract time if possible, otherwise use default
      let hours = 9;
      let minutes = 0;
      
      if (timeStr) {
        const timeMatch = timeStr.match(/(\d+):(\d+)/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          // Adjust for PM if needed
          if (timeStr.toLowerCase().includes('pm') && hours !== 12) {
            hours += 12;
          }
          if (timeStr.toLowerCase().includes('am') && hours === 12) {
            hours = 0;
          }
        }
      }
      
      const startDate = new Date(dateStr);
      if (isNaN(startDate.getTime())) {
        // If date is invalid, return empty string
        return '#';
      }
      
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
      
      const formatDateForCal = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForCal(startDate)}/${formatDateForCal(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
      
      return googleCalUrl;
    } catch (error) {
      console.error('Error generating calendar link:', error);
      return '#';
    }
  };

  const downloadICS = (event: Event) => {
    try {
      // Parse the date and time more safely
      const dateStr = event.date;
      const timeStr = event.time;
      
      // Extract time if possible, otherwise use default
      let hours = 9;
      let minutes = 0;
      
      if (timeStr) {
        const timeMatch = timeStr.match(/(\d+):(\d+)/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          if (timeStr.toLowerCase().includes('pm') && hours !== 12) {
            hours += 12;
          }
          if (timeStr.toLowerCase().includes('am') && hours === 12) {
            hours = 0;
          }
        }
      }
      
      const startDate = new Date(dateStr);
      if (isNaN(startDate.getTime())) {
        console.error('Invalid event date');
        return;
      }
      
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      
      const formatDateForICS = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ICS:', error);
      alert('Failed to download calendar file');
    }
  };

  const shareEvent = (platform: string, event: Event) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const text = `Check out this event: ${event.title}`;
    
    let shareUrl = '';
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + eventUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyEventLink = (event: Event) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(eventUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const getGoogleMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  const handleRegisterNow = (event: Event) => {
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    // Refresh events to get updated attendee count
    if (selectedEvent) {
      const loadEvents = async () => {
        try {
          const response = await fetch('/api/events');
          if (response.ok) {
            const data = await response.json();
            setEvents(data);
            // Update selected event
            const updatedEvent = data.find((e: Event) => 
              (e.id || e._id) === (selectedEvent.id || selectedEvent._id)
            );
            if (updatedEvent) {
              setSelectedEvent(updatedEvent);
            }
          }
        } catch (error) {
          console.error('Error refreshing events:', error);
        }
      };
      loadEvents();
    }
  };

  // Create combined images array: main image + gallery images
  const getCombinedImages = (event: Event) => {
    const images = [event.image]; // Start with main image
    if (event.gallery && event.gallery.length > 0) {
      images.push(...event.gallery); // Add gallery images
    }
    return images;
  };

  const openEventModal = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
    setShowShareMenu(false);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeEventModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setShowShareMenu(false);
    setShowLightbox(false);
    setLightboxZoom(1);
    document.body.style.overflow = 'unset';
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
    setLightboxZoom(1);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setLightboxZoom(1);
  };

  const nextImage = () => {
    if (selectedEvent) {
      const totalImages = getCombinedImages(selectedEvent).length;
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
      setLightboxZoom(1);
    }
  };

  const prevImage = () => {
    if (selectedEvent) {
      const totalImages = getCombinedImages(selectedEvent).length;
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
      setLightboxZoom(1);
    }
  };

  const zoomIn = () => {
    setLightboxZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setLightboxZoom((prev) => Math.max(prev - 0.5, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-orange-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Join us in making a difference through community events and initiatives
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="date-asc">Upcoming First</option>
                  <option value="date-desc">Latest First</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUpcoming}
                  onChange={(e) => setShowUpcoming(e.target.checked)} className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Upcoming Only</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600">
                {events.length === 0 
                  ? "No events have been created yet. Check back soon!"
                  : "No events match your current filters. Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const status = getEventStatus(event);
                const countdown = getCountdown(event.date, event.time);
                
                return (
                <div 
                  key={event.id || `event-${event.title}-${event.date}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    <img
                      src={event.image}
                      alt={getEventImageAlt(event)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
                        {event.category}
                      </span>
                      <span className={`${status.color} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Countdown Timer */}
                    {countdown && (
                      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-bold text-gray-900">{countdown}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-orange-600 transition-colors cursor-pointer">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-4 text-sm leading-relaxed flex-grow">
                      {event.description}
                    </p>

                    {/* Attendees Progress */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-orange-600" />
                          <span className="font-semibold">{event.attendees}/{event.maxAttendees}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                          {Math.round((event.attendees / event.maxAttendees) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min((event.attendees / event.maxAttendees) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Learn More Button */}
                    <button 
                      onClick={() => openEventModal(event)}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-xl"
                    >
                      View Event Details
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </section>

      {/* Event Detail Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={closeEventModal}>
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
                onClick={closeEventModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {/* Modal Header Image with Gallery Carousel */}
              <div className="relative h-72 sm:h-96 bg-gray-200 overflow-hidden">
                <img
                  src={getCombinedImages(selectedEvent)[currentImageIndex]}
                  alt={currentImageIndex === 0 ? getEventImageAlt(selectedEvent) : getGalleryImageAlt(selectedEvent, currentImageIndex, getCombinedImages(selectedEvent).length)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                {/* Gallery Navigation - Only show if there are multiple images */}
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

                    {/* Fullscreen Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); openLightbox(currentImageIndex); }}
                      className="absolute top-4 right-20 p-2 bg-black/70 backdrop-blur-sm text-white rounded-full hover:bg-black/90 transition-colors"
                      title="View fullscreen"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>

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
                  <button 
                    onClick={() => handleRegisterNow(selectedEvent)}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-5 h-5" />
                    Register Now
                  </button>
                  <div className="relative flex-1">
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="w-full bg-white border-2 border-orange-600 text-orange-600 py-4 px-6 rounded-xl hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Share2 className="w-5 h-5" />
                      Share Event
                    </button>
                    
                    {/* Share Menu Dropdown */}
                    {showShareMenu && selectedEvent && (
                      <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-10">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => shareEvent('whatsapp', selectedEvent)}
                            className="flex items-center gap-2 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                          >
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => shareEvent('facebook', selectedEvent)}
                            className="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                          >
                            <Facebook className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Facebook</span>
                          </button>
                          <button
                            onClick={() => shareEvent('twitter', selectedEvent)}
                            className="flex items-center gap-2 p-3 rounded-lg hover:bg-sky-50 transition-colors group"
                          >
                            <Twitter className="w-5 h-5 text-sky-500" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-sky-500">Twitter</span>
                          </button>
                          <button
                            onClick={() => shareEvent('linkedin', selectedEvent)}
                            className="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                          >
                            <Linkedin className="w-5 h-5 text-blue-700" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">LinkedIn</span>
                          </button>
                          <button
                            onClick={() => copyEventLink(selectedEvent)}
                            className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                          >
                            {copiedLink ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600">Link Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calendar & Maps Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <a
                    href={generateCalendarLink(selectedEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-4 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors font-semibold"
                  >
                    <Calendar className="w-5 h-5" />
                    Add to Google Calendar
                  </a>
                  <button
                    onClick={() => downloadICS(selectedEvent)}
                    className="flex items-center justify-center gap-2 p-4 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors font-semibold"
                  >
                    <Download className="w-5 h-5" />
                    Download .ics File
                  </button>
                  <a
                    href={getGoogleMapsUrl(selectedEvent.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm:col-span-2 flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-semibold"
                  >
                    <MapPin className="w-5 h-5" />
                    Get Directions
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    For more information, contact us at{' '}
                    <a href="mailto:info@bsm.org" className="text-orange-600 hover:underline font-semibold">
                      info@bsm.org
                    </a>
                    {' '}or{' '}
                    <a href="tel:+911234567890" className="text-orange-600 hover:underline font-semibold">
                      +91 123 456 7890
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && selectedEvent && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center" onClick={closeLightbox}>
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); zoomIn(); }}
              className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); zoomOut(); }}
              className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-6 h-6 text-gray-800" />
            </button>
            <div className="px-4 py-3 bg-white rounded-full shadow-lg font-semibold text-gray-800">
              {Math.round(lightboxZoom * 100)}%
            </div>
          </div>

          {/* Navigation Arrows */}
          {getCombinedImages(selectedEvent).length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          <img
            src={getCombinedImages(selectedEvent)[currentImageIndex]}
            alt={currentImageIndex === 0 ? getEventImageAlt(selectedEvent) : getGalleryImageAlt(selectedEvent, currentImageIndex, getCombinedImages(selectedEvent).length)}
            className="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-300"
            style={{ transform: `scale(${lightboxZoom})` }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600';
            }}
          />

          {/* Image Counter */}
          {getCombinedImages(selectedEvent).length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-white rounded-full shadow-lg font-semibold text-gray-800">
              {currentImageIndex + 1} / {getCombinedImages(selectedEvent).length}
            </div>
          )}
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && selectedEvent && (
        <EventRegistrationForm
          event={selectedEvent}
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};

export default Events;