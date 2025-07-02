#!/usr/bin/env node

/**
 * API Health Check Script
 * Tests all API endpoints to ensure they're working correctly
 */

const API_BASE = 'http://localhost:3000';

// Test endpoints
const endpoints = [
  { path: '/api/hello', method: 'GET', description: 'Hello API' },
  { path: '/api/simple-check', method: 'GET', description: 'Simple Check' },
  { path: '/api/members?public=true', method: 'GET', description: 'Public Members' },
  { path: '/api/events', method: 'GET', description: 'Events' },
  { path: '/api/donations?recent=true', method: 'GET', description: 'Recent Donations' },
  { path: '/api/campaigns?active=true', method: 'GET', description: 'Active Campaigns' },
  { path: '/api/posts', method: 'GET', description: 'Posts' }
];

// Auth endpoints (require login)
const authEndpoints = [
  { path: '/api/members', method: 'GET', description: 'Admin Members' },
  { path: '/api/donations', method: 'GET', description: 'Admin Donations' },
  { path: '/api/campaigns', method: 'GET', description: 'Admin Campaigns' },
  { path: '/api/inquiries', method: 'GET', description: 'Admin Inquiries' },
  { path: '/api/recent-activities', method: 'GET', description: 'Recent Activities' }
];

async function testEndpoint(endpoint, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint.path}`, {
      method: endpoint.method,
      headers
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint.description}: SUCCESS`);
      return { success: true, data };
    } else {
      console.log(`❌ ${endpoint.description}: FAILED - ${data.message || 'Unknown error'}`);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`❌ ${endpoint.description}: ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testLogin() {
  try {
    console.log('\n🔐 Testing Admin Login...');
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login: SUCCESS');
      return data.token;
    } else {
      const error = await response.json();
      console.log(`❌ Login: FAILED - ${error.message}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login: ERROR - ${error.message}`);
    return null;
  }
}

async function runHealthCheck() {
  console.log('🏥 BSM API Health Check');
  console.log('========================\n');

  // Test public endpoints
  console.log('📡 Testing Public Endpoints:');
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }

  // Test admin login
  const token = await testLogin();

  if (token) {
    console.log('\n🔒 Testing Protected Endpoints:');
    for (const endpoint of authEndpoints) {
      await testEndpoint(endpoint, token);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }
  }

  console.log('\n🎉 Health check completed!');
}

// Check if API server is running first
async function checkApiServer() {
  try {
    const response = await fetch(`${API_BASE}/api/hello`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if API server is running...');
  
  const isRunning = await checkApiServer();
  if (!isRunning) {
    console.log('❌ API server is not running on port 3000');
    console.log('💡 Please start the development server first:');
    console.log('   node start-dev.js');
    process.exit(1);
  }

  console.log('✅ API server is running\n');
  await runHealthCheck();
}

main().catch(console.error);
