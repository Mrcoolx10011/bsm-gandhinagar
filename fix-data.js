#!/usr/bin/env node

/**
 * Quick Data Checker and Sample Creator
 * Ensures there are campaigns with proper structure
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkAndFixData() {
  console.log('🔍 Checking database data...');
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('✅ Connected to MongoDB');
  
  const db = client.db('bsm-gandhinagar');
  
  // Check campaigns
  const campaigns = await db.collection('campaigns').find({}).toArray();
  console.log(`📊 Found ${campaigns.length} campaigns`);
  
  if (campaigns.length === 0) {
    console.log('🚀 Creating sample campaigns...');
    const sampleCampaigns = [
      {
        title: "Education for All",
        description: "Supporting education for underprivileged children in Bihar",
        target: 100000,
        raised: 45000,
        donors: 25,
        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400",
        category: "Education",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Clean Water Project",
        description: "Providing clean drinking water to rural communities",
        target: 75000,
        raised: 32000,
        donors: 18,
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
        category: "Health",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Food Distribution",
        description: "Emergency food distribution during crisis times",
        target: 50000,
        raised: 48000,
        donors: 42,
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
        category: "Relief",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('campaigns').insertMany(sampleCampaigns);
    console.log('✅ Created sample campaigns');
  } else {
    // Update existing campaigns to ensure they have required fields
    console.log('🔧 Updating existing campaigns...');
    for (const campaign of campaigns) {
      const updates = {};
      if (typeof campaign.raised !== 'number') updates.raised = 0;
      if (typeof campaign.target !== 'number') updates.target = 10000;
      if (typeof campaign.donors !== 'number') updates.donors = 0;
      if (!campaign.image) updates.image = "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400";
      
      if (Object.keys(updates).length > 0) {
        await db.collection('campaigns').updateOne(
          { _id: campaign._id },
          { $set: { ...updates, updatedAt: new Date() } }
        );
        console.log(`✅ Updated campaign: ${campaign.title}`);
      }
    }
  }
  
  // Check posts
  const posts = await db.collection('posts').find({}).toArray();
  console.log(`📝 Found ${posts.length} posts`);
  
  if (posts.length === 0) {
    console.log('🚀 Creating sample posts...');
    const samplePosts = [
      {
        title: "Community Celebration Success",
        content: "Our recent community celebration was a huge success with over 200 participants!",
        author: "BSM Team",
        status: "published",
        featured: true,
        image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "New Education Initiative",
        content: "We are proud to announce our new education initiative for rural children.",
        author: "BSM Team", 
        status: "published",
        featured: false,
        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('posts').insertMany(samplePosts);
    console.log('✅ Created sample posts');
  }
  
  await client.close();
  console.log('🎉 Database check and fix completed!');
}

checkAndFixData().catch(console.error);
