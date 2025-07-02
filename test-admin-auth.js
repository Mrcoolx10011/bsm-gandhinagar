// Debug script to test admin authentication flow
async function testAdminAuth() {
  try {
    console.log('🧪 Testing Admin Authentication Flow\n');
    
    // 1. Clear any existing tokens
    console.log('1. Clearing existing tokens...');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.clear();
    
    // 2. Test login
    console.log('2. Testing login API...');
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('Token:', loginData.token.substring(0, 30) + '...');
    
    // 3. Store token (simulate what AdminLogin does)
    console.log('3. Storing token...');
    localStorage.setItem('token', loginData.token);
    
    // 4. Verify token is stored
    const storedToken = localStorage.getItem('token');
    console.log('✅ Token stored:', storedToken ? 'YES' : 'NO');
    
    // 5. Test admin endpoints
    console.log('4. Testing admin endpoints...');
    
    // Test members API
    console.log('Testing /api/members...');
    const membersResponse = await fetch('/api/members', {
      headers: { 'Authorization': `Bearer ${storedToken}` }
    });
    console.log('Members API Status:', membersResponse.status);
    
    // Test campaigns API
    console.log('Testing /api/campaigns...');
    const campaignsResponse = await fetch('/api/campaigns', {
      headers: { 'Authorization': `Bearer ${storedToken}` }
    });
    console.log('Campaigns API Status:', campaignsResponse.status);
    
    // Test donations API
    console.log('Testing /api/donations...');
    const donationsResponse = await fetch('/api/donations', {
      headers: { 'Authorization': `Bearer ${storedToken}` }
    });
    console.log('Donations API Status:', donationsResponse.status);
    
    if (membersResponse.status === 200 && campaignsResponse.status === 200 && donationsResponse.status === 200) {
      console.log('🎉 All admin APIs working correctly!');
    } else {
      console.log('❌ Some admin APIs are failing');
      
      // Debug token details
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token valid:', payload.exp * 1000 > Date.now());
      } catch (e) {
        console.log('❌ Token decode error:', e);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run the test
testAdminAuth();
