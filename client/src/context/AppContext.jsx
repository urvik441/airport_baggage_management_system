import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [pendingRedirect, setPendingRedirect] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

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

      socket.on('request_accepted', (data) => {
        console.log('Request accepted event received:', data);
        console.log('Current User Ticket:', user.ticketNumber);
        if (data.from === user.ticketNumber || data.to === user.ticketNumber) {
          console.log('Match found! Redirecting to chat:', data.chatRoomId);
          setPendingRedirect(`/chat/${data.chatRoomId}`);
        }
      });

      return () => {
        socket.off('flight_update');
        socket.off('new_request');
        socket.off('request_accepted');
      };
    }
  }, [socket, user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setFlightData(null);
    setPassengers([]);
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      flightData, setFlightData, 
      passengers, setPassengers, 
      socket, 
      notifications, setNotifications,
      pendingRedirect, setPendingRedirect,
      login, logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
