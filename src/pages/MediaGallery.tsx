import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Video, 
  Newspaper, 
  Play, 
  Calendar,
  Eye,
  ExternalLink,
  ImageIcon,
  Clock
} from 'lucide-react';
import { mediaGalleryContent } from '../data/mediaGalleryContent';

const MediaGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'press'>('photos');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50">
      {/* Hero Section */}
      <motion.section 
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {mediaGalleryContent.hero.title}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-4 text-orange-100"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {mediaGalleryContent.hero.subtitle}
          </motion.p>
          <motion.p 
            className="text-lg max-w-3xl mx-auto text-orange-100"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {mediaGalleryContent.hero.description}
          </motion.p>
        </div>
      </motion.section>

      {/* Navigation Tabs */}
      <motion.section 
        className="bg-white shadow-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center space-x-4 py-6">
            {[
              { id: 'photos', label: 'Photos', icon: Camera },
              { id: 'videos', label: 'Videos', icon: Video },
              { id: 'press', label: 'Press Coverage', icon: Newspaper }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Statistics */}
      <motion.section 
        className="py-12 bg-white"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Photos', value: mediaGalleryContent.statistics.totalPhotos, icon: ImageIcon },
              { label: 'Videos', value: mediaGalleryContent.statistics.totalVideos, icon: Video },
              { label: 'Press Features', value: mediaGalleryContent.statistics.pressFeatures, icon: Newspaper },
              { label: 'Years Active', value: mediaGalleryContent.statistics.yearsActive, icon: Calendar }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}+</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Photos Section */}
        {activeTab === 'photos' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {mediaGalleryContent.photos.intro}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mediaGalleryContent.photos.albums.map((album) => (
                <motion.div
                  key={album.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={album.imageUrl}
                      alt={`${album.title} - ${album.category} - Bihar Sanskritik Mandal - ${album.photoCount} photos`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {album.category}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        {album.photoCount} photos
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{album.title}</h3>
                    <p className="text-gray-600 mb-4">{album.description}</p>
                    <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center">
                      <Eye className="w-4 h-4 mr-2" />
                      View Album
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Videos Section */}
        {activeTab === 'videos' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Video Collection</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {mediaGalleryContent.videos.intro}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mediaGalleryContent.videos.categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.thumbnail}
                      alt={`${category.title} - Bihar Sanskritik Mandal video collection - ${category.videoCount} videos - ${category.duration}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                        {category.videoCount} videos
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {category.duration}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {category.features.map((feature, idx) => (
                        <span key={idx} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Videos
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Press Coverage Section */}
        {activeTab === 'press' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Press Coverage</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {mediaGalleryContent.pressCoverage.intro}
              </p>
            </div>

            <div className="space-y-6">
              {mediaGalleryContent.pressCoverage.articles.map((article) => (
                <motion.div
                  key={article.id}
                  variants={itemVariants}
                  className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${
                    article.featured ? 'ring-2 ring-orange-200' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold text-orange-600">{article.publication}</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {article.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {article.readTime}
                        </span>
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        {article.featured && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="mt-4 md:mt-0 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read Article
                    </button>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{article.summary}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;
