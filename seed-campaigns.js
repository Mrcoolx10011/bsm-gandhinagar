// Simple script to seed some sample campaigns for testing
import { connectToDatabase } from './lib/mongodb.js';

const sampleCampaigns = [
  {
    title: "Education for All",
    description: "Providing quality education to underprivileged children in rural areas. This campaign aims to build schools, provide educational materials, and train teachers.",
    target: 100000,
    image: "https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Education",
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-12-31').toISOString(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Healthcare Initiative",
    description: "Building a community health center to provide medical care to remote villages. Includes medical equipment, staffing, and medicines.",
    target: 150000,
    image: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Healthcare",
    startDate: new Date('2024-02-01').toISOString(),
    endDate: new Date('2024-11-30').toISOString(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Clean Water Project",
    description: "Installing water purification systems and building wells in drought-affected regions to ensure access to clean drinking water.",
    target: 75000,
    image: "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Environment",
    startDate: new Date('2024-03-01').toISOString(),
    endDate: new Date('2025-03-01').toISOString(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Women Empowerment",
    description: "Skills training and micro-financing program for women entrepreneurs in urban slums to help them start their own businesses.",
    target: 80000,
    image: "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Social",
    startDate: new Date('2024-04-01').toISOString(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleDonations = [
  {
    donorName: "Anonymous Donor",
    email: "donor1@example.com",
    phone: "+91-9876543210",
    amount: 5000,
    campaign: "Education for All",
    paymentMethod: "card",
    isAnonymous: true,
    message: "Keep up the great work!",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    donorName: "John Smith",
    email: "john@example.com",
    phone: "+91-9876543211",
    amount: 2500,
    campaign: "Healthcare Initiative",
    paymentMethod: "upi",
    isAnonymous: false,
    message: "Healthcare is crucial",
    status: "completed",
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000)
  },
  {
    donorName: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+91-9876543212",
    amount: 3000,
    campaign: "Clean Water Project",
    paymentMethod: "card",
    isAnonymous: false,
    message: "Water is life",
    status: "completed",
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000)
  },
  {
    donorName: "Anonymous Supporter",
    email: "supporter@example.com",
    phone: "+91-9876543213",
    amount: 1500,
    campaign: "Women Empowerment",
    paymentMethod: "upi",
    isAnonymous: true,
    message: "Supporting women's rights",
    status: "completed",
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
    updatedAt: new Date(Date.now() - 345600000)
  },
  {
    donorName: "Mike Wilson",
    email: "mike@example.com",
    phone: "+91-9876543214",
    amount: 7500,
    campaign: "Education for All",
    paymentMethod: "card",
    isAnonymous: false,
    message: "Education changes lives",
    status: "completed",
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
    updatedAt: new Date(Date.now() - 432000000)
  }
];

async function seedData() {
  try {
    console.log('Connecting to database...');
    const db = await connectToDatabase();
    
    const campaignsCollection = db.collection('campaigns');
    const donationsCollection = db.collection('donations');
    
    // Clear existing data
    console.log('Clearing existing campaigns...');
    await campaignsCollection.deleteMany({});
    
    console.log('Clearing existing donations...');
    await donationsCollection.deleteMany({});
    
    // Insert sample campaigns
    console.log('Inserting sample campaigns...');
    const campaignResult = await campaignsCollection.insertMany(sampleCampaigns);
    console.log(`Inserted ${campaignResult.insertedCount} campaigns`);
    
    // Insert sample donations
    console.log('Inserting sample donations...');
    const donationResult = await donationsCollection.insertMany(sampleDonations);
    console.log(`Inserted ${donationResult.insertedCount} donations`);
    
    console.log('Sample data seeded successfully!');
    console.log('\nCampaigns created:');
    sampleCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.title} - Target: ₹${campaign.target.toLocaleString()}`);
    });
    
    console.log('\nDonations created:');
    sampleDonations.forEach((donation, index) => {
      console.log(`${index + 1}. ${donation.donorName} - ₹${donation.amount} to ${donation.campaign}`);
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
