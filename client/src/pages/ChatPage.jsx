import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { Send, ArrowLeft, CreditCard } from 'lucide-react';

const ChatPage = () => {
  const { roomId } = useParams();
  const { user, setUser, socket, passengers } = useAppContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [price, setPrice] = useState('100');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/messages/${roomId}`);
        setMessages(response.data);
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    };

    if (socket) {
      socket.emit('join_chat', roomId);
      fetchHistory();
      
      socket.on('receive_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    const msgData = {
      roomId,
      message: {
        text: message,
        sender: user.ticketNumber,
        senderName: user.name
      }
    };

    socket.emit('send_message', msgData);
    setMessage('');
  };

  const processPayment = async () => {
    if (!user || user.excessWeight <= 0) {
      alert("Only the user with excess weight (the sender) needs to pay.");
      return;
    }

    // Determine who the receiver is from the chat participants
    const receiver = passengers.find(p => p.ticketNumber !== user.ticketNumber && p.extraSpace > 0);
    
    if (!receiver) {
      alert("Could not identify the receiver.");
      return;
    }

    const amount = parseFloat(price) * user.excessWeight;
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payment/transfer', {
        payerTicket: user.ticketNumber,
        receiverTicket: receiver.ticketNumber,
        amount: amount
      });
      
      // Update local user state with new wallet balance
      setUser({ ...user, wallet: response.data.payerWallet });
      alert(`Payment of ₹${amount} successful! Platform commission (10%) deducted from receiver.`);
      navigate('/wallet');
    } catch (err) {
      alert(err.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/room')} className="hover:bg-blue-700 p-1 rounded">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold">Chat Room</h2>
            <p className="text-xs text-blue-100">Discuss price and location</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="hidden md:block">
                <span className="text-xs mr-2">Agreed Price/kg:</span>
                <input 
                    type="number" 
                    min="1"
                    className="w-20 px-2 py-1 text-black text-sm rounded" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>
            {user?.excessWeight > 0 && (
                <button 
                    onClick={processPayment}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition"
                >
                    <CreditCard size={16} />
                    <span>{loading ? 'Processing...' : 'Pay Now'}</span>
                </button>
            )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.sender === user.ticketNumber ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
              msg.sender === user.ticketNumber 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              <p className="text-xs opacity-75 mb-1">{msg.senderName}</p>
              <p className="text-sm">{msg.text}</p>
              <p className="text-[10px] text-right mt-1 opacity-50">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
