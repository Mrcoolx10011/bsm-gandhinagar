import React, { useState, useEffect } from 'react';
import { Heart, DollarSign, CreditCard, Smartphone, QrCode, Users, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Define interfaces
interface RecentDonor {
  id: string;
  name: string;
  amount: number;
  date: string;
  campaign: string;
  isAnonymous: boolean;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  endDate: string;
  isActive: boolean;
}

interface DonationFormData {
  donorName: string;
  email: string;
  phone: string;
  amount: number;
  campaign: string;
  paymentMethod: string;
  isAnonymous: boolean;
  message: string;
}

const donationAmounts = [25, 50, 100, 250, 500, 1000];

export const Donations: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedCampaign, setSelectedCampaign] = useState('Education for All');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  
  const [formData, setFormData] = useState<DonationFormData>({
    donorName: '',
    email: '',
    phone: '',
    amount: 0,
    campaign: 'Education for All',
    paymentMethod: 'card',
    isAnonymous: false,
    message: ''
  });

  const totalAmount = selectedAmount || parseFloat(customAmount) || 0;

  // Fetch recent completed donations
  const fetchRecentDonors = async () => {
    try {
      setLoadingDonors(true);
      const response = await fetch('/api/consolidated?endpoint=donations&recent=true');
      
      if (response.ok) {
        const recentCompletedDonors = await response.json();
        setRecentDonors(recentCompletedDonors);
      } else {
        console.error('Failed to fetch recent donors:', response.status);
      }
    } catch (error) {
      console.error('Error fetching recent donors:', error);
    } finally {
      setLoadingDonors(false);
    }
  };

  // Fetch active campaigns with real donation data
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await fetch('/api/consolidated?endpoint=campaigns&active=true');
      
      if (response.ok) {
        const campaignsData = await response.json();
        setCampaigns(campaignsData);
        console.log('Fetched campaigns:', campaignsData);
      } else {
        console.error('Failed to fetch campaigns:', response.status);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchRecentDonors();
    fetchCampaigns();
  }, []);

  // Helper function to format time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const donationDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - donationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return donationDate.toLocaleDateString();
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    setFormData(prev => ({ ...prev, amount: parseFloat(value) || 0 }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProceedToDonate = () => {
    if (totalAmount === 0) {
      toast.error('Please select or enter a donation amount');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      amount: totalAmount,
      campaign: selectedCampaign,
      paymentMethod
    }));
    setShowDonationForm(true);
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.donorName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/consolidated?endpoint=donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorName: formData.isAnonymous ? 'Anonymous' : formData.donorName,
          email: formData.email,
          phone: formData.phone,
          amount: formData.amount,
          campaign: formData.campaign,
          paymentMethod: formData.paymentMethod,
          isAnonymous: formData.isAnonymous,
          message: formData.message
        }),
      });

      if (response.ok) {
        await response.json();
        
        setShowDonationForm(false);
        setShowSuccessModal(true);
        toast.success('Donation successful! Thank you for your contribution.');
        
        fetchRecentDonors();
        
        setFormData({
          donorName: '',
          email: '',
          phone: '',
          amount: 0,
          campaign: 'Education for All',
          paymentMethod: 'card',
          isAnonymous: false,
          message: ''
        });
        setSelectedAmount(null);
        setCustomAmount('');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to process donation: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCampaignDonate = (campaignTitle: string) => {
    setSelectedCampaign(campaignTitle);
    setSelectedAmount(100);
    setFormData(prev => ({ ...prev, amount: 100, campaign: campaignTitle }));
    setShowDonationForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Make a Donation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your contribution helps us continue our mission of creating positive change in the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Choose Donation Amount
              </h2>

              {/* Campaign Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Campaign
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.title}>
                      {campaign.title}
                    </option>
                  ))}
                  <option value="General Fund">General Fund</option>
                </select>
              </div>

              {/* Preset Amounts */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {donationAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedAmount === amount
                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl font-bold">₹{amount}</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-600"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span>Credit/Debit Card</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-600"
                    />
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <span>UPI/Digital Wallet</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-600"
                    />
                    <QrCode className="w-5 h-5 text-gray-600" />
                    <span>QR Code</span>
                  </label>
                </div>
              </div>

              {/* QR Code Display */}
              {paymentMethod === 'qr' && (
                <div className="mb-6 text-center animate-fade-in">
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <div className="w-48 h-48 bg-white mx-auto mb-4 flex items-center justify-center border-2 border-gray-300 rounded-lg">
                      <QrCode className="w-32 h-32 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your payment app
                    </p>
                  </div>
                </div>
              )}

              {/* Donation Summary */}
              {totalAmount > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      Campaign:
                    </span>
                    <span className="text-lg text-gray-700">{selectedCampaign}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Donation:
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{totalAmount}
                    </span>
                  </div>
                </div>
              )}

              {/* Donate Button */}
              <button
                disabled={totalAmount === 0}
                onClick={handleProceedToDonate}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  totalAmount > 0
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Proceed to Donate
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impact Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Your Impact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">₹25</div>
                    <div className="text-sm text-gray-600">Feeds 5 children for a day</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">₹50</div>
                    <div className="text-sm text-gray-600">Provides medical care for 1 person</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">₹100</div>
                    <div className="text-sm text-gray-600">Sponsors education for 1 month</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Donors */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Donors
              </h3>
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-3 pr-2">
                  {loadingDonors ? (
                    <div className="text-center text-gray-500 py-4">
                      Loading recent donors...
                    </div>
                  ) : recentDonors.length > 0 ? (
                    recentDonors.slice(0, 10).map((donor) => (
                      <div key={donor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900">
                            {donor.isAnonymous ? 'Anonymous' : donor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getTimeAgo(donor.date)}
                          </div>
                        </div>
                        <div className="font-semibold text-orange-600">
                          ₹{donor.amount.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No recent donations yet
                    </div>
                  )}
                </div>
                {recentDonors.length > 10 && (
                  <div className="text-center mt-3 text-sm text-gray-500">
                    Showing 10 of {recentDonors.length} recent donations
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Active Campaigns
          </h2>
          
          {loadingCampaigns ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading campaigns...</p>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in"
                >
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {campaign.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {campaign.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Raised: ₹{campaign.raisedAmount?.toLocaleString() || 0}</span>
                        <span>Goal: ₹{campaign.goalAmount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{campaign.donorCount || 0} donors</span>
                        <span>{Math.round((campaign.raisedAmount / campaign.goalAmount) * 100)}% funded</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCampaignDonate(campaign.title)}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Donate Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No active campaigns available at the moment.</p>
            </div>
          )}
        </div>

        {/* Donation Form Modal */}
        {showDonationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Complete Your Donation
                </h3>
                
                <form onSubmit={handleSubmitDonation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="donorName"
                      value={formData.donorName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={handleFormChange}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Make this donation anonymous</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-orange-600">₹{formData.amount}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowDonationForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Donate Now'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-6">
                Your donation has been processed successfully. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
