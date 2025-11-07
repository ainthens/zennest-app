// src/pages/UserWallet.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import Loading from '../components/Loading';
import { 
  FaWallet, 
  FaPlus, 
  FaArrowUp,
  FaArrowDown,
  FaCreditCard,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaInfoCircle,
  FaShoppingCart,
  FaGift,
  FaExchangeAlt,
  FaChartLine
} from 'react-icons/fa';

const UserWallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [processingTopUp, setProcessingTopUp] = useState(false);
  const [filter, setFilter] = useState('all'); // all, topup, payment, refund, bonus

  useEffect(() => {
    if (user) {
      fetchWalletData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      if (!user?.uid) {
        setWallet(null);
        setTransactions([]);
        return;
      }

      // Fetch wallet
      const walletRef = doc(db, 'wallets', user.uid);
      const walletSnap = await getDoc(walletRef);
      
      if (walletSnap.exists()) {
        setWallet({
          id: walletSnap.id,
          ...walletSnap.data()
        });
      } else {
        // Create new wallet
        const newWallet = {
          userId: user.uid,
          balance: 0,
          currency: 'PHP',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(walletRef, newWallet);
        setWallet({ id: user.uid, ...newWallet, balance: 0 });
      }

      // Fetch transactions
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const transactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setWallet({ balance: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount < 100) {
      alert('Minimum top-up amount is ₱100');
      return;
    }

    if (amount > 50000) {
      alert('Maximum top-up amount is ₱50,000');
      return;
    }

    try {
      setProcessingTopUp(true);

      // Create transaction record
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
        userId: user.uid,
        type: 'topup',
        amount: amount,
        status: 'completed',
        description: 'Wallet top-up',
        paymentMethod: 'card',
        createdAt: serverTimestamp()
      });

      // Update wallet balance
      const walletRef = doc(db, 'wallets', user.uid);
      const newBalance = (wallet?.balance || 0) + amount;
      await setDoc(walletRef, {
        balance: newBalance,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Refresh data
      await fetchWalletData();
      
      setShowTopUp(false);
      setTopUpAmount('');
      alert(`Successfully added ₱${amount.toLocaleString()} to your wallet!`);
    } catch (error) {
      console.error('Error processing top-up:', error);
      alert('Failed to process top-up. Please try again.');
    } finally {
      setProcessingTopUp(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup':
        return { icon: FaArrowDown, color: 'text-green-600', bg: 'bg-green-100' };
      case 'payment':
        return { icon: FaArrowUp, color: 'text-red-600', bg: 'bg-red-100' };
      case 'refund':
        return { icon: FaArrowDown, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'bonus':
        return { icon: FaGift, color: 'text-purple-600', bg: 'bg-purple-100' };
      default:
        return { icon: FaExchangeAlt, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'text-green-600', icon: FaCheckCircle };
      case 'pending':
        return { label: 'Pending', color: 'text-yellow-600', icon: FaClock };
      case 'failed':
        return { label: 'Failed', color: 'text-red-600', icon: FaTimesCircle };
      default:
        return { label: 'Unknown', color: 'text-gray-600', icon: FaInfoCircle };
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];

  if (!user) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-slate-100 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <FaWallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
              <p className="text-gray-600 mb-6">Sign in to access your wallet</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsHeader />
      <div className="min-h-screen bg-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Wallet</h1>
            <p className="text-gray-600">Manage your balance and transactions</p>
          </div>

          {loading ? (
            <Loading message="Loading wallet..." size="medium" fullScreen={false} />
          ) : (
            <>
              {/* Balance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl p-8 mb-8 text-white"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FaWallet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Available Balance</p>
                      <h2 className="text-4xl font-bold">₱{(wallet?.balance || 0).toLocaleString()}</h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTopUp(true)}
                    className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <FaPlus className="w-4 h-4" />
                    Top Up
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <FaChartLine className="w-5 h-5 mb-2" />
                    <p className="text-xs text-emerald-100 mb-1">Total Spent</p>
                    <p className="text-xl font-bold">
                      ₱{transactions
                        .filter(t => t.type === 'payment' && t.status === 'completed')
                        .reduce((sum, t) => sum + (t.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <FaArrowDown className="w-5 h-5 mb-2" />
                    <p className="text-xs text-emerald-100 mb-1">Total Top-ups</p>
                    <p className="text-xl font-bold">
                      ₱{transactions
                        .filter(t => t.type === 'topup' && t.status === 'completed')
                        .reduce((sum, t) => sum + (t.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <FaHistory className="w-5 h-5 mb-2" />
                    <p className="text-xs text-emerald-100 mb-1">Transactions</p>
                    <p className="text-xl font-bold">{transactions.length}</p>
                  </div>
                </div>
              </motion.div>

              {/* Transactions Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { value: 'all', label: 'All Transactions' },
                    { value: 'topup', label: 'Top-ups' },
                    { value: 'payment', label: 'Payments' },
                    { value: 'refund', label: 'Refunds' },
                    { value: 'bonus', label: 'Bonuses' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFilter(value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        filter === value
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Transactions List */}
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHistory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction, index) => {
                      const iconInfo = getTransactionIcon(transaction.type);
                      const Icon = iconInfo.icon;
                      const statusInfo = getStatusInfo(transaction.status);
                      const StatusIcon = statusInfo.icon;
                      const isCredit = transaction.type === 'topup' || transaction.type === 'refund' || transaction.type === 'bonus';

                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl ${iconInfo.bg} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-5 h-5 ${iconInfo.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 capitalize">
                                  {transaction.type === 'topup' ? 'Wallet Top-up' : transaction.type}
                                </h4>
                                <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {transaction.description || 'No description'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className={`text-xl font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                              {isCredit ? '+' : '-'}₱{(transaction.amount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top-up Modal */}
      <AnimatePresence>
        {showTopUp && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaCreditCard className="text-emerald-600" />
                  Top Up Wallet
                </h3>
                <button
                  onClick={() => setShowTopUp(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimesCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 font-medium">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount.toString())}
                      className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                        topUpAmount === amount.toString()
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300 text-gray-700'
                      }`}
                    >
                      ₱{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-600 focus:outline-none text-lg font-semibold"
                    min="100"
                    max="50000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Min: ₱100 | Max: ₱50,000</p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium mb-1">Secure Payment</p>
                    <p className="text-xs text-blue-700">
                      Your payment information is encrypted and secure. Funds will be added instantly to your wallet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTopUp(false)}
                  disabled={processingTopUp}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTopUp}
                  disabled={processingTopUp || !topUpAmount || parseFloat(topUpAmount) < 100}
                  className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingTopUp ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaPlus className="w-4 h-4" />
                      Add ₱{topUpAmount ? parseFloat(topUpAmount).toLocaleString() : '0'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserWallet;

