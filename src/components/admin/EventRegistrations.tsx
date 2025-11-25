import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, User, Calendar, CheckCircle, XCircle, AlertCircle, Loader, FileDown } from 'lucide-react';

interface Registration {
  _id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  numberOfAttendees: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  registeredAt: string;
  confirmationSent: boolean;
}

interface Event {
  id?: string;
  _id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

interface EventRegistrationsProps {
  eventId: string;
  onClose: () => void;
}

export const EventRegistrations: React.FC<EventRegistrationsProps> = ({ eventId, onClose }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventAndRegistrations();
  }, []);

  const fetchEventAndRegistrations = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      const eventResponse = await fetch('/api/consolidated?endpoint=events');
      if (eventResponse.ok) {
        const events = await eventResponse.json();
        const foundEvent = events.find((e: any) => (e.id || e._id) === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
        }
      }
      
      // Fetch registrations
      const regResponse = await fetch(`/api/consolidated?endpoint=registrations&eventId=${eventId}`);
      if (regResponse.ok) {
        const data = await regResponse.json();
        setRegistrations(data);
      } else {
        setError('Failed to load registrations');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!event) return;
    
    const headers = ['Registration ID', 'Name', 'Email', 'Phone', 'Attendees', 'Status', 'Registered At'];
    const rows = registrations.map(reg => [
      reg.registrationId,
      reg.name,
      reg.email,
      reg.phone,
      reg.numberOfAttendees,
      reg.status,
      new Date(reg.registeredAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const totalAttendees = registrations.reduce((sum, reg) => 
    reg.status === 'confirmed' ? sum + reg.numberOfAttendees : sum, 0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" aria-hidden="true"></div>
        
        <div 
          className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Event Registrations</h3>
                <p className="text-orange-100 text-sm mt-1">{event?.title || 'Loading...'}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 font-medium">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 font-medium">Total Attendees</p>
                <p className="text-2xl font-bold text-orange-600">{totalAttendees}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {registrations.filter(r => r.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-b bg-white">
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                disabled={registrations.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className="w-4 h-4" />
                Export to CSV
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-orange-600" />
                <span className="ml-3 text-gray-600">Loading registrations...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
                <p className="text-gray-600">No one has registered for this event yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div
                    key={registration._id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{registration.name}</h4>
                        <p className="text-sm text-gray-500 font-mono">{registration.registrationId}</p>
                      </div>
                      {getStatusBadge(registration.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{registration.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{registration.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {registration.numberOfAttendees} {registration.numberOfAttendees === 1 ? 'Attendee' : 'Attendees'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {new Date(registration.registeredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {!registration.confirmationSent && (
                      <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-3 h-3" />
                        <span>Confirmation email not sent</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
