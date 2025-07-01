console.log('🔧 Frontend Debug Script - Testing Local Storage and API calls');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment');
  
  // Check localStorage
  const token = localStorage.getItem('token');
  console.log('🔑 Token in localStorage:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');
  
  // Test API call
  async function testDeleteAPI() {
    try {
      console.log('🧪 Testing delete API call...');
      
      const response = await fetch('/api/members', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const members = await response.json();
        console.log('✅ Members fetched:', members.length);
        
        if (members.length > 0) {
          const testMember = members[0];
          console.log('🎯 Test member:', testMember.name, 'ID:', testMember.id);
          
          // Attempt delete
          const deleteResponse = await fetch(`/api/members?id=${testMember.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('🗑️ Delete response status:', deleteResponse.status);
          
          if (deleteResponse.ok) {
            const deleteResult = await deleteResponse.json();
            console.log('✅ Delete successful:', deleteResult);
          } else {
            const errorText = await deleteResponse.text();
            console.log('❌ Delete failed:', errorText);
          }
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Members fetch failed:', errorText);
      }
    } catch (error) {
      console.error('❌ API test error:', error);
    }
  }
  
  if (token) {
    testDeleteAPI();
  } else {
    console.log('❌ No token found - please log in first');
  }
  
} else {
  console.log('❌ Not in browser environment');
}

// Helper function to manually check token
window.debugToken = function() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No token in localStorage');
    return;
  }
  
  try {
    // Decode JWT payload (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔓 Token payload:', payload);
    console.log('⏰ Token expires:', new Date(payload.exp * 1000));
    console.log('⏰ Current time:', new Date());
    console.log('✅ Token valid:', payload.exp * 1000 > Date.now());
  } catch (error) {
    console.log('❌ Invalid token format:', error);
  }
};

console.log('💡 Run debugToken() to check your token manually');
