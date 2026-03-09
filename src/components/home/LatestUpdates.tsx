import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, ExternalLink, FileText } from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  content?: string;
  image?: string;
  category: string;
  featured: boolean;
  author?: string;
  createdAt: string;
  likes: number;
  views: number;
}

const categoryColors: Record<string, string> = {
  'general':   'bg-orange-100 text-orange-700',
  'news':      'bg-blue-100 text-blue-700',
  'events':    'bg-green-100 text-green-700',
  'community': 'bg-purple-100 text-purple-700',
  'updates':   'bg-yellow-100 text-yellow-700',
};

const getCategoryColor = (cat: string) =>
  categoryColors[cat?.toLowerCase()] || 'bg-orange-100 text-orange-700';

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const stripHtml = (html: string) =>
  html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '';

export const LatestUpdates: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/consolidated?endpoint=posts');
        if (res.ok) {
          const data: Post[] = await res.json();
          // Sort by newest first, take up to 6
          const sorted = [...data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPosts(sorted.slice(0, 6));
        }
      } catch {
        // silently fail â€” section just won't show
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, posts.length - itemsPerView);
  const nextSlide = () => setCurrentIndex((p) => (p >= maxIndex ? 0 : p + 1));
  const prevSlide = () => setCurrentIndex((p) => (p <= 0 ? maxIndex : p - 1));
  const visiblePosts = posts.slice(currentIndex, currentIndex + itemsPerView);

  if (!loading && posts.length === 0) return null;

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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Loading updates...</span>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            {posts.length > itemsPerView && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}

            {/* Cards Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {visiblePosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-orange-50 flex-shrink-0">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const ph = img.nextElementSibling as HTMLElement;
                          if (ph) ph.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100"
                      style={{ display: post.image ? 'none' : 'flex' }}
                    >
                      <FileText className="w-10 h-10 text-orange-300 mb-2" />
                      <p className="text-xs text-orange-400 font-medium">No Image</p>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      {formatDate(post.createdAt)}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {stripHtml(post.content || '')}
                    </p>

                    <a
                      href={`/posts/${post._id}`}
                      className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-300"
                    >
                      Read More
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination Dots */}
            {posts.length > itemsPerView && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-orange-500 w-6'
                        : 'bg-gray-300 hover:bg-gray-400 w-2'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* View All link */}
            <div className="text-center mt-8">
              <a
                href="/posts"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View All Updates
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
