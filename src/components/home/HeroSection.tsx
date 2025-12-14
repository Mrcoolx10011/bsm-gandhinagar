import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users, Heart, Calendar } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=1920&h=1080&q=80',
    title: 'बिहार संस्कृतिक मंडल',
    subtitle: 'संस्कृति की पहचान, बिहार और पूर्वांचल की शान',
    englishSubtitle: 'Folk Dance & Cultural Heritage',
    cta: 'Join Us',
    ctaLink: '/members'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1920&h=1080&q=80',
    title: 'भारतीय त्योहार',
    subtitle: 'संस्कृति की पहचान, बिहार और पूर्वांचल की शान',
    englishSubtitle: 'Indian Festivals & Celebrations',
    cta: 'Donate Now',
    ctaLink: '/donations'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1920&h=1080&q=80',
    title: 'ग्रामीण भारत उत्सव',
    subtitle: 'संस्कृति की पहचान, बिहार और पूर्वांचल की शान',
    englishSubtitle: 'Rural India Celebrations',
    cta: 'View Events',
    ctaLink: '/events'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1920&h=1080&q=80',
    title: 'सेवा कार्य',
    subtitle: 'संस्कृति की पहचान, बिहार और पूर्वांचल की शान',
    englishSubtitle: 'Volunteer India & Community Service',
    cta: 'Get Involved',
    ctaLink: '/contact'
  }
];

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.h1
            key={`title-${currentSlide}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-7xl font-bold mb-4"
            style={{ fontFamily: 'serif' }}
          >
            {slides[currentSlide].title}
          </motion.h1>
          
          <motion.div
            key={`subtitle-${currentSlide}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-6"
          >
            <p 
              className="text-2xl md:text-4xl font-semibold text-orange-300 mb-2"
              style={{ fontFamily: 'serif' }}
            >
              {slides[currentSlide].subtitle}
            </p>
            <p className="text-lg md:text-xl text-orange-100">
              {slides[currentSlide].englishSubtitle}
            </p>
          </motion.div>

          <motion.div
            key={`cta-${currentSlide}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href={slides[currentSlide].ctaLink}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Heart className="w-5 h-5" />
              <span>{slides[currentSlide].cta}</span>
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronLeft className="w-6 h-6" aria-hidden="true" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronRight className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2" role="group" aria-label="Slide navigation">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold">2,500+</div>
                <div className="text-sm text-gray-300">Active Members</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Calendar className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold">200+</div>
                <div className="text-sm text-gray-300">Cultural Events</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Heart className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold">37+</div>
                <div className="text-sm text-gray-300">Years of Service</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};