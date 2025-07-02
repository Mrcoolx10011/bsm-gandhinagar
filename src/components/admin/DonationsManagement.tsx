import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, DollarSign, TrendingUp, Calendar, Filter, Plus, Edit, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { makeAuthenticatedRequest, handleApiError } from '../../utils/auth';

interface Donation {
  id: string;
  donorName: string;
  email: string;
  phone: string;
  amount: number;
  campaign: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  approved: boolean;
  isAnonymous: boolean;
  message: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DonationsManagement: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [viewingDonation, setViewingDonation] = useState<Donation | null>(null);
  const [formData, setFormData] = useState({
    donorName: '',
    email: '',
    phone: '',
    amount: '',
    campaign: '',
    paymentMethod: 'upi',
    isAnonymous: false,
    approved: false,
    message: '',
    status: 'pending'
  });

  // Helper function to format dates safely
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString();
  };

  // Helper function to format dates with time safely
  const formatDateTime = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  };

  // Fetch donations from API
  const fetchDonations = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching donations...');
      
      const response = await makeAuthenticatedRequest('/api/donations');
      
      console.log('📡 Donations response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Donations data received:', data);
        setDonations(data);
      } else {
        const errorMessage = handleApiError(response);
        console.error('❌ Failed to fetch donations:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error fetching donations:', error);
      toast.error(error instanceof Error ? error.message : 'Error fetching donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Create or update donation
  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDonation ? `/api/donations?id=${editingDonation.id}` : '/api/donations';
      const method = editingDonation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      });

      if (response.ok) {
        const savedDonation = await response.json();
        if (editingDonation) {
          setDonations(donations.map(d => d.id === editingDonation.id ? savedDonation : d));
          toast.success('Donation updated successfully');
        } else {
          setDonations([savedDonation, ...donations]);
          toast.success('Donation created successfully');
        }
        setShowDonationModal(false);
        setEditingDonation(null);
        resetForm();
      } else {
        toast.error('Failed to save donation');
      }
    } catch (error) {
      console.error('Error saving donation:', error);
      toast.error('Error saving donation');
    }
  };

  // Delete donation
  const handleDeleteDonation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/donations?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setDonations(donations.filter(d => d.id !== id));
        toast.success('Donation deleted successfully');
      } else {
        toast.error('Failed to delete donation');
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      toast.error('Error deleting donation');
    }
  };

  // Update donation status
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/donations?id=${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        setDonations(donations.map(d => d.id === id ? updatedDonation : d));
        toast.success('Donation status updated');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  // Update donation approval status
  const handleToggleApproval = async (id: string, currentApproval: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/donations?id=${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: !currentApproval }),
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        setDonations(donations.map(d => d.id === id ? updatedDonation : d));
        toast.success(`Donation ${!currentApproval ? 'approved' : 'disapproved'} successfully`);
      } else {
        toast.error('Failed to update approval status');
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error('Error updating approval status');
    }
  };

  // Open edit modal
  const handleEditDonation = (donation: Donation) => {
    setEditingDonation(donation);
    setFormData({
      donorName: donation.donorName,
      email: donation.email,
      phone: donation.phone || '',
      amount: donation.amount.toString(),
      campaign: donation.campaign,
      paymentMethod: donation.paymentMethod,
      isAnonymous: donation.isAnonymous,
      approved: donation.approved || false,
      message: donation.message || '',
      status: donation.status
    });
    setShowDonationModal(true);
  };

  // Open view modal
  const handleViewDonation = (donation: Donation) => {
    setViewingDonation(donation);
    setShowViewModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      donorName: '',
      email: '',
      phone: '',
      amount: '',
      campaign: '',
      paymentMethod: 'upi',
      isAnonymous: false,
      approved: false,
      message: '',
      status: 'pending'
    });
  };

  // Open create modal
  const handleCreateDonation = () => {
    setEditingDonation(null);
    resetForm();
    setShowDonationModal(true);
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.campaign.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || 
                          (approvalFilter === 'approved' && donation.approved) || 
                          (approvalFilter === 'pending' && !donation.approved);
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const totalDonations = donations.reduce((sum, donation) => 
    donation.status === 'completed' && donation.approved ? sum + donation.amount : sum, 0
  );
  const approvedDonations = donations.filter(d => d.approved).length;
  const pendingApproval = donations.filter(d => !d.approved).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage all donations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleCreateDonation}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Donation
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
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
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalDonations.toLocaleString()}</p>
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
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedDonations}</p>
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
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{pendingApproval}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Approvals</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredDonations.length} donations
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation, index) => (
                <motion.tr
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                      </div>
                      {!donation.isAnonymous && (
                        <div className="text-sm text-gray-500">{donation.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{(donation.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {donation.campaign}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {donation.paymentMethod.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(donation.date || donation.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        donation.approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donation.approved ? 'Approved' : 'Pending'}
                      </span>
                      <button
                        onClick={() => handleToggleApproval(donation.id, donation.approved)}
                        className={`px-2 py-1 text-xs rounded ${
                          donation.approved
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } transition-colors`}
                        title={donation.approved ? 'Disapprove' : 'Approve'}
                      >
                        {donation.approved ? 'Disapprove' : 'Approve'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDonation(donation)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditDonation(donation)}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="Edit Donation"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDonation(donation.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Donation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDonation ? 'Edit Donation' : 'Add New Donation'}
              </h3>
              <button
                onClick={() => {
                  setShowDonationModal(false);
                  setEditingDonation(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveDonation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Donor Name</label>
                <input
                  type="text"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={formData.isAnonymous}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={formData.isAnonymous}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Campaign</label>
                <select
                  value={formData.campaign}
                  onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Campaign</option>
                  <option value="Education Support">Education Support</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Food Distribution">Food Distribution</option>
                  <option value="Emergency Relief">Emergency Relief</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
                  Anonymous Donation
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="approved"
                  checked={formData.approved}
                  onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="approved" className="ml-2 block text-sm text-gray-900">
                  Approved for Frontend Display
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Optional message from donor"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDonationModal(false);
                    setEditingDonation(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  {editingDonation ? 'Update' : 'Create'} Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Donation Modal */}
      {showViewModal && viewingDonation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Donation Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingDonation(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Donor Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingDonation.isAnonymous ? 'Anonymous' : viewingDonation.donorName}
                </p>
              </div>

              {!viewingDonation.isAnonymous && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingDonation.email}</p>
                  </div>

                  {viewingDonation.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingDonation.phone}</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-sm text-gray-900 font-semibold">₹{viewingDonation.amount.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Campaign</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDonation.campaign}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDonation.paymentMethod.toUpperCase()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{viewingDonation.transactionId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(viewingDonation.status)}`}>
                  {viewingDonation.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(viewingDonation.date || viewingDonation.createdAt)}</p>
              </div>

              {viewingDonation.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingDonation.message}</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(viewingDonation.id, 'completed')}
                    className="px-3 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                    disabled={viewingDonation.status === 'completed'}
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(viewingDonation.id, 'failed')}
                    className="px-3 py-1 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                    disabled={viewingDonation.status === 'failed'}
                  >
                    Mark Failed
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingDonation(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};