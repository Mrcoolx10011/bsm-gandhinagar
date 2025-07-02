// Debug script to test admin login and token storage
console.log('🔍 Admin Debug Script');

// Check current localStorage
console.log('📦 Current localStorage contents:');
console.log('- token:', localStorage.getItem('token'));
console.log('- adminToken:', localStorage.getItem('adminToken'));
console.log('- auth-storage:', localStorage.getItem('auth-storage'));

// Test login function
async function testAdminLogin() {
  console.log('\n🔐 Testing admin login...');
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login response:', data);
      
      // Store token
      localStorage.setItem('token', data.token);
      console.log('💾 Token stored in localStorage');
      
      // Verify storage
      console.log('🔍 Verification - stored token:', localStorage.getItem('token'));
      
      return data.token;
    } else {
      const error = await response.text();
      console.error('❌ Login failed:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
}

// Test API calls with token
async function testApiCalls(token) {
  console.log('\n🧪 Testing API calls with token...');
  
  const endpoints = ['/api/members', '/api/campaigns', '/api/donations'];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success - got ${Array.isArray(data) ? data.length : 'non-array'} items`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Test with current token
function testWithCurrentToken() {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('🔍 Testing with current token:', token.substring(0, 20) + '...');
    testApiCalls(token);
  } else {
    console.log('❌ No token found in localStorage');
  }
}

// Helper function to check token validity
function debugToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No token in localStorage');
    return;
  }
  
  try {
    // Decode JWT payload (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔓 Token payload:', payload);
    console.log('⏰ Token expires:', new Date(payload.exp * 1000));
    console.log('⏰ Current time:', new Date());
    console.log('✅ Token valid:', payload.exp * 1000 > Date.now());
  } catch (error) {
    console.log('❌ Invalid token format:', error);
  }
}

// Make functions available globally
window.testAdminLogin = testAdminLogin;
window.testApiCalls = testApiCalls;
window.testWithCurrentToken = testWithCurrentToken;
window.debugToken = debugToken;

console.log('\n🎯 Debug functions available:');
console.log('- testAdminLogin() - Test login and store token');
console.log('- testWithCurrentToken() - Test API calls with current token');
console.log('- testApiCalls(token) - Test API calls with specific token');
console.log('- debugToken() - Check current token validity');

// Auto-test with current token if available
testWithCurrentToken();
