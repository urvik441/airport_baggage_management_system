# Airport Baggage Management System

A full-stack React.js web application designed to optimize baggage usage by allowing passengers to share unused capacity with others on the same flight.

## 🚀 Overview

The **BaggageShare** platform connects passengers who have extra baggage allowance with those who have excess weight. This peer-to-peer system helps travelers avoid high airline excess baggage fees while allowing others to earn credits.

## ✨ Core Features

- **User Authentication**: Secure login using username and password.
- **Flight-based Rooms**: Join a specific flight room by entering your Flight Number and Ticket Number.
- **Baggage Calculation**: 
  - Input total weight and allowance limit.
  - Automatically calculates "Extra Space" or "Excess Weight".
- **Real-time Matching**: View a live list of passengers on your flight categorized by available capacity or baggage needs.
- **Request System**: Send sharing requests to fellow passengers.
- **Real-time Chat**: Private messaging system for accepted requests to discuss details and coordinates.
- **Simulated Wallet & Payments**: 
  - Track earnings and spending in a virtual wallet.
  - Simulate payments for baggage sharing with automated platform commission deduction.

## 🛠️ Tech Stack

### Frontend
- **React.js**: Functional components and Hooks.
- **Tailwind CSS**: Modern, responsive UI styling.
- **Lucide React**: For sleek, consistent iconography.
- **Context API**: Global state management for user data, flight info, and notifications.
- **Socket.io-client**: Real-time communication.
- **Axios**: HTTP requests to the backend.

### Backend
- **Node.js & Express**: RESTful API and server logic.
- **Socket.io**: Real-time event handling for chat and flight room updates.
- **In-memory Mock Database**: (Map-based) for users, flights, and transactions.

## 📂 Project Structure

```text
airport_baggage_management_system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, etc.)
│   │   ├── context/        # AppContext for state management
│   │   ├── pages/          # Page components (Dashboard, Login, Room, etc.)
│   │   └── App.jsx         # Routing and main structure
├── server/                 # Node.js Backend
│   └── index.js            # Express server & Socket.io logic
└── requirement.md.txt      # Project requirements documentation
```

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 2. Backend Setup
```bash
cd server
npm install
npm start
```
*The server will run on `http://localhost:5000`.*

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*The client will run on `http://localhost:5173` (default Vite port).*

## 📖 Usage Flow

1. **Login**: Enter any username and password to access the system.
2. **Dashboard**: Enter your **Flight Number** (e.g., AI101), **Ticket Number**, and current baggage weight.
3. **Room**: Browse the list of passengers on your flight. If you have excess weight, request space from someone with extra capacity.
4. **Chat**: Once a request is accepted, use the chat room to finalize the agreement.
5. **Payment**: Use the "Pay Now" feature in the chat to simulate the transaction.
6. **Wallet**: Check your balance and transaction history in the Wallet tab.

---
*Created as a prototype for an Airport Baggage Sharing solution.*
