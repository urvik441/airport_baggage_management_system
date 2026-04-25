import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Users, ArrowRight, Check, X, MessageCircle } from 'lucide-react';

const RoomPage = () => {
  const { user, flightData, passengers, socket, notifications, setNotifications } = useAppContext();
  const navigate = useNavigate();
  const [activeRequests, setActiveRequests] = useState([]);

  useEffect(() => {
    if (!flightData) navigate('/');
  }, [flightData, navigate]);

  const sendRequest = (targetUser) => {
    if (socket) {
      const weight = user.excessWeight > 0 ? user.excessWeight : 0;
      socket.emit('send_request', {
        from: user.ticketNumber,
        to: targetUser.ticketNumber,
        flightNumber: flightData.flightNumber,
        weight: Math.min(weight, targetUser.extraSpace)
      });
      alert('Request sent!');
    }
  };

  const handleResponse = (requestId, status) => {
    if (socket) {
      socket.emit('respond_request', { requestId, status });
      setNotifications(notifications.filter(n => n._id !== requestId));
    }
  };

  if (!flightData) return null;

  const extraSpaceUsers = passengers.filter(p => p.extraSpace > 0 && p.ticketNumber !== user.ticketNumber);
  const excessWeightUsers = passengers.filter(p => p.excessWeight > 0 && p.ticketNumber !== user.ticketNumber);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Flight {flightData.flightNumber}</h1>
          <p className="text-gray-500">Live Matching Room</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4 text-sm">
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <span className="text-blue-600 font-semibold block">Your Weight</span>
                <span className="text-gray-800 text-lg font-bold">{user.totalWeight}kg / {user.limit}kg</span>
            </div>
            {user.excessWeight > 0 ? (
                <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                    <span className="text-red-600 font-semibold block">Excess</span>
                    <span className="text-red-800 text-lg font-bold">{user.excessWeight}kg</span>
                </div>
            ) : (
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                    <span className="text-green-600 font-semibold block">Extra Space</span>
                    <span className="text-green-800 text-lg font-bold">{user.extraSpace}kg</span>
                </div>
            )}
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl space-y-3">
          <h3 className="font-bold text-yellow-800 flex items-center space-x-2">
            <Users size={18} />
            <span>New Requests</span>
          </h3>
          {notifications.map(notif => (
            <div key={notif._id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">User {notif.from} wants to share {notif.weight}kg</span>
              <div className="flex space-x-2">
                <button onClick={() => handleResponse(notif._id, 'accepted')} className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                  <Check size={20} />
                </button>
                <button onClick={() => handleResponse(notif._id, 'rejected')} className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Extra Space Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-green-600 p-4 text-white flex items-center space-x-2 font-bold">
            <Users size={20} />
            <h2>Available Extra Capacity</h2>
          </div>
          <div className="p-4 space-y-4">
            {extraSpaceUsers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No passengers with extra space yet.</p>
            ) : (
              extraSpaceUsers.map(p => (
                <div key={p.ticketNumber} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">Available: {p.extraSpace}kg</p>
                  </div>
                  {user.excessWeight > 0 && (
                    <button 
                        onClick={() => sendRequest(p)}
                        className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                        <span>Request</span>
                        <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Excess Weight Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-red-600 p-4 text-white flex items-center space-x-2 font-bold">
            <Users size={20} />
            <h2>Passengers Needing Space</h2>
          </div>
          <div className="p-4 space-y-4">
            {excessWeightUsers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No passengers with excess weight yet.</p>
            ) : (
              excessWeightUsers.map(p => (
                <div key={p.ticketNumber} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">Needs: {p.excessWeight}kg</p>
                  </div>
                  {user.extraSpace > 0 && (
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">Waiting for request...</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
