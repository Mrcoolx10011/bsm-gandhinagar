import React, { useState } from 'react';
import { sendDonationApprovalEmail } from '../utils/emailService';
import toast from 'react-hot-toast';

export const EmailTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(100);
  const [sending, setSending] = useState(false);

  const testEmail = async () => {
    setSending(true);
    console.log('🧪 Testing email with:', { email, name, amount });
    
    try {
      const result = await sendDonationApprovalEmail(
        email,
        name,
        amount,
        'Test Campaign'
      );
      
      if (result) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Failed to send test email - check console for details');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Error sending test email');
    } finally {
      setSending(false);
    }
  };

  // Check environment variables
  const checkEnvVars = () => {
    console.log('🔍 Environment Variables:');
    console.log('VITE_EMAILJS_SERVICE_ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
    console.log('VITE_EMAILJS_TEMPLATE_ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
    console.log('VITE_EMAILJS_PUBLIC_KEY:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    
    toast.success('Check console for environment variables');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            EmailJS Test Page
          </h1>
          
          <button
            onClick={checkEnvVars}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Check Environment Variables
          </button>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donor Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={testEmail}
              disabled={sending || !email || !name}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>First, click "Check Environment Variables" button</li>
              <li>Check the browser console for your EmailJS configuration</li>
              <li>Enter a test email address (your own email)</li>
              <li>Enter a test name and amount</li>
              <li>Click "Send Test Email"</li>
              <li>Check the browser console for detailed logs</li>
              <li>Check your email inbox for the test email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
