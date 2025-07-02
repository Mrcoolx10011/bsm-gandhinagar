// Simple test script to verify admin authentication
// Using built-in fetch (Node.js 18+)

const baseUrl = 'http://localhost:3000';

async function testAdminAuth() {
  console.log('🧪 Testing Admin Authentication...\n');
  
  try {
    // Test login
    console.log('1. Testing admin login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('Token:', loginData.token.substring(0, 20) + '...');
    
    const token = loginData.token;
    
    // Test admin endpoints
    console.log('\n2. Testing admin endpoints...');
    
    const endpoints = [
      '/api/members',
      '/api/campaigns', 
      '/api/donations',
      '/api/events',
      '/api/inquiries'
    ];

    for (const endpoint of endpoints) {
      console.log(`\nTesting ${endpoint}...`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: Success - ${Array.isArray(data) ? data.length : 'object'} items`);
      } else {
        console.log(`❌ ${endpoint}: Failed - ${response.status}`);
      }
    }
    
    console.log('\n🎉 Admin authentication test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAuth();
