import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from './lib/mongodb.js';

async function addApprovalField() {
  try {
    console.log('Connecting to database...');
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');
    
    console.log('Adding approval field to all donations...');
    
    // Add approval field to all donations (default to false)
    const approvalResult = await donationsCollection.updateMany(
      { approved: { $exists: false } },
      { $set: { approved: false } }
    );
    
    console.log(`Added approval field to ${approvalResult.modifiedCount} donations`);
    
    // Fix donations with missing dates
    const dateResult = await donationsCollection.updateMany(
      {
        $or: [
          { date: { $exists: false } },
          { date: null },
          { date: "" }
        ]
      },
      [
        {
          $set: {
            date: {
              $cond: {
                if: { $ifNull: ["$createdAt", false] },
                then: "$createdAt",
                else: new Date()
              }
            }
          }
        }
      ]
    );
    
    console.log(`Fixed dates for ${dateResult.modifiedCount} donations`);
    
    // Get sample of updated data
    const sampleDonations = await donationsCollection.find({}).limit(3).toArray();
    console.log('\nSample updated donations:');
    sampleDonations.forEach((donation, index) => {
      console.log(`${index + 1}. ${donation.donorName} - ₹${donation.amount} - Approved: ${donation.approved} - Date: ${new Date(donation.date).toLocaleDateString()}`);
    });
    
    console.log('\nDonation records updated successfully!');
    console.log('✅ Now only approved donations will show in the frontend');
    
  } catch (error) {
    console.error('Error updating donation records:', error);
  } finally {
    process.exit(0);
  }
}

addApprovalField();
