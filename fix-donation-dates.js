import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from './lib/mongodb.js';

async function fixDonationDates() {
  try {
    console.log('Connecting to database...');
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');
    
    // Find donations with missing or invalid dates or approval field
    const donationsToFix = await donationsCollection.find({
      $or: [
        { date: { $exists: false } },
        { date: null },
        { createdAt: { $exists: false } },
        { createdAt: null },
        { approved: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${donationsToFix.length} donations with date/approval issues`);
    
    for (const donation of donationsToFix) {
      const currentDate = new Date();
      const updateData = {};
      
      // Set date if missing
      if (!donation.date) {
        updateData.date = donation.createdAt || currentDate;
      }
      
      // Set approved field if missing (default to false)
      if (donation.approved === undefined) {
        updateData.approved = false;
      }
      
      // Set createdAt if missing
      if (!donation.createdAt) {
        updateData.createdAt = donation.date || currentDate;
      }
      
      // Set updatedAt if missing
      if (!donation.updatedAt) {
        updateData.updatedAt = currentDate;
      }
      
      if (Object.keys(updateData).length > 0) {
        await donationsCollection.updateOne(
          { _id: donation._id },
          { $set: updateData }
        );
        
        console.log(`Fixed donation ${donation._id}: ${donation.donorName || 'Unknown'}`);
      }
    }
    
    // Update all donations to ensure both date and createdAt exist
    const result = await donationsCollection.updateMany(
      {
        $or: [
          { date: { $exists: false } },
          { createdAt: { $exists: false } }
        ]
      },
      {
        $set: {
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} donations with missing dates`);
    
    // Show updated donation count
    const totalDonations = await donationsCollection.countDocuments();
    console.log(`Total donations in database: ${totalDonations}`);
    
    // Show sample of fixed donations
    const sampleDonations = await donationsCollection.find({}).limit(5).toArray();
    console.log('\nSample donations after fix:');
    sampleDonations.forEach(donation => {
      console.log(`- ${donation.donorName}: ₹${donation.amount} on ${donation.date || 'No date'}`);
    });
    
  } catch (error) {
    console.error('Error fixing donation dates:', error);
  } finally {
    process.exit(0);
  }
}

fixDonationDates();
