// Comprehensive status check for BSM Development Environment
console.log('🔍 BSM Development Environment Status Check');
console.log('==========================================\n');

const baseUrl = 'http://localhost:3000';
const frontendUrl = 'http://localhost:5173';

async function checkStatus() {
  try {
    // Check API Server
    console.log('📡 API Server Status:');
    try {
      const apiHealth = await fetch(`${baseUrl}/api/utils?type=hello`);
      if (apiHealth.ok) {
        console.log('✅ API Server: Running on port 3000');
      } else {
        console.log('❌ API Server: Not responding properly');
      }
    } catch (error) {
      console.log('❌ API Server: Not running');
    }

    // Check Frontend Server
    console.log('\n🌐 Frontend Server Status:');
    try {
      const frontendHealth = await fetch(frontendUrl);
      if (frontendHealth.ok) {
        console.log('✅ Frontend Server: Running on port 5173');
      } else {
        console.log('❌ Frontend Server: Not responding properly');
      }
    } catch (error) {
      console.log('❌ Frontend Server: Not running');
    }

    // Test Key API Endpoints
    console.log('\n🔧 API Endpoints Status:');
    const endpoints = [
      { path: '/api/utils?type=hello', name: 'Hello API', public: true },
      { path: '/api/members?public=true', name: 'Public Members', public: true },
      { path: '/api/events', name: 'Events', public: true },
      { path: '/api/auth/login', name: 'Auth Login', public: true, method: 'POST' }
    ];

    for (const endpoint of endpoints) {
      try {
        const options = endpoint.method === 'POST' ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        } : {};

        const response = await fetch(`${baseUrl}${endpoint.path}`, options);
        if (response.ok) {
          console.log(`✅ ${endpoint.name}: Working`);
        } else {
          console.log(`⚠️ ${endpoint.name}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: Error`);
      }
    }

    // Test Admin Authentication
    console.log('\n🔐 Admin Authentication:');
    try {
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Admin Login: Working');
        
        // Test admin-only endpoint
        const adminResponse = await fetch(`${baseUrl}/api/members`, {
          headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        
        if (adminResponse.ok) {
          console.log('✅ Admin API Access: Working');
        } else {
          console.log('❌ Admin API Access: Failed');
        }
      } else {
        console.log('❌ Admin Login: Failed');
      }
    } catch (error) {
      console.log('❌ Admin Authentication: Error');
    }

    console.log('\n🎯 Access URLs:');
    console.log(`📱 Frontend: ${frontendUrl}`);
    console.log(`🔧 Admin Panel: ${frontendUrl}/admin`);
    console.log(`📡 API Base: ${baseUrl}/api`);
    
    console.log('\n🔑 Default Admin Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    console.log('\n✅ Status Check Complete!');

  } catch (error) {
    console.error('❌ Status check failed:', error);
  }
}

checkStatus();
