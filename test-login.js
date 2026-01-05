/**
 * Test Admin Login with Slack Notification
 * This will test the full login flow including Slack notification
 */

async function testLogin() {
  console.log('🔐 Testing Admin Login...\n');

  const loginData = {
    username: 'admin',
    password: 'admin123'
  };

  try {
    console.log('📤 Sending login request to: http://localhost:3000/api?endpoint=auth');
    console.log('Credentials:', loginData);
    console.log('');

    const response = await fetch('http://localhost:3000/api?endpoint=auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(loginData)
    });

    console.log('📥 Response Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login Successful!');
      console.log('Token:', data.token?.substring(0, 20) + '...');
      console.log('User:', data.user);
      console.log('\n🔔 Check your Slack channel for the notification!');
    } else {
      console.log('\n❌ Login Failed!');
      console.log('Error:', data.error);
    }

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('');
    console.error('Make sure your dev server is running:');
    console.error('  npm run dev:api');
    console.error('or');
    console.error('  node simple-dev-server.js');
  }
}

testLogin();
