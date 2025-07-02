import dotenv from 'dotenv';
dotenv.config();

// Simple script to test campaigns API and seed data through API calls
import fs from 'fs';

const API_BASE = 'http://localhost:3000'; // Using vercel dev port

const sampleCampaigns = [
  {
    title: "Education for All",
    description: "Providing quality education to underprivileged children in rural areas. This campaign aims to build schools, provide educational materials, and train teachers.",
    target: 100000,
    image: "https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Education",
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-12-31').toISOString(),
    status: 'active'
  },
  {
    title: "Healthcare Initiative",
    description: "Building a community health center to provide medical care to remote villages. Includes medical equipment, staffing, and medicines.",
    target: 150000,
    image: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Healthcare",
    startDate: new Date('2024-02-01').toISOString(),
    endDate: new Date('2024-11-30').toISOString(),
    status: 'active'
  },
  {
    title: "Clean Water Project",
    description: "Installing water purification systems and building wells in drought-affected regions to ensure access to clean drinking water.",
    target: 75000,
    image: "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Environment",
    startDate: new Date('2024-03-01').toISOString(),
    endDate: new Date('2025-03-01').toISOString(),
    status: 'active'
  }
];

async function testAndSeed() {
  try {
    console.log('Testing campaigns API...');
    
    // First test getting active campaigns (public endpoint)
    console.log('\n1. Testing public campaigns endpoint...');
    const response = await fetch(`${API_BASE}/api/campaigns?active=true`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      const campaigns = await response.json();
      console.log('Active campaigns:', campaigns.length);
      campaigns.forEach(campaign => {
        console.log(`- ${campaign.title}: ₹${campaign.raised}/${campaign.target} (${campaign.donors} donors)`);
      });
    } else {
      console.log('Failed to fetch campaigns:', await response.text());
    }
    
    console.log('\n2. Testing admin login...');
    // Test admin login
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const { token } = await loginResponse.json();
      console.log('Login successful, got token');
      
      console.log('\n3. Creating sample campaigns...');
      // Create sample campaigns
      for (const campaign of sampleCampaigns) {
        const createResponse = await fetch(`${API_BASE}/api/campaigns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(campaign)
        });
        
        if (createResponse.ok) {
          const created = await createResponse.json();
          console.log(`✓ Created: ${created.title}`);
        } else {
          console.log(`✗ Failed to create ${campaign.title}:`, await createResponse.text());
        }
      }
      
      console.log('\n4. Testing active campaigns again...');
      const finalResponse = await fetch(`${API_BASE}/api/campaigns?active=true`);
      if (finalResponse.ok) {
        const finalCampaigns = await finalResponse.json();
        console.log(`Now have ${finalCampaigns.length} active campaigns`);
      }
      
    } else {
      console.log('Login failed:', await loginResponse.text());
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAndSeed();
