import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.on('flight_update', (updatedPassengers) => {
        setPassengers(updatedPassengers);
      });

      socket.on('new_request', (request) => {
        if (request.to === user.ticketNumber) {
          setNotifications(prev => [...prev, request]);
        }
      });
    }
  }, [socket, user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      flightData, setFlightData, 
      passengers, setPassengers, 
      socket, 
      notifications, setNotifications,
      login, logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
