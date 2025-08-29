// Debug utility to help identify loading issues

export const debugPageState = (pageName, state) => {
  console.log(`🔍 [${pageName}] State Debug:`, {
    loading: state.loading,
    error: state.error,
    hasData: state.data ? Object.keys(state.data).length > 0 : false,
    timestamp: new Date().toISOString()
  });
};

export const debugApiCall = (endpoint, options = {}) => {
  console.log(`🌐 [API] Making request to: ${endpoint}`, {
    options,
    timestamp: new Date().toISOString()
  });
};

export const debugError = (pageName, error) => {
  console.error(`❌ [${pageName}] Error:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    config: error.config,
    timestamp: new Date().toISOString()
  });
};

export const checkAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log(`🔐 Auth Token:`, {
    exists: !!token,
    length: token ? token.length : 0,
    firstChars: token ? token.substring(0, 20) + '...' : 'N/A'
  });
  return !!token;
};
