import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
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

export const FeaturedEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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
  return (
    <section className="py-20 bg-gray-50">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded">
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
                
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                  <span>Learn More</span>
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
                className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                <span>View All Events</span>
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};