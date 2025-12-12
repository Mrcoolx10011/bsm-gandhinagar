import React, { useState, useEffect } from 'react';
import { Heart, Smartphone, QrCode, Users, Target, TrendingUp, CheckCircle, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  loadRazorpayScript, 
  createRazorpayOrder, 
  verifyRazorpayPayment,
  initiateRazorpayPayment,
  generateUpiQrCode
} from '../lib/razorpay';

const donationAmounts = [25, 50, 100, 250, 500, 1000];

interface Campaign {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  target: number;
  raised: number;
  donors: number;
  image: string;
  category?: string;
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
  upiId?: string; // Optional: user's UPI ID for collect request
}

interface RecentDonor {
  id: string;
  donorName: string;
  amount: number;
  createdAt: string; // Changed from 'date' to match backend field
  isAnonymous: boolean;
}

export const Donations: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedCampaign, setSelectedCampaign] = useState('Education for All');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrCode, setShowQrCode] = useState(false);
  
  const [formData, setFormData] = useState<DonationFormData>({
    donorName: '',
    email: '',
    phone: '',
    amount: 0,
    campaign: 'Education for All',
    paymentMethod: 'upi',
    isAnonymous: false,
    message: '',
    upiId: '' // User's UPI ID for collect request
  });

  const totalAmount = selectedAmount || parseFloat(customAmount) || 0;
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  // Fetch recent completed donations
  const fetchRecentDonors = async () => {
    try {
      setLoadingDonors(true);
      const response = await fetch('/api/donations?recent=true');
      
      if (response.ok) {
        const recentCompletedDonors = await response.json();
        setRecentDonors(recentCompletedDonors);
      }
    } catch (error) {
      console.error('Error fetching recent donors:', error);
    } finally {
      setLoadingDonors(false);
    }
  };

  useEffect(() => {
    fetchRecentDonors();
    fetchCampaigns();
    loadRazorpayScript();
  }, []);

  // Fetch active campaigns
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await fetch('/api/campaigns?active=true');
      
      if (response.ok) {
        const campaignsData = await response.json();
        setCampaigns(campaignsData);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

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

  // Handle QR Code payment
  const handleQRPayment = async () => {
    if (!formData.donorName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order first
      const orderData = await createRazorpayOrder(formData.amount, 'INR');
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Generate QR code
      const qrData = await generateUpiQrCode(
        formData.amount,
        orderData.orderId
      );

      if (!qrData.success) {
        throw new Error(qrData.error || 'Failed to generate QR code');
      }

      setQrCodeUrl(qrData.qrCodeUrl || '');
      setShowQrCode(true);
      toast.success('QR Code generated! Please scan to complete payment');

    } catch (error) {
      console.error('QR payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle UPI ID payment - Direct payment request to user's UPI app
  const handleUPIIDPayment = async () => {
    if (!formData.donorName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.upiId) {
      toast.error('Please enter your UPI ID');
      return;
    }

    // Validate UPI ID format
    if (!formData.upiId.includes('@')) {
      toast.error('Invalid UPI ID format. Should be like: name@paytm, name@ybl');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate unique transaction reference
      const transactionRef = `UPIID_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      // Save donation to database first
      const donationData = {
        donorName: formData.isAnonymous ? 'Anonymous' : formData.donorName,
        email: formData.email,
        phone: formData.phone,
        amount: formData.amount,
        campaign: formData.campaign,
        paymentMethod: 'upi-id',
        transactionId: transactionRef,
        status: 'pending', // Will be verified manually by admin
        approved: false,
        isAnonymous: formData.isAnonymous,
        message: formData.message,
        upiId: formData.upiId, // Store the UPI ID used for payment
        date: new Date().toISOString(),
      };

      // Save to database
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        throw new Error('Failed to save donation');
      }

      console.log('✅ Donation saved with ref:', transactionRef);
      
      // Create UPI payment intent URL
      const merchantName = 'BSM Gandhinagar';
      const transactionNote = `Donation ${transactionRef}`;
      
      // Generate UPI intent URL (clean format for better compatibility)
      const upiUrl = `upi://pay?pa=${formData.upiId}&pn=${merchantName}&am=${formData.amount}&cu=INR&tn=${transactionNote}`;
      
      console.log('🔗 Generated UPI URL:', upiUrl);
      
      // Check if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile: Try to open UPI app directly
        window.location.href = upiUrl;
        toast.success(`Payment initiated! Reference: ${transactionRef}`);
        
        // Reset form after delay
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        // On desktop: Generate QR code to scan with phone
        const QRCode = (await import('qrcode')).default;
        const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeUrl(qrCodeDataUrl);
        setShowQrCode(true);
        toast.success(`Payment QR generated! Reference: ${transactionRef}`);
      }
      
    } catch (error) {
      console.error('UPI ID payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate UPI payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle UPI payment
  const handleUPIPayment = async () => {
    if (!formData.donorName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      toast.error('Payment gateway not configured');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const orderData = await createRazorpayOrder(formData.amount, 'INR');
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay payment
      await initiateRazorpayPayment({
        razorpayKey: RAZORPAY_KEY_ID,
        orderId: orderData.orderId,
        amount: formData.amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Bihar Purvanchal Samaj',
        description: `Donation for ${formData.campaign}`,
        prefill: {
          name: formData.donorName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          campaign: formData.campaign,
          isAnonymous: formData.isAnonymous,
          message: formData.message,
        },
        theme: {
          color: '#ea580c',
        },
        handler: async (response) => {
          // Payment successful - verify on backend
          const verificationData = await verifyRazorpayPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );

          if (verificationData.success) {
            // Save donation
            await saveDonation(response.razorpay_payment_id, response.razorpay_order_id);
            
            setShowDonationForm(false);
            setShowSuccessModal(true);
            toast.success('Payment successful! Thank you for your donation.');
            fetchRecentDonors();
            
            // Reset form
            resetForm();
          } else {
            toast.error('Payment verification failed');
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setIsProcessing(false);
          },
        },
      });

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  // Save donation to database
  const saveDonation = async (paymentId: string, orderId: string) => {
    try {
      const response = await fetch('/api/donations', {
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
          message: formData.message,
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          transactionId: paymentId, // Add transaction ID for admin display
          status: 'completed',
          approved: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save donation');
      }
    } catch (error) {
      console.error('Error saving donation:', error);
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'qr') {
      await handleQRPayment();
    } else if (paymentMethod === 'upi-id') {
      await handleUPIIDPayment();
    } else {
      await handleUPIPayment();
    }
  };

  const resetForm = () => {
    setFormData({
      donorName: '',
      email: '',
      phone: '',
      amount: 0,
      campaign: 'Education for All',
      paymentMethod: 'upi',
      isAnonymous: false,
      message: ''
    });
    setSelectedAmount(null);
    setCustomAmount('');
    setQrCodeUrl('');
    setShowQrCode(false);
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
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
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
                  {campaigns.map((campaign, index) => (
                    <option key={campaign._id || campaign.id || `campaign-${index}`} value={campaign.title}>
                      {campaign.title}
                    </option>
                  ))}
                  <option key="general-fund" value="General Fund">General Fund</option>
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
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">₹</span>
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
                  <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-orange-600 bg-orange-50">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-600"
                    />
                    <Smartphone className="w-5 h-5 text-orange-600" />
                    <div>
                      <span className="font-medium text-gray-900">UPI/Digital Wallet</span>
                      <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm, etc.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-gray-300">
                    <input
                      type="radio"
                      name="payment"
                      value="upi-id"
                      checked={paymentMethod === 'upi-id'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-600"
                    />
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <div>
                      <span className="font-medium text-gray-900">Enter UPI ID</span>
                      <p className="text-xs text-gray-500">Get payment request in your UPI app</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-gray-300">
                    <input
                      type="radio"
                      name="payment"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-600"
                    />
                    <QrCode className="w-5 h-5 text-gray-600" />
                    <div>
                      <span className="font-medium text-gray-900">Dynamic QR Code</span>
                      <p className="text-xs text-gray-500">Scan with any UPI app</p>
                    </div>
                  </label>
                </div>
              </div>

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
                    recentDonors.slice(0, 10).map((donor, index) => (
                      <div key={donor.id || `donor-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900">
                            {donor.isAnonymous ? 'Anonymous' : donor.donorName}
                          </div>
                          <div className="text-sm text-gray-500">{getTimeAgo(donor.createdAt)}</div>
                        </div>
                        <div className="font-semibold text-orange-600">
                          ₹{(donor.amount || 0).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No recent donations yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="mt-16">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8 text-center">
            Active Campaigns
          </h2>
          
          {loadingCampaigns ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading campaigns...</p>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign._id || campaign.id || `campaign-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
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
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Raised: ₹{(campaign.raised || 0).toLocaleString()}</span>
                        <span>Goal: ₹{(campaign.target || 1).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${Math.min(((campaign.raised || 0) / (campaign.target || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {campaign.donors} donors
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {Math.round((campaign.raised / campaign.target) * 100)}% funded
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleCampaignDonate(campaign.title)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Donate to Campaign
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No active campaigns available at the moment.</p>
            </div>
          )}
        </div>

        {/* Donation Form Modal */}
        <AnimatePresence>
          {showDonationForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto my-8"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Complete Your Donation</h2>
                    <button
                      onClick={() => {
                        setShowDonationForm(false);
                        setShowQrCode(false);
                        setQrCodeUrl('');
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {showQrCode && qrCodeUrl ? (
                    <div className="text-center space-y-4">
                      <div className="bg-orange-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Scan & Pay with Any UPI App
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Google Pay • PhonePe • Paytm • BHIM • Any UPI App
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                          <img 
                            src={qrCodeUrl} 
                            alt="UPI Payment QR Code" 
                            className="mx-auto w-64 h-64"
                            onError={(e) => {
                              console.error('QR Code image failed to load:', qrCodeUrl);
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><text x="50%" y="50%" text-anchor="middle" fill="red">QR Code Error</text></svg>';
                            }}
                          />
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-lg font-bold text-orange-600">
                            Amount: ₹{formData.amount}
                          </p>
                          <p className="text-xs text-gray-500">
                            Merchant: Bihar Purvanchal Samaj Gandhinagar
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowQrCode(false);
                          setQrCodeUrl('');
                        }}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitDonation} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="donorName"
                          required
                          value={formData.donorName}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      {/* UPI ID field - only show when "Enter UPI ID" is selected */}
                      {paymentMethod === 'upi-id' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your UPI ID (VPA) *
                          </label>
                          <input
                            type="text"
                            name="upiId"
                            required
                            value={formData.upiId || ''}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="yourname@paytm, yourname@ybl, etc."
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            💡 You'll receive a payment request notification in your UPI app
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message (Optional)
                        </label>
                        <textarea
                          name="message"
                          rows={3}
                          value={formData.message}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          placeholder="Leave a message..."
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isAnonymous"
                          checked={formData.isAnonymous}
                          onChange={handleFormChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Make this donation anonymous
                        </label>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Campaign:</span>
                          <span className="text-sm text-gray-900">{formData.campaign}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                          <span className="text-sm text-gray-900 capitalize">
                            {paymentMethod === 'upi' ? 'UPI/Digital Wallet' : 'QR Code'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                          <span className="text-xl font-bold text-orange-600">₹{formData.amount}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <p className="text-xs text-gray-700">
                          <strong>Note:</strong> Your 80G tax receipt will be issued by <strong>Bihar Sanskritik Mandal</strong> 
                          (our registered name under 12A & 80G). All official documents and invoices will bear this name.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                          isProcessing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700'
                        } text-white`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <Loader className="animate-spin h-5 w-5 mr-2" />
                            Processing...
                          </div>
                        ) : (
                          <>
                            <Heart className="w-5 h-5 inline mr-2" />
                            {paymentMethod === 'qr' ? 'Generate QR Code' : 'Pay with UPI'}
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-md w-full p-6 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Thank You!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Your donation has been processed successfully. You will receive a confirmation email shortly.
                </p>
                
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
