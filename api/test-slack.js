/**
 * Test Slack Notification
 * Run this to verify Slack integration is working
 */

// Skip during deployment - only run manually
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  console.log('⏭️  Skipping test during deployment');
  process.exit(0);
}

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

async function testSlackNotification() {
  console.log('🧪 Testing Slack Notification...');
  console.log('Webhook URL:', SLACK_WEBHOOK_URL ? '✅ Configured' : '❌ Missing');

  if (!SLACK_WEBHOOK_URL) {
    console.error('❌ SLACK_WEBHOOK_URL not found in .env.local');
    process.exit(1);
  }

  const testMessage = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🧪 Test Message - Admin Login Integration',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Admin:*\nadmin@bsmgandhinagar.org'
          },
          {
            type: 'mrkdwn',
            text: '*Time:*\n' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          },
          {
            type: 'mrkdwn',
            text: '*IP Address:*\n127.0.0.1'
          },
          {
            type: 'mrkdwn',
            text: '*Device:*\nWindows 10 - Chrome'
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Status: ✅ Test Message | This is a test notification from your admin login system'
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.text();
    console.log('✅ Test notification sent successfully!');
    console.log('Response:', result);
    console.log('');
    console.log('Check your Slack channel for the test message! 🎉');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSlackNotification();
