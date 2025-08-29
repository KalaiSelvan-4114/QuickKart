import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { checkAuthToken } from "../utils/debug";
import { testBackendConnectivity, testAuthEndpoint } from "../utils/connectivityTest";

export default function Debug() {
  const [apiStatus, setApiStatus] = useState("checking");
  const [authStatus, setAuthStatus] = useState("checking");
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = [];

    // Check authentication
    const hasToken = checkAuthToken();
    setAuthStatus(hasToken ? "valid" : "missing");
    results.push({
      test: "Authentication Token",
      status: hasToken ? "✅ Present" : "❌ Missing",
      details: hasToken ? "Token found in localStorage" : "No token in localStorage"
    });

    // Test API connectivity
    const connectivityTest = await testBackendConnectivity();
    if (connectivityTest.success) {
      setApiStatus("connected");
      results.push({
        test: "API Connectivity",
        status: "✅ Connected",
        details: `Server responded with status ${connectivityTest.status}`
      });
    } else {
      setApiStatus("failed");
      results.push({
        test: "API Connectivity",
        status: "❌ Failed",
        details: `Error: ${connectivityTest.error} (${connectivityTest.code || 'Unknown'})`
      });
    }

    // Test authentication endpoint
    const authTest = await testAuthEndpoint();
    results.push({
      test: "Authentication Endpoint",
      status: authTest.success ? "✅ Working" : "❌ Failed",
      details: authTest.success ? `Authenticated successfully` : `Error: ${authTest.error}`
    });

    // Test specific endpoints
    const endpoints = [
      "/user/products",
      "/user/shops",
      "/user/profile"
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axiosClient.get(endpoint, { timeout: 10000 });
        results.push({
          test: `Endpoint: ${endpoint}`,
          status: "✅ Working",
          details: `Response: ${response.status}, Data count: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`
        });
      } catch (err) {
        results.push({
          test: `Endpoint: ${endpoint}`,
          status: "❌ Failed",
          details: `Error: ${err.response?.status || err.code} - ${err.message}`
        });
      }
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">QuickKart Debug Panel</h1>
            <p className="text-gray-600 mt-1">System diagnostics and connectivity tests</p>
          </div>

          <div className="p-6">
            {/* Overall Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Authentication Status</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  authStatus === "valid" 
                    ? "bg-green-100 text-green-800" 
                    : authStatus === "missing"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {authStatus === "valid" ? "✅ Authenticated" : 
                   authStatus === "missing" ? "❌ Not Authenticated" : "⏳ Checking..."}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">API Status</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  apiStatus === "connected" 
                    ? "bg-green-100 text-green-800" 
                    : apiStatus === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {apiStatus === "connected" ? "✅ Connected" : 
                   apiStatus === "failed" ? "❌ Connection Failed" : "⏳ Testing..."}
                </div>
              </div>
            </div>

            {/* Detailed Test Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Running diagnostics...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{result.test}</h4>
                        <span className="text-sm">{result.status}</span>
                      </div>
                      <p className="text-sm text-gray-600">{result.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={runDiagnostics}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Re-run Tests
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Cache & Reload
                </button>
              </div>
            </div>

            {/* Environment Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Environment Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:3000'}</p>
                <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
                <p><strong>Base URL:</strong> {import.meta.env.BASE_URL}</p>
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
