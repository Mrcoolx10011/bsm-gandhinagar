import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Clock, Navigation, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventForm } from './EventForm';
import { EventRegistrations } from './EventRegistrations';
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

export const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; eventId: string; eventTitle: string }>({
    show: false,
    eventId: '',
    eventTitle: ''
  });

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('adminToken');
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/consolidated?endpoint=events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  const apiAddEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      const token = getAuthToken();
      console.log('🆕 Creating event:', eventData);
      
      const response = await fetch('/api/consolidated?endpoint=events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      console.log('📡 Create response status:', response.status);

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Create error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create event`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const apiUpdateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const token = getAuthToken();
      console.log('🔄 Updating event:', { id, eventData });
      
      const response = await fetch(`/api/consolidated?endpoint=events&id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      console.log('📡 Update response status:', response.status);
      
      if (response.ok) {
        // Refetch events to get the updated data
        await fetchEvents();
        return eventData;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Update error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update event`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const apiDeleteEvent = async (id: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/consolidated?endpoint=events&id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => (event.id !== id && event._id !== id)));
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setShowForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id'> | Event) => {
    try {
      console.log('💾 Saving event data:', eventData);
      
      if ('id' in eventData && (eventData.id || eventData._id)) {
        const eventId = eventData.id || eventData._id;
        if (eventId) {
          await apiUpdateEvent(eventId, eventData);
          toast.success('Event updated successfully!');
        }
      } else {
        await apiAddEvent(eventData);
        toast.success('Event created successfully!');
      }
      setShowForm(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error('❌ Save event error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save event';
      toast.error(errorMessage);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await apiDeleteEvent(id);
      toast.success('Event deleted successfully!');
      setDeleteConfirm({ show: false, eventId: '', eventTitle: '' });
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const confirmDelete = (event: Event) => {
    setDeleteConfirm({
      show: true,
      eventId: event.id || event._id || '',
      eventTitle: event.title
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-orange-100 text-orange-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoogleMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading events...</span>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage organization events
          </p>
        </div>
        <button
          onClick={handleAddEvent}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.reduce((sum, event) => sum + (event.attendees || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredEvents.length} events
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id || event._id || `event-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={event.image || 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400'}
              alt={event.title}
              className="w-full h-40 sm:h-48 object-cover"
            />
            
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded truncate max-w-[60%]">
                  {event.category}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {event.title}
              </h3>
              
              <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-2 text-xs sm:text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{event.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <a
                    href={getGoogleMapsUrl(event.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                    title="Get Directions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{event.attendees || 0}/{event.maxAttendees} attendees</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${((event.attendees || 0) / event.maxAttendees) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="text-orange-600 hover:text-orange-900 text-sm font-medium py-2.5 px-3 border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => setViewingRegistrations(event.id || event._id || '')}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium py-2.5 px-3 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Register</span>
                </button>
                <button
                  onClick={() => handleEditEvent(event)}
                  className="text-yellow-600 hover:text-yellow-900 text-sm font-medium py-2.5 px-3 border-2 border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => confirmDelete(event)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium py-2.5 px-3 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event Form Modal */}
      <AnimatePresence>
        {showForm && (
          <EventForm
            event={editingEvent}
            onSave={handleSaveEvent}
            onClose={() => {
              setShowForm(false);
              setEditingEvent(undefined);
            }}
          />
        )}
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <img
                  src={selectedEvent.image || 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded">
                    {selectedEvent.category}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedEvent.title}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  {selectedEvent.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{selectedEvent.location}</span>
                      </div>
                      <a
                        href={getGoogleMapsUrl(selectedEvent.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Attendance</h4>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-orange-600 h-3 rounded-full"
                        style={{ width: `${((selectedEvent.attendees || 0) / selectedEvent.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedEvent.attendees || 0} / {selectedEvent.maxAttendees} attendees
                    </p>
                  </div>
                </div>

                {/* Attendees list would go here when individual attendee tracking is implemented */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Registrations Modal */}
      {viewingRegistrations && (
        <EventRegistrations
          eventId={viewingRegistrations}
          onClose={() => setViewingRegistrations(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Event?
              </h3>
              
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete this event?
              </p>
              
              <p className="text-gray-900 font-semibold text-center mb-6 px-4 py-2 bg-gray-100 rounded-lg">
                "{deleteConfirm.eventTitle}"
              </p>
              
              <p className="text-sm text-red-600 text-center mb-6">
                This action cannot be undone. All event data and registrations will be permanently deleted.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, eventId: '', eventTitle: '' })}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteEvent(deleteConfirm.eventId)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};

