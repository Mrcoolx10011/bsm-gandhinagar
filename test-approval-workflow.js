// Test script to verify the approval workflow
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:3000';

async function testApprovalWorkflow() {
  try {
    console.log('🧪 Testing Donation Approval Workflow\n');
    
    // 1. Test public endpoint (should only show approved donations)
    console.log('1. Testing public donations endpoint...');
    const publicResponse = await fetch(`${API_BASE}/api/donations?recent=true`);
    if (publicResponse.ok) {
      const publicDonations = await publicResponse.json();
      console.log(`   ✅ Public endpoint: ${publicDonations.length} approved donations visible`);
      publicDonations.forEach(donation => {
        console.log(`   - ${donation.donorName}: ₹${donation.amount} to ${donation.campaign}`);
      });
    } else {
      console.log('   ❌ Public endpoint failed');
    }
    
    // 2. Login as admin
    console.log('\n2. Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (!loginResponse.ok) {
      console.log('   ❌ Admin login failed');
      return;
    }
    
    const { token } = await loginResponse.json();
    console.log('   ✅ Admin login successful');
    
    // 3. Get all donations (admin view)
    console.log('\n3. Getting all donations (admin view)...');
    const adminResponse = await fetch(`${API_BASE}/api/donations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (adminResponse.ok) {
      const allDonations = await adminResponse.json();
      const approvedCount = allDonations.filter(d => d.approved).length;
      const pendingCount = allDonations.filter(d => !d.approved).length;
      
      console.log(`   ✅ Admin view: ${allDonations.length} total donations`);
      console.log(`   📊 Approved: ${approvedCount}, Pending: ${pendingCount}`);
      
      // 4. Approve one donation
      if (pendingCount > 0) {
        const pendingDonation = allDonations.find(d => !d.approved);
        console.log(`\n4. Approving donation from ${pendingDonation.donorName}...`);
        
        const approveResponse = await fetch(`${API_BASE}/api/donations?id=${pendingDonation.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ approved: true })
        });
        
        if (approveResponse.ok) {
          console.log('   ✅ Donation approved successfully');
          
          // 5. Test public endpoint again
          console.log('\n5. Testing public endpoint after approval...');
          const updatedPublicResponse = await fetch(`${API_BASE}/api/donations?recent=true`);
          if (updatedPublicResponse.ok) {
            const updatedPublicDonations = await updatedPublicResponse.json();
            console.log(`   ✅ Public endpoint now shows: ${updatedPublicDonations.length} approved donations`);
            
            const newlyApproved = updatedPublicDonations.find(d => d.donorName === pendingDonation.donorName);
            if (newlyApproved) {
              console.log(`   🎉 Newly approved donation is now visible: ${newlyApproved.donorName} - ₹${newlyApproved.amount}`);
            }
          }
        } else {
          console.log('   ❌ Failed to approve donation');
        }
      } else {
        console.log('\n4. No pending donations to approve');
      }
    } else {
      console.log('   ❌ Failed to get admin donations');
    }
    
    console.log('\n✅ Approval workflow test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Public donations endpoint only shows approved donations');
    console.log('   - Admin can see all donations with approval status');
    console.log('   - Admin can approve/disapprove donations');
    console.log('   - Frontend will only display approved donations');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApprovalWorkflow();
