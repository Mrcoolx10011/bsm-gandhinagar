/**
 * Test Donation Slack Notification
 * Simulates a donation submission and tests Slack integration
 */

// Skip during deployment - only run manually
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  console.log('⏭️  Skipping test during deployment');
  process.exit(0);
}

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

async function testDonationNotification() {
  console.log('🧪 Testing Donation Slack Notification...');
  console.log('Webhook URL:', SLACK_WEBHOOK_URL ? '✅ Configured' : '❌ Missing');

  if (!SLACK_WEBHOOK_URL) {
    console.error('❌ SLACK_WEBHOOK_URL not found in .env.local');
    process.exit(1);
  }

  // Simulate a donation submission
  const testDonation = {
    donationId: '507f1f77bcf86cd799439011',
    name: 'Test Donor',
    email: 'donor@example.com',
    amount: 5000,
    currency: '₹',
    message: 'This is a test donation to verify Slack notifications are working!',
    paymentMethod: 'Razorpay',
    ip: '203.0.113.42',
    timestamp: new Date()
  };

  const istTime = new Date(testDonation.timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '💰 New Donation Received',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Donor Name:*\n${testDonation.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Amount:*\n${testDonation.currency}${testDonation.amount.toLocaleString('en-IN')}`
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${testDonation.email}`
          },
          {
            type: 'mrkdwn',
            text: `*Payment Method:*\n${testDonation.paymentMethod}`
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${istTime}`
          },
          {
            type: 'mrkdwn',
            text: `*IP Address:*\n${testDonation.ip}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Message:*\n${testDonation.message}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Status:* ⏳ Pending verification\n*ID:* ${testDonation.donationId}`
        }
      }
    ]
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.text();
    console.log('✅ Test donation notification sent successfully!');
    console.log('Response:', result);
    console.log('');
    console.log('Check your Slack channel for the test donation message! 🎉');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testDonationNotification();
