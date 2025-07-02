// Test script for Vercel deployment
import fetch from 'node-fetch';
const BASE_URL = process.argv[2] || 'http://localhost:3000';

console.log(`🧪 Testing Vercel Deployment: ${BASE_URL}`);
console.log('='.repeat(50));

async function testEndpoint(path, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.text();
    
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { raw: data.substring(0, 100) + '...' };
    }

    console.log(`${response.ok ? '✅' : '❌'} ${path}: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`   Error: ${data.substring(0, 200)}`);
    } else if (jsonData.message) {
      console.log(`   Message: ${jsonData.message}`);
    }
    
    return { success: response.ok, data: jsonData, status: response.status };
  } catch (error) {
    console.log(`❌ ${path}: ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n1. Testing Basic Health Checks:');
  await testEndpoint('/api/env-check');
  await testEndpoint('/api/utils?type=hello');
  
  console.log('\n2. Testing Environment Setup:');
  const envResult = await testEndpoint('/api/auth/login', { method: 'GET' });
  
  if (envResult.success && envResult.data.environment) {
    const env = envResult.data.environment;
    console.log('   📊 Environment Status:');
    console.log(`   - Database: ${env.hasDatabase ? '✅' : '❌'} (${env.databaseVar})`);
    console.log(`   - JWT Secret: ${env.hasJwtSecret ? '✅' : '❌'}`);
    console.log(`   - Admin User: ${env.hasAdminUsername ? '✅' : '❌'} (${env.adminUsername})`);
    console.log(`   - Node ENV: ${env.nodeEnv}`);
  }
  
  console.log('\n3. Testing Authentication:');
  const loginResult = await testEndpoint('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  
  let token = null;
  if (loginResult.success && loginResult.data.token) {
    token = loginResult.data.token;
    console.log('   🔑 Login successful, token received');
  }
  
  console.log('\n4. Testing Protected Endpoints:');
  if (token) {
    const headers = { 'Authorization': `Bearer ${token}` };
    await testEndpoint('/api/members', { headers });
    await testEndpoint('/api/events', { headers });
    await testEndpoint('/api/donations', { headers });
    await testEndpoint('/api/campaigns', { headers });
    await testEndpoint('/api/inquiries', { headers });
  } else {
    console.log('   ⚠️  Skipping protected endpoint tests - no token');
  }
  
  console.log('\n5. Testing Consolidated Endpoints:');
  await testEndpoint('/api/admin?type=posts');
  await testEndpoint('/api/admin?type=recent-activities', { 
    headers: token ? { 'Authorization': `Bearer ${token}` } : {} 
  });
  
  console.log('\n='.repeat(50));
  console.log('🏁 Deployment test completed!');
  
  if (!envResult.success) {
    console.log('\n❌ CRITICAL: Environment check failed');
    console.log('📋 Action needed: Set environment variables in Vercel');
  } else if (!loginResult.success) {
    console.log('\n❌ CRITICAL: Authentication failed');
    console.log('📋 Action needed: Check admin credentials and JWT secret');
  } else {
    console.log('\n✅ Basic functionality working!');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, testEndpoint };
