import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { Users, Plane, ArrowRightLeft, Shield, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/stats');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-blue-600" />
          Admin Dashboard
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{data.stats.userCount}</p>
          </div>
        </div>
        <div className="bg-green-100 p-6 rounded-xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="bg-green-200 p-3 rounded-full text-green-700">
            <Plane size={24} />
          </div>
          <div>
            <p className="text-sm text-green-700">Active Flights</p>
            <p className="text-2xl font-bold text-green-800">{data.stats.flightCount}</p>
          </div>
        </div>
        <div className="bg-purple-100 p-6 rounded-xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="bg-purple-200 p-3 rounded-full text-purple-700">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <p className="text-sm text-purple-700">Total Requests</p>
            <p className="text-2xl font-bold text-purple-800">{data.stats.requestCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold flex items-center gap-2">
            <Users size={18} /> Recent Users
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Flight</th>
                  <th className="px-4 py-3">Wallet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-gray-500">{u.ticketNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{u.flightNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-green-600">₹{u.wallet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold flex items-center gap-2">
            <BarChart3 size={18} /> Recent Sharing Requests
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.allRequests.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{r.from}</td>
                    <td className="px-4 py-3">{r.to}</td>
                    <td className="px-4 py-3">{r.weight}kg</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                        r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
