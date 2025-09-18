import { useState } from 'react';
import { useLocation } from 'wouter';
import { CHIEF_CREDENTIALS } from '../config/credentials';

export function ChiefLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    if (username === CHIEF_CREDENTIALS.username && password === CHIEF_CREDENTIALS.password) {
      setLocation('/chief-dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400">Chief Login</h2>
        {error && <p className="mb-4 text-center text-red-500 bg-red-900 p-2 rounded">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400">Username</label>
          <input
            type="text"
            className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400">Password</label>
          <input
            type="password"
            className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition duration-300"
        >
          Login
        </button>
      </div>
    </div>
  );
}