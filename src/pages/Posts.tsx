import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Eye, Heart, Tag, Search, Filter, ChevronLeft, ChevronRight, Share2, Copy, Facebook, Twitter, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCampaignImageAlt } from '../utils/seo';

interface Post {
  _id: string;
  title: string;
  content?: string;
  image?: string;
  category: string;
  featured: boolean;
  author?: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
}

export const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'news', label: 'News' },
    { value: 'events', label: 'Events' },
    { value: 'community', label: 'Community' },
    { value: 'updates', label: 'Updates' }
  ];

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/consolidated?endpoint=posts');
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data);
        setFeaturedPosts(data.filter((post: Post) => post.featured));
      } else {
        toast.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // SEO: Update page title
  useEffect(() => {
    document.title = 'Posts & Updates | Bihar Sanskritik Mandal Gandhinagar';
    return () => {
      document.title = 'Bihar Sanskritik Mandal Gandhinagar';
    };
  }, []);

  // SEO: Update title when viewing a specific post
  useEffect(() => {
    if (selectedPost) {
      document.title = `${selectedPost.title} | Bihar Sanskritik Mandal`;
    } else {
      document.title = 'Posts & Updates | Bihar Sanskritik Mandal Gandhinagar';
    }
  }, [selectedPost]);

  // Auto-slide for featured posts
  useEffect(() => {
    if (featuredPosts.length > 1) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prev) => 
          prev === featuredPosts.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredPosts.length]);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle post click
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    // Increment view count when post is opened
    handleView(post._id);
  };

  // Handle like post
  const handleLike = async (postId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent opening the post modal
    }
    
    try {
      const response = await fetch(`/api/consolidated?endpoint=posts&action=like&id=${postId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update the local posts state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, likes: data.likes }
              : post
          )
        );
        setFeaturedPosts(prevFeatured =>
          prevFeatured.map(post =>
            post._id === postId
              ? { ...post, likes: data.likes }
              : post
          )
        );
        // Update selected post if it's currently open
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(prev => prev ? { ...prev, likes: data.likes } : null);
        }
        toast.success('Post liked! ❤️');
      } else {
        toast.error('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  // Handle view post
  const handleView = async (postId: string) => {
    try {
      const response = await fetch(`/api/consolidated?endpoint=posts&action=view&id=${postId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update the local posts state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, views: data.views }
              : post
          )
        );
        setFeaturedPosts(prevFeatured =>
          prevFeatured.map(post =>
            post._id === postId
              ? { ...post, views: data.views }
              : post
          )
        );
        // Update selected post if it's currently open
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(prev => prev ? { ...prev, views: data.views } : null);
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Navigate featured posts
  const nextFeatured = () => {
    setCurrentFeaturedIndex((prev) => 
      prev === featuredPosts.length - 1 ? 0 : prev + 1
    );
  };

  const prevFeatured = () => {
    setCurrentFeaturedIndex((prev) => 
      prev === 0 ? featuredPosts.length - 1 : prev - 1
    );
  };

  // Handle share post
  const handleShare = (post: Post, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent opening the post modal
    }
    setSharingPost(post);
    setShowShareModal(true);
  };

  // Copy post link to clipboard
  const copyPostLink = async (post: Post) => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success('Post link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  // Share on social media
  const shareOnSocial = (platform: string, post: Post) => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    const text = `Check out this post: ${post.title}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${postUrl}`)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Hero Section with Featured Posts Slider */}
      {featuredPosts.length > 0 && (
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeaturedIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"
              style={{
                backgroundImage: `url(${featuredPosts[currentFeaturedIndex]?.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="max-w-2xl"
                  >
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-600 text-white mb-4">
                      <Tag size={12} className="mr-1" />
                      {categories.find(c => c.value === featuredPosts[currentFeaturedIndex]?.category)?.label}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                      {featuredPosts[currentFeaturedIndex]?.title}
                    </h1>
                    <p className="text-xl text-gray-200 mb-6 line-clamp-3">
                      {featuredPosts[currentFeaturedIndex]?.content || 'No content available'}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePostClick(featuredPosts[currentFeaturedIndex])}
                      className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Read Full Post
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {featuredPosts.length > 1 && (
            <>
              <button
                onClick={prevFeatured}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextFeatured}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {featuredPosts.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {featuredPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeaturedIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentFeaturedIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Posts</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest news, events, and community updates
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group"
                onClick={() => handlePostClick(post)}
              >
                {post.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={getCampaignImageAlt(post.title, categories.find(c => c.value === post.category)?.label || post.category)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <Tag size={10} className="mr-1" />
                      {categories.find(c => c.value === post.category)?.label}
                    </span>
                    {post.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content || 'No content available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        {post.views || 0}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleLike(post._id, e)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                        title="Like this post"
                      >
                        <Heart size={14} fill="currentColor" />
                        {post.likes || 0}
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleShare(post, e)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Share post"
                      >
                        <Share2 size={16} />
                      </motion.button>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedPost.image && (
                <div className="h-64 md:h-80 overflow-hidden">
                  <img
                    src={selectedPost.image}
                    alt={getCampaignImageAlt(selectedPost.title, categories.find(c => c.value === selectedPost.category)?.label || selectedPost.category)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    <Tag size={12} className="mr-1" />
                    {categories.find(c => c.value === selectedPost.category)?.label}
                  </span>
                  {selectedPost.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedPost.title}
                </h1>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    {selectedPost.views || 0} views
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(selectedPost._id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                    title="Like this post"
                  >
                    <Heart size={14} fill="currentColor" />
                    {selectedPost.likes || 0} likes
                  </motion.button>
                  <span>by {selectedPost.author || 'Unknown'}</span>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedPost.content || 'No content available'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare(selectedPost)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Share2 size={16} />
                    Share Post
                  </motion.button>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && sharingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Share Post</h2>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setSharingPost(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  {sharingPost.image && (
                    <img
                      src={sharingPost.image}
                      alt={getCampaignImageAlt(sharingPost.title, categories.find(c => c.value === sharingPost.category)?.label || sharingPost.category)}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{sharingPost.title}</h3>
                    <p className="text-sm text-gray-500">
                      {sharingPost.content ? sharingPost.content.substring(0, 60) + '...' : 'No content available'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Copy Link */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyPostLink(sharingPost)}
                  className="w-full flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-700">Copy Link</span>
                </motion.button>

                {/* Social Media Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => shareOnSocial('facebook', sharingPost)}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Facebook size={18} />
                    <span className="font-medium">Facebook</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => shareOnSocial('twitter', sharingPost)}
                    className="flex items-center justify-center gap-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <Twitter size={18} />
                    <span className="font-medium">Twitter</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => shareOnSocial('whatsapp', sharingPost)}
                    className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span className="font-medium">WhatsApp</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => shareOnSocial('telegram', sharingPost)}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span className="font-medium">Telegram</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

