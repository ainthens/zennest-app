// src/pages/HostPaymentsReceiving.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHostProfile, updatePaymentMethods, getHostBookings } from '../services/firestoreService';
import useAuth from '../hooks/useAuth';
import {
  FaCreditCard,
  FaPaypal,
  FaUniversity,
  FaCheck,
  FaPlus,
  FaEdit,
  FaTrash,
  FaWallet,
  FaClock,
  FaCheckCircle,
  FaMoneyBillWave,
  FaArrowRight,
  FaHistory,
  FaChartLine,
  FaExclamationCircle
} from 'react-icons/fa';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const HostPaymentsReceiving = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [earnings, setEarnings] = useState({
    available: 0,
    pending: 0,
    totalEarned: 0,
    thisMonth: 0
  });
  const [cashOutHistory, setCashOutHistory] = useState([]);
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [processingCashOut, setProcessingCashOut] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bank',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    paypalEmail: '',
    stripeAccount: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
      fetchEarnings();
      fetchCashOutHistory();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const result = await getHostProfile(user.uid);
      if (result.success && result.data) {
        setPaymentMethods(result.data.paymentMethods || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const bookingsResult = await getHostBookings(user.uid);
      const bookings = bookingsResult.data || [];

      // Calculate available balance (completed bookings)
      const available = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total || b.totalAmount || 0), 0);

      // Calculate pending balance (confirmed but not completed)
      const pending = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.total || b.totalAmount || 0), 0);

      // Calculate total earned
      const totalEarned = bookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.total || b.totalAmount || 0), 0);

      // Calculate this month's earnings
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = bookings
        .filter(b => {
          if (b.status !== 'completed' && b.status !== 'confirmed') return false;
          const bookingDate = b.checkIn?.toDate ? b.checkIn.toDate() : new Date(b.checkIn);
          return bookingDate >= firstDayOfMonth;
        })
        .reduce((sum, b) => sum + (b.total || b.totalAmount || 0), 0);

      setEarnings({
        available,
        pending,
        totalEarned,
        thisMonth
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const fetchCashOutHistory = async () => {
    try {
      const cashOutQuery = query(
        collection(db, 'cashOuts'),
        where('hostId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(cashOutQuery);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCashOutHistory(history);
    } catch (error) {
      console.error('Error fetching cash out history:', error);
    }
  };

  const handleCashOut = async () => {
    if (!cashOutAmount || parseFloat(cashOutAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(cashOutAmount) > earnings.available) {
      alert('Insufficient available balance');
      return;
    }

    if (!selectedPaymentMethod && paymentMethods.length === 0) {
      alert('Please add a payment method first');
      return;
    }

    const paymentMethod = selectedPaymentMethod || paymentMethods.find(m => m.isDefault) || paymentMethods[0];

    if (paymentMethod.type !== 'paypal') {
      alert('Currently, only PayPal cash out is supported. Please add a PayPal payment method.');
      return;
    }

    try {
      setProcessingCashOut(true);

      // Create cash out request
      await addDoc(collection(db, 'cashOuts'), {
        hostId: user.uid,
        amount: parseFloat(cashOutAmount),
        paymentMethod: {
          type: paymentMethod.type,
          accountName: paymentMethod.accountName,
          accountNumber: paymentMethod.accountNumber ? `****${paymentMethod.accountNumber.slice(-4)}` : null,
          paypalEmail: paymentMethod.paypalEmail,
          bankName: paymentMethod.bankName
        },
        status: 'pending', // pending, processing, completed, failed
        createdAt: new Date(),
        processedAt: null
      });

      alert('Cash out request submitted successfully! Processing typically takes 3-5 business days.');
      setShowCashOutModal(false);
      setCashOutAmount('');
      setSelectedPaymentMethod(null);
      fetchCashOutHistory();
      fetchEarnings();
    } catch (error) {
      console.error('Error processing cash out:', error);
      alert('Failed to process cash out. Please try again.');
    } finally {
      setProcessingCashOut(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let updatedMethods;
      
      if (editingMethod !== null) {
        // Update existing method
        updatedMethods = paymentMethods.map((method, index) => 
          index === editingMethod ? { ...formData } : method
        );
      } else {
        // Add new method
        updatedMethods = [...paymentMethods, formData];
        
        // If this is set as default, unset others
        if (formData.isDefault) {
          updatedMethods = updatedMethods.map(method => ({
            ...method,
            isDefault: method === formData ? true : false
          }));
        }
      }

      // Ensure only one default
      const hasDefault = updatedMethods.some(m => m.isDefault);
      if (!hasDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }

      await updatePaymentMethods(user.uid, updatedMethods);
      setPaymentMethods(updatedMethods);
      resetForm();
      alert('Payment method saved successfully!');
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('Failed to save payment method. Please try again.');
    }
  };

  const handleEdit = (index) => {
    setEditingMethod(index);
    setFormData(paymentMethods[index]);
    setShowAddForm(true);
  };

  const handleDelete = async (index) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        const updatedMethods = paymentMethods.filter((_, i) => i !== index);
        await updatePaymentMethods(user.uid, updatedMethods);
        setPaymentMethods(updatedMethods);
      } catch (error) {
        console.error('Error deleting payment method:', error);
        alert('Failed to delete payment method. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'bank',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      paypalEmail: '',
      stripeAccount: '',
      isDefault: false
    });
    setEditingMethod(null);
    setShowAddForm(false);
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'paypal':
        return <FaPaypal className="text-2xl text-blue-600" />;
      case 'stripe':
        return <FaCreditCard className="text-2xl text-purple-600" />;
      default:
        return <FaUniversity className="text-2xl text-emerald-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FaWallet className="text-emerald-600" />
          Payments & Earnings
        </h1>
        <p className="text-gray-600">Manage your earnings and payment methods</p>
      </div>

      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <FaWallet className="text-3xl opacity-80" />
            <FaCheckCircle className="text-xl opacity-60" />
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Available Balance</p>
          <p className="text-3xl font-bold mb-2">₱{earnings.available.toLocaleString()}</p>
          <button
            onClick={() => setShowCashOutModal(true)}
            disabled={earnings.available === 0}
            className="mt-2 w-full bg-white text-emerald-600 py-2 px-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaMoneyBillWave />
            Cash Out
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <FaClock className="text-3xl text-yellow-500" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Pending Earnings</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">₱{earnings.pending.toLocaleString()}</p>
          <p className="text-xs text-gray-500">From upcoming bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <FaChartLine className="text-3xl text-blue-500" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">This Month</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">₱{earnings.thisMonth.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total earnings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <FaMoneyBillWave className="text-3xl text-purple-500" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Total Earned</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">₱{earnings.totalEarned.toLocaleString()}</p>
          <p className="text-xs text-gray-500">All time</p>
        </motion.div>
      </div>

      {/* Cash Out History */}
      {cashOutHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaHistory className="text-emerald-600" />
              Cash Out History
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {cashOutHistory.slice(0, 5).map((cashOut, index) => (
              <motion.div
                key={cashOut.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    {getMethodIcon(cashOut.paymentMethod.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">₱{cashOut.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {cashOut.paymentMethod.type === 'bank' 
                        ? `${cashOut.paymentMethod.bankName || 'Bank'} ${cashOut.paymentMethod.accountNumber || ''}`
                        : cashOut.paymentMethod.paypalEmail || cashOut.paymentMethod.type
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {cashOut.createdAt?.toDate ? cashOut.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(cashOut.status)}`}>
                    {cashOut.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaCreditCard className="text-emerald-600" />
              Payment Methods
            </h2>
            <p className="text-sm text-gray-600 mt-1">Add where you want to receive your earnings</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
            >
              <FaPlus className="text-xs" />
              <span>Add Method</span>
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border-b border-gray-200 bg-gray-50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingMethod !== null ? 'Edit Payment Method' : 'Add Payment Method'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'bank', label: 'Bank Account', icon: FaUniversity },
                    { value: 'paypal', label: 'PayPal', icon: FaPaypal },
                    { value: 'stripe', label: 'Stripe', icon: FaCreditCard }
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: option.value }))}
                        className={`
                          p-4 border-2 rounded-lg transition-all
                          ${formData.type === option.value
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className={`text-2xl mx-auto mb-2 ${
                          formData.type === option.value ? 'text-emerald-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-medium text-sm ${
                          formData.type === option.value ? 'text-emerald-700' : 'text-gray-700'
                        }`}>
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.type === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., BDO, BPI, Metrobank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="123456789"
                    />
                  </div>
                </>
              )}

              {formData.type === 'paypal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PayPal Email * (For Cash Out)
                  </label>
                  <input
                    type="email"
                    name="paypalEmail"
                    value={formData.paypalEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="paypal@example.com"
                  />
                  <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                    <FaExclamationCircle />
                    Use your PayPal Sandbox email for testing
                  </p>
                </div>
              )}

              {formData.type === 'stripe' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stripe Account ID *
                  </label>
                  <input
                    type="text"
                    name="stripeAccount"
                    value={formData.stripeAccount}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="acct_..."
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Set as default payment method
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {editingMethod !== null ? 'Update' : 'Add'} Payment Method
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaCreditCard className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-700 mb-2">No payment methods added yet</p>
            <p className="text-sm">Add a payment method to receive your earnings</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {getMethodIcon(method.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 capitalize">
                        {method.type === 'bank' ? `${method.bankName || 'Bank Account'}` : method.type}
                      </p>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold flex items-center gap-1">
                          <FaCheck className="text-[10px]" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {method.type === 'bank' && method.accountName}
                      {method.type === 'paypal' && method.paypalEmail}
                      {method.type === 'stripe' && method.stripeAccount}
                    </p>
                    {method.type === 'bank' && method.accountNumber && (
                      <p className="text-xs text-gray-500 mt-1">
                        ****{method.accountNumber.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cash Out Modal */}
      {showCashOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-600" />
              Cash Out to PayPal
            </h2>

            <div className="mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-emerald-700 font-medium mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-emerald-600">₱{earnings.available.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Cash Out *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
                  <input
                    type="number"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                    min="0"
                    max={earnings.available}
                    step="0.01"
                  />
                </div>
                <button
                  onClick={() => setCashOutAmount(earnings.available.toString())}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2"
                >
                  Cash out full amount
                </button>
              </div>

              {paymentMethods.filter(m => m.type === 'paypal').length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PayPal Account
                  </label>
                  <div className="space-y-2">
                    {paymentMethods.filter(m => m.type === 'paypal').map((method, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(method)}
                        className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                          selectedPaymentMethod === method || (selectedPaymentMethod === null && method.isDefault)
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FaPaypal className="text-2xl text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">PayPal</p>
                              <p className="text-xs text-gray-600">{method.paypalEmail}</p>
                            </div>
                          </div>
                          {method.isDefault && !selectedPaymentMethod && (
                            <span className="text-xs text-emerald-600 font-semibold">Default</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethods.filter(m => m.type === 'paypal').length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <FaExclamationCircle />
                    Please add a PayPal payment method to cash out
                  </p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Testing with PayPal Sandbox:</strong>
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Use your PayPal Sandbox email</li>
                  <li>Processing is simulated (3-5 business days)</li>
                  <li>No real money will be transferred</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCashOut}
                disabled={processingCashOut || !cashOutAmount || parseFloat(cashOutAmount) <= 0 || paymentMethods.filter(m => m.type === 'paypal').length === 0}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingCashOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaArrowRight />
                    Confirm Cash Out
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCashOutModal(false);
                  setCashOutAmount('');
                  setSelectedPaymentMethod(null);
                }}
                disabled={processingCashOut}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HostPaymentsReceiving;

