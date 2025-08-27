import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Download, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { makeAuthenticatedRequest, handleApiError } from '../../utils/auth';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  raised: number;
  donors: number;
  image: string;
  category: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface CampaignFormData {
  title: string;
  description: string;
  target: number;
  image: string;
  category: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'completed';
}

export const CampaignsManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    target: 50000,
    image: '',
    category: 'General',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching campaigns...');
      
      const response = await makeAuthenticatedRequest('/api/consolidated?endpoint=campaigns');
      
      console.log('📡 Campaigns response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Campaigns data received:', data);
        
        // Ensure all campaigns have required properties and normalize id field
        const validatedCampaigns = data.map((campaign: any) => ({
          ...campaign,
          id: campaign._id || campaign.id, // Use _id from MongoDB, fallback to id
          raised: campaign.raised || 0,
          target: campaign.target || 0,
          donors: campaign.donors || 0,
          title: campaign.title || 'Untitled Campaign',
          description: campaign.description || '',
          category: campaign.category || 'General',
          status: campaign.status || 'active'
        }));
        setCampaigns(validatedCampaigns);
      } else {
        const errorMessage = handleApiError(response);
        console.error('❌ Failed to fetch campaigns:', errorMessage);
        toast.error(errorMessage);
        setCampaigns([]); // Set empty array on error
      }
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      toast.error(error instanceof Error ? error.message : 'Error fetching campaigns');
      setCampaigns([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/consolidated?endpoint=campaigns', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newCampaign = await response.json();
        // Normalize the id field
        newCampaign.id = newCampaign._id || newCampaign.id;
        setCampaigns(prev => [newCampaign, ...prev]);
        setShowForm(false);
        resetForm();
        toast.success('Campaign created successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create campaign: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return;

    try {
      const response = await makeAuthenticatedRequest(`/api/consolidated?endpoint=campaigns&id=${editingCampaign.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Create updated campaign object with normalized id
        const updatedCampaign = {
          ...editingCampaign,
          ...formData,
          updatedAt: new Date().toISOString()
        };
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === editingCampaign.id ? updatedCampaign : campaign
        ));
        setShowForm(false);
        setEditingCampaign(undefined);
        resetForm();
        toast.success('Campaign updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update campaign: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const response = await makeAuthenticatedRequest(`/api/consolidated?endpoint=campaigns&id=${campaignId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
          toast.success('Campaign deleted successfully!');
        } else {
          const errorData = await response.json();
          toast.error(`Failed to delete campaign: ${errorData.error || errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('Failed to delete campaign');
      }
    }
  };

  const exportCampaignData = () => {
    const csvContent = [
      ['Campaign Title', 'Target', 'Raised', 'Percentage', 'Donors', 'Category', 'Status', 'Start Date', 'End Date'],
      ...filteredCampaigns.map(campaign => [
        campaign.title,
        campaign.target,
        campaign.raised,
        `${Math.round((campaign.raised / campaign.target) * 100)}%`,
        campaign.donors,
        campaign.category,
        campaign.status,
        new Date(campaign.startDate).toLocaleDateString(),
        campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Campaign data exported successfully!');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target: 50000,
      image: '',
      category: 'General',
      startDate: '',
      endDate: '',
      status: 'active'
    });
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      target: campaign.target,
      image: campaign.image,
      category: campaign.category,
      startDate: campaign.startDate.split('T')[0],
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      status: campaign.status
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingCampaign(undefined);
    resetForm();
    setShowForm(true);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRaised = campaigns.reduce((sum, campaign) => sum + (campaign.raised || 0), 0);
  const totalTarget = campaigns.reduce((sum, campaign) => sum + (campaign.target || 0), 0);
  const totalDonors = campaigns.reduce((sum, campaign) => sum + (campaign.donors || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Loading campaigns...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage fundraising campaigns and view donation statistics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportCampaignData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Raised</p>
              <p className="text-2xl font-bold text-gray-900">₹{(totalRaised || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900">{totalDonors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0}%
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
              placeholder="Search campaigns..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredCampaigns.length} campaigns
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id || `campaign-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full h-48 object-cover"
            />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                  {campaign.category}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {campaign.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {campaign.description}
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    ₹{(campaign.raised || 0).toLocaleString()} / ₹{(campaign.target || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((campaign.raised || 0) / (campaign.target || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{Math.round(((campaign.raised || 0) / (campaign.target || 1)) * 100)}% funded</span>
                  <span>{campaign.donors || 0} donors</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCampaign(campaign)}
                  className="flex-1 text-orange-600 hover:text-orange-900 text-sm font-medium py-2 px-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleEdit(campaign)}
                  className="flex-1 text-yellow-600 hover:text-yellow-900 text-sm font-medium py-2 px-3 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  className="flex-1 text-red-600 hover:text-red-900 text-sm font-medium py-2 px-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Found</h3>
          <p className="text-gray-600 mb-4">
            {campaigns.length === 0 
              ? "No campaigns have been created yet. Create your first campaign!"
              : "No campaigns match your current filters. Try adjusting your search or filters."}
          </p>
          {campaigns.length === 0 && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Campaign
            </button>
          )}
        </div>
      )}

      {/* Campaign Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCampaign(undefined);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  editingCampaign ? handleUpdateCampaign() : handleCreateCampaign();
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter campaign title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Enter campaign description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Amount (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1000"
                        value={formData.target}
                        onChange={(e) => setFormData(prev => ({ ...prev, target: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="50000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="General">General</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Environment">Environment</option>
                        <option value="Emergency Relief">Emergency Relief</option>
                        <option value="Community Development">Community Development</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'completed' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingCampaign(undefined);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                    >
                      {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Campaign Detail Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <img
                  src={selectedCampaign.image}
                  alt={selectedCampaign.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded">
                    {selectedCampaign.category}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded ${
                    selectedCampaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedCampaign.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedCampaign.status}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedCampaign.title}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  {selectedCampaign.description}
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Target Amount</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{(selectedCampaign.target || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Amount Raised</span>
                      <span className="text-lg font-semibold text-green-600">
                        ₹{(selectedCampaign.raised || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Total Donors</span>
                      <span className="text-lg font-semibold text-orange-600">
                        {selectedCampaign.donors || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Progress</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {Math.round((selectedCampaign.raised / selectedCampaign.target) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((selectedCampaign.raised / selectedCampaign.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Start: {new Date(selectedCampaign.startDate).toLocaleDateString()}</span>
                      {selectedCampaign.endDate && (
                        <span>End: {new Date(selectedCampaign.endDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

