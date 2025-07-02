#!/usr/bin/env node

/**
 * BSM Website - Complete API Test Suite
 * Tests all endpoints in development mode
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3006';
const API_URL = `${BASE_URL}/api`;

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`🧪 Testing ${name}...`);
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name}: SUCCESS`);
      return { success: true, data };
    } else {
      console.log(`❌ ${name}: FAILED - ${data.message || 'Unknown error'}`);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 BSM Website API Test Suite');
  console.log('================================\n');

  // Test public endpoints
  console.log('📡 Testing Public Endpoints:');
  await testEndpoint('Hello API', `${API_URL}/hello`);
  await testEndpoint('Simple Check', `${API_URL}/simple-check`);
  await testEndpoint('Posts API', `${API_URL}/posts`);
  await testEndpoint('Events API', `${API_URL}/events`);
  await testEndpoint('Public Members', `${API_URL}/members?public=true`);
  
  console.log('\n🔐 Testing Authentication:');
  const loginResult = await testEndpoint('Admin Login', `${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  if (loginResult.success) {
    const token = loginResult.data.token;
    const authHeaders = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n🔒 Testing Protected Endpoints:');
    await testEndpoint('Admin Members', `${API_URL}/members`, { headers: authHeaders });
    await testEndpoint('Admin Donations', `${API_URL}/donations`, { headers: authHeaders });
    await testEndpoint('Admin Inquiries', `${API_URL}/inquiries`, { headers: authHeaders });
  }

  console.log('\n🌐 Testing Frontend:');
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      console.log('✅ Frontend: SUCCESS (HTML served)');
    } else {
      console.log('❌ Frontend: FAILED');
    }
  } catch (error) {
    console.log(`❌ Frontend: ERROR - ${error.message}`);
  }

  console.log('\n🎉 Test Suite Complete!');
}

runTests().catch(console.error);
