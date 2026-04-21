import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Plane, Wallet, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Plane size={24} />
          <span>BaggageShare</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-200 flex items-center space-x-1">
            <span>Dashboard</span>
          </Link>
          <Link to="/wallet" className="hover:text-blue-200 flex items-center space-x-1">
            <Wallet size={18} />
            <span>₹{user.wallet}</span>
          </Link>
          <div className="flex items-center space-x-2 bg-blue-700 px-3 py-1 rounded-full text-sm">
            <User size={14} />
            <span>{user.ticketNumber}</span>
          </div>
          <button onClick={handleLogout} className="hover:text-red-200 flex items-center space-x-1">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
