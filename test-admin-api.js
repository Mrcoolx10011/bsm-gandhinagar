// Using Node.js 18+ built-in fetch

async function testAdminApiFlow() {
  console.log('🧪 Testing Admin API Authentication Flow');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Login to get a token
    console.log('\n1. Testing admin login...');
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
    console.log('✅ Login successful:', loginData);
    
    const token = loginData.token;
    
    if (!token) {
      console.error('❌ No token received from login');
      return;
    }

    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    // Step 2: Test authenticated API calls
    console.log('\n2. Testing authenticated API calls...');
    
    const testEndpoints = [
      '/api/members',
      '/api/campaigns', 
      '/api/donations'
    ];

    for (const endpoint of testEndpoints) {
      console.log(`\n   Testing ${endpoint}...`);
      
      // Test without token (should fail)
      const noTokenResponse = await fetch(`${baseUrl}${endpoint}`);
      console.log(`   Without token: ${noTokenResponse.status} ${noTokenResponse.statusText}`);
      
      // Test with token (should succeed)
      const withTokenResponse = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`   With token: ${withTokenResponse.status} ${withTokenResponse.statusText}`);
      
      if (withTokenResponse.ok) {
        const data = await withTokenResponse.json();
        console.log(`   ✅ Success - returned ${Array.isArray(data) ? data.length : typeof data} items`);
      } else {
        const error = await withTokenResponse.text();
        console.log(`   ❌ Failed: ${error}`);
      }
    }

    console.log('\n✅ Admin API authentication test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminApiFlow();
