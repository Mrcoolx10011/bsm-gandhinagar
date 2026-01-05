/**
 * Slack Notification Utility
 * Handles sending admin login notifications to Slack
 */

/**
 * Send Slack notification for admin login
 * @param {Object} data - Login event data
 * @param {string} data.email - Admin email
 * @param {string} data.username - Admin username
 * @param {string} data.ip - IP address
 * @param {Object} data.deviceInfo - Device information (os, browser)
 * @param {string} data.userAgent - Full user agent string
 * @param {Date} data.timestamp - Login timestamp
 * @param {string} alertLevel - Alert level (HIGH, MEDIUM, LOW)
 */
export async function sendSlackNotification(data, alertLevel = 'MEDIUM') {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('⚠️ SLACK_WEBHOOK_URL not configured - skipping notification');
    return;
  }

  try {
    const message = buildLoginSuccessMessage(data);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    const result = await response.text();
    console.log('✅ Slack notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Slack notification failed:', error.message);
    // Don't throw - notification failure shouldn't break login
  }
}

/**
 * Build Slack message for successful login
 */
function buildLoginSuccessMessage(data) {
  const istTime = new Date(data.timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔐 Admin Login',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Admin:*\n${data.email || data.username}`
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${istTime}`
          },
          {
            type: 'mrkdwn',
            text: `*IP Address:*\n${data.ip}`
          },
          {
            type: 'mrkdwn',
            text: `*Device:*\n${data.deviceInfo.os} - ${data.deviceInfo.browser}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Status: ✅ Verified | User Agent: ${data.userAgent.substring(0, 50)}...`
          }
        ]
      }
    ]
  };
}

/**
 * Send failed login alert
 */
export async function sendFailedLoginAlert(data, attemptCount) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('⚠️ SLACK_WEBHOOK_URL not configured - skipping notification');
    return;
  }

  try {
    const message = buildFailedLoginAlertMessage(data, attemptCount);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    const result = await response.text();
    console.log('✅ Slack failed login alert sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Slack failed login alert failed:', error.message);
  }
}

/**
 * Build Slack message for failed login attempts
 */
function buildFailedLoginAlertMessage(data, attemptCount) {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const alertIcon = attemptCount >= 5 ? '🚨' : '⚠️';
  const alertLevel = attemptCount >= 5 ? 'CRITICAL' : 'WARNING';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${alertIcon} Failed Login Alert`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Username:*\n${data.username || 'Unknown'}`
          },
          {
            type: 'mrkdwn',
            text: `*Attempts:*\n${attemptCount}`
          },
          {
            type: 'mrkdwn',
            text: `*IP Address:*\n${data.ip}`
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${istTime}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Action:* ${attemptCount >= 5 ? '🔒 Account Locked for 15 minutes' : '⚠️ Monitoring suspicious activity'}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Alert Level: ${alertLevel}`
          }
        ]
      }
    ]
  };
}
