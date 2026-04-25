import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { Luggage, Send, Ticket } from 'lucide-react';

const Dashboard = () => {
  const { user, setUser, setFlightData, setPassengers, socket } = useAppContext();
  const [flightNumber, setFlightNumber] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [limit, setLimit] = useState('20');
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const navigate = useNavigate();

  const calculateFees = () => {
    const weight = parseFloat(totalWeight);
    const lmt = parseFloat(limit);
    if (isNaN(weight) || isNaN(lmt)) return;

    if (weight < lmt) {
      const extra = lmt - weight;
      setCalculation({
        type: 'earn',
        amount: extra * 80,
        diff: extra
      });
    } else if (weight > lmt) {
      const excess = weight - lmt;
      setCalculation({
        type: 'pay',
        amount: excess * 100,
        diff: excess
      });
    } else {
      setCalculation({
        type: 'none',
        amount: 0,
        diff: 0
      });
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!flightNumber || !ticketNumber || !totalWeight || !limit) return;

    setLoading(true);
    try {
      const payload = {
        username: user.username,
        ticketNumber: ticketNumber.toUpperCase(),
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
            ticketNumber: ticketNumber.toUpperCase(), 
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user.username}</h2>
            <p className="text-gray-600 mb-8">Enter your ticket and flight details to start sharing baggage space.</p>

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. TKT12345"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Baggage Limit (kg)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Total Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 25"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                    type="button"
                    onClick={calculateFees}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-2"
                >
                    Calculate Potential Savings/Earnings
                </button>
              </div>

              {calculation && (
                <div className={`p-4 rounded-lg border ${
                    calculation.type === 'earn' ? 'bg-green-50 border-green-200 text-green-800' :
                    calculation.type === 'pay' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                    'bg-gray-50 border-gray-200 text-gray-800'
                }`}>
                    {calculation.type === 'earn' && (
                        <p className="font-medium text-center">
                            You have <span className="font-bold">{calculation.diff}kg</span> extra space! 
                            You could earn up to <span className="text-xl font-bold">₹{calculation.amount}</span> by sharing it.
                        </p>
                    )}
                    {calculation.type === 'pay' && (
                        <p className="font-medium text-center">
                            You have <span className="font-bold">{calculation.diff}kg</span> excess weight. 
                            Estimated cost to share: <span className="text-xl font-bold">₹{calculation.amount}</span> (vs ₹{calculation.diff * 200} at airline).
                        </p>
                    )}
                    {calculation.type === 'none' && (
                        <p className="font-medium text-center text-gray-600">You are exactly at the weight limit!</p>
                    )}
                </div>
              )}

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
