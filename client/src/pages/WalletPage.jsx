import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const WalletPage = () => {
  const { user } = useAppContext();

  const mockTransactions = [
    { id: 1, type: 'credit', amount: 450, desc: 'Baggage sharing - AI101', date: '2026-04-20' },
    { id: 2, type: 'debit', amount: 200, desc: 'Baggage sharing - AI101', date: '2026-04-19' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-2xl shadow-xl text-white">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-blue-100 mb-1">Total Balance</p>
                <h1 className="text-5xl font-bold">₹{user.wallet}</h1>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
                <Wallet size={48} />
            </div>
        </div>
        <div className="mt-8 flex space-x-4">
            <button className="bg-white text-blue-800 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition">
                Add Funds
            </button>
            <button className="bg-blue-500 text-white border border-blue-400 px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition">
                Withdraw
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-100">
            {mockTransactions.map(tx => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                        {tx.type === 'credit' ? (
                            <ArrowDownCircle className="text-green-500" />
                        ) : (
                            <ArrowUpCircle className="text-red-500" />
                        )}
                        <div>
                            <p className="font-bold text-gray-800">{tx.desc}</p>
                            <p className="text-sm text-gray-500">{tx.date}</p>
                        </div>
                    </div>
                    <div className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </div>
                </div>
            ))}
            {mockTransactions.length === 0 && (
                <p className="p-8 text-center text-gray-400">No transactions yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
