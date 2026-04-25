import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { Users, Plane, ArrowRightLeft, Shield, BarChart3, UserCog, Check, RefreshCcw } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAppContext();
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, requests

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(statsRes.data);
      
      const usersRes = await axios.get('http://localhost:5000/api/admin/users');
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole });
      // Update local state
      setAllUsers(allUsers.map(u => u._id === userId ? { ...u, role: newRole } : u));
      alert('User role updated successfully!');
    } catch (err) {
      console.error('Failed to update role', err);
      alert('Failed to update user role');
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCcw className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Loading Admin Panel...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage users, flight rooms, and sharing requests.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                User Management
            </button>
            <button 
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Requests
            </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.stats.userCount}</p>
                </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <Plane size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Active Flights</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.stats.flightCount}</p>
                </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <ArrowRightLeft size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.stats.requestCount}</p>
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
                        <th className="px-4 py-3">Wallet</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats.recentUsers.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800">{u.username}</td>
                            <td className="px-4 py-3 text-gray-500">{u.ticketNumber || 'Not Joined'}</td>
                            <td className="px-4 py-3 text-green-600 font-semibold">₹{u.wallet}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>

                {/* All Requests */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold flex items-center gap-2">
                    <BarChart3 size={18} /> Recent Requests
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                        <th className="px-4 py-3">From</th>
                        <th className="px-4 py-3">To</th>
                        <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats.allRequests.slice(0, 8).map(r => (
                        <tr key={r._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800">{r.from}</td>
                            <td className="px-4 py-3 text-gray-800">{r.to}</td>
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
        </>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserCog size={24} className="text-blue-600" />
                User Management
            </h2>
            <span className="text-sm text-gray-500">{allUsers.length} total users registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Full Name / Username</th>
                  <th className="px-6 py-4">Contact/Ticket</th>
                  <th className="px-6 py-4">Wallet Balance</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{u.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">@{u.username}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">{u.ticketNumber || 'No Ticket'}</div>
                        <div className="text-xs text-blue-600 font-semibold">{u.flightNumber || 'No Flight'}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                            ₹{u.wallet.toLocaleString()}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                            {u.role || 'user'}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                            <select 
                                value={u.role || 'user'}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                className={`text-sm border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all relative z-10
                                    ${u._id === user?._id ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:border-blue-400 hover:bg-gray-50'}`}
                                disabled={u._id === user?._id}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            {u._id === user?._id && (
                                <span className="ml-2 text-[10px] text-gray-400 italic whitespace-nowrap">(You)</span>
                            )}
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ArrowRightLeft size={24} className="text-blue-600" />
                    All Baggage Sharing Requests
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Flight</th>
                            <th className="px-6 py-4">Sender (Excess)</th>
                            <th className="px-6 py-4">Receiver (Extra)</th>
                            <th className="px-6 py-4">Weight</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats.allRequests.map(r => (
                            <tr key={r._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-blue-600">{r.flightNumber}</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">{r.from}</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">{r.to}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">
                                        {r.weight}kg
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        r.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                                        r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(r.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
