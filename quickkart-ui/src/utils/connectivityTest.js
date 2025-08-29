// Simple connectivity test utility

export const testBackendConnectivity = async () => {
  try {
    console.log("🔍 Testing backend connectivity...");
    
    // Test basic connectivity
    const response = await fetch('http://localhost:3000/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (response.ok) {
      console.log("✅ Backend is accessible");
      return { success: true, status: response.status };
    } else {
      console.log("❌ Backend responded with error status:", response.status);
      return { success: false, status: response.status, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log("❌ Backend connectivity test failed:", error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code || 'UNKNOWN'
    };
  }
};

export const testAuthEndpoint = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }
    
    console.log("🔍 Testing authenticated endpoint...");
    
    const response = await fetch('http://localhost:3000/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      console.log("✅ Authentication endpoint working");
      return { success: true, status: response.status };
    } else if (response.status === 401) {
      console.log("❌ Authentication failed - invalid token");
      return { success: false, status: 401, error: 'Authentication failed' };
    } else {
      console.log("❌ Auth endpoint error:", response.status);
      return { success: false, status: response.status, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log("❌ Auth endpoint test failed:", error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code || 'UNKNOWN'
    };
  }
};
