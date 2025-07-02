import React, { useState } from 'react';
import { useLogin, useMembers } from '../hooks/useApi';
import toast from 'react-hot-toast';

export const ApiTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { login } = useLogin();
  const { getMembers } = useMembers();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async () => {
    addResult('🔐 Testing login...');
    try {
      const result = await login({ username: 'admin', password: 'admin123' });
      if (result.data && !result.error) {
        addResult('✅ Login successful!');
        localStorage.setItem('token', result.data.token);
        toast.success('Login test passed!');
      } else {
        addResult(`❌ Login failed: ${result.error}`);
        toast.error('Login test failed!');
      }
    } catch (error) {
      addResult(`❌ Login error: ${error}`);
    }
  };

  const testMembers = async () => {
    addResult('👥 Testing members API...');
    try {
      const result = await getMembers();
      if (result.data && !result.error) {
        addResult(`✅ Members fetched: ${Array.isArray(result.data) ? result.data.length : 'Success'}`);
        toast.success('Members test passed!');
      } else {
        addResult(`❌ Members failed: ${result.error}`);
        toast.error('Members test failed!');
      }
    } catch (error) {
      addResult(`❌ Members error: ${error}`);
    }
  };

  const testEnvironment = async () => {
    addResult('🌍 Testing environment...');
    try {
      const response = await fetch('/api/auth/login', { method: 'GET' });
      const data = await response.json();
      addResult(`✅ Environment check: ${JSON.stringify(data.environment, null, 2)}`);
    } catch (error) {
      addResult(`❌ Environment error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (import.meta.env.MODE !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md max-h-96 overflow-auto border-2 border-gray-200 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🧪 API Test Panel</h3>
        <button 
          onClick={clearResults} 
          className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <button 
          onClick={testEnvironment}
          className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Test Environment
        </button>
        <button 
          onClick={testLogin}
          className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Test Login
        </button>
        <button 
          onClick={testMembers}
          className="w-full text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
        >
          Test Members
        </button>
      </div>

      <div className="bg-gray-50 p-2 rounded text-xs font-mono max-h-48 overflow-y-auto">
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet...</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1 break-words">
              {result}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApiTestComponent;
