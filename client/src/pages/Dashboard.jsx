import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { Luggage, Send } from 'lucide-react';

const Dashboard = () => {
  const { user, setUser, setFlightData, setPassengers, socket } = useAppContext();
  const [flightNumber, setFlightNumber] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [limit, setLimit] = useState('20');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!flightNumber || !totalWeight || !limit) return;

    setLoading(true);
    try {
      const payload = {
        ticketNumber: user.ticketNumber,
        flightNumber: flightNumber.toUpperCase(),
        totalWeight: parseFloat(totalWeight),
        limit: parseFloat(limit)
      };
      
      const response = await axios.post('http://localhost:5000/api/flight/join', payload);
      
      setUser(response.data.flightUser);
      setFlightData({ flightNumber: flightNumber.toUpperCase() });
      setPassengers(response.data.passengers);
      
      if (socket) {
        socket.emit('join_flight', { 
            ticketNumber: user.ticketNumber, 
            flightNumber: flightNumber.toUpperCase() 
        });
      }
      
      navigate('/room');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="md:flex">
          <div className="md:shrink-0 bg-blue-600 flex items-center justify-center p-12 text-white">
            <Luggage size={64} />
          </div>
          <div className="p-8 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user.ticketNumber}</h2>
            <p className="text-gray-600 mb-8">Enter your flight details to start sharing baggage space.</p>

            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flight Number</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. AI101"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Baggage Limit (kg)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Total Weight (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 25"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200"
                >
                  <Send size={18} />
                  <span>{loading ? 'Processing...' : 'Find Flight Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">How it works?</h3>
            <p className="text-sm text-gray-600">Enter your flight and baggage weight. We'll match you with others on the same flight.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">Safe & Secure</h3>
            <p className="text-sm text-gray-600">Chat with other passengers and agree on a price. All payments are simulated for this demo.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">Save Money</h3>
            <p className="text-sm text-gray-600">Avoid expensive airline excess baggage fees by sharing unused capacity.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
