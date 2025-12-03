import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const updates = [
  {
    id: 1,
    date: 'August 1, 2025',
    category: 'Cultural',
    title: 'Janmashtami Celebration 2025',
    description: 'Join us for a grand celebration of Lord Krishna\'s birthday with traditional dance, music, and prasadam distribution.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80',
    link: '/events'
  },
  {
    id: 2,
    date: 'July 28, 2025',
    category: 'Announcement',
    title: 'New Youth Leadership Program',
    description: 'We are launching a comprehensive leadership development program for youth aged 16-25 from Bihar and Purvanchal.',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=400&q=80',
    link: '/about'
  },
  {
    id: 3,
    date: 'July 25, 2025',
    category: 'Event',
    title: 'Medical Camp Success',
    description: 'Our recent medical camp in Patna successfully provided free health checkups to over 500 community members.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80',
    link: '/posts'
  },
  {
    id: 4,
    date: 'July 20, 2025',
    category: 'Media',
    title: 'Featured in Local News',
    description: 'Bihar Purvanchal Samaj\'s community service efforts were highlighted in Dainik Jagran for our education initiatives.',
    image: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=400&q=80',
    link: '/media'
  },
  {
    id: 5,
    date: 'July 15, 2025',
    category: 'Cultural',
    title: 'Folk Dance Workshop',
    description: 'Traditional Bhojpuri and Maithili dance workshop conducted by renowned artists from Bihar.',
    image: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=400&q=80',
    link: '/events'
  }
];

const categoryColors = {
  'Cultural': 'bg-orange-100 text-orange-700',
  'Announcement': 'bg-orange-100 text-orange-700',
  'Event': 'bg-green-100 text-green-700',
  'Media': 'bg-purple-100 text-purple-700'
};

export const LatestUpdates: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, updates.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const visibleUpdates = updates.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Updates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay connected with our recent activities, announcements, and community news
          </p>
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          {updates.length > itemsPerView && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}

          {/* Updates Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {visibleUpdates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={update.image}
                    alt={update.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[update.category as keyof typeof categoryColors]}`}>
                      {update.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    {update.date}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                    {update.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {update.description}
                  </p>
                  
                  <a
                    href={update.link}
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-300"
                  >
                    Read Latest Updates
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Dots */}
          {updates.length > itemsPerView && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-orange-500 w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

