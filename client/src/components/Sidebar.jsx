import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Plane, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  LogOut, 
  User, 
  Shield,
  MessageSquare
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard size={20} />,
      adminOnly: false
    },
    {
      title: 'My Flight',
      path: '/room',
      icon: <Users size={20} />,
      adminOnly: false
    },
    {
      title: 'Wallet',
      path: '/wallet',
      icon: <Wallet size={20} />,
      adminOnly: false
    },
    {
      title: 'Admin Panel',
      path: '/admin',
      icon: <Shield size={20} />,
      adminOnly: true
    }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3 text-blue-600">
          <Plane size={32} className="fill-current" />
          <span className="text-2xl font-bold tracking-tight text-gray-900">BaggageShare</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          if (item.adminOnly && user.role !== 'admin') return null;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`${isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.icon}
              </span>
              <span className="ml-3">{item.title}</span>
              {item.path === '/wallet' && (
                <span className="ml-auto bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  ₹{user.wallet}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center p-3 mb-2 bg-gray-50 rounded-xl">
          <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User size={20} />
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.name || user.username}
            </p>
            <div className="flex flex-col">
              {user.ticketNumber && (
                <p className="text-[10px] text-blue-600 font-medium truncate uppercase">
                  {user.ticketNumber}
                </p>
              )}
              <p className="text-[10px] text-gray-400 truncate capitalize font-medium">
                {user.role || 'Passenger'} • @{user.username}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
