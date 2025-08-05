import React, { useState } from 'react';
import { Search, Eye, Reply, Archive, MessageSquare, Clock, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStore, Inquiry } from '../../store/adminStore';
import toast from 'react-hot-toast';

export const InquiriesManagement: React.FC = () => {
  const { inquiries, updateInquiry, deleteInquiry } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  const repliedInquiries = inquiries.filter(i => i.status === 'replied').length;
  const archivedInquiries = inquiries.filter(i => i.status === 'archived').length;

  const handleReply = (inquiry: Inquiry) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    updateInquiry(inquiry.id, {
      status: 'replied',
      response: replyText,
      respondedAt: new Date().toISOString()
    });

    toast.success('Reply sent successfully!');
    setReplyText('');
    setSelectedInquiry(null);
  };

  const handleArchive = (id: string) => {
    updateInquiry(id, { status: 'archived' });
    toast.success('Inquiry archived successfully!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      deleteInquiry(id);
      toast.success('Inquiry deleted successfully!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-orange-100 text-orange-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and respond to user inquiries
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{newInquiries}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Replied</p>
              <p className="text-2xl font-bold text-gray-900">{repliedInquiries}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Archived</p>
              <p className="text-2xl font-bold text-gray-900">{archivedInquiries}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search inquiries..."
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
            <option value="new">New</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredInquiries.length} inquiries
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredInquiries.map((inquiry, index) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {inquiry.subject}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(inquiry.priority)}`}>
                      {inquiry.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>{inquiry.name}</span>
                    <span>{inquiry.email}</span>
                    <span>{new Date(inquiry.date).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-gray-700 line-clamp-2">
                    {inquiry.message}
                  </p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInquiry(inquiry);
                    }}
                    className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(inquiry.id);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Inquiry Details</h2>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedInquiry.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedInquiry.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="text-sm text-gray-900">{new Date(selectedInquiry.date).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.subject}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInquiry.message}</p>
                  </div>

                  {selectedInquiry.response && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Previous Response</label>
                      <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg">{selectedInquiry.response}</p>
                    </div>
                  )}
                </div>

                {selectedInquiry.status !== 'replied' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Type your reply here..."
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  {selectedInquiry.status !== 'replied' && (
                    <button
                      onClick={() => handleReply(selectedInquiry)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Send Reply</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleArchive(selectedInquiry.id);
                      setSelectedInquiry(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedInquiry.id);
                      setSelectedInquiry(null);
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

