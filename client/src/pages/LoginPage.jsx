import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { Plane } from 'lucide-react';

const LoginPage = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticketNumber) return setError('Please enter your ticket number');
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { ticketNumber });
      login(response.data);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-xl border border-gray-100">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-100 p-3 rounded-full mb-4">
          <Plane className="text-blue-600" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">BaggageShare</h1>
        <p className="text-gray-500 mt-2 text-center">Enter your ticket number to get started with baggage sharing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Number</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
            placeholder="e.g. AB1234567"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Continue'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Optimize your travel by sharing extra baggage capacity with fellow passengers.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
