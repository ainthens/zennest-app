// src/pages/HostPaymentsReceiving.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHostProfile, updatePaymentMethods } from '../services/firestoreService';
import useAuth from '../hooks/useAuth';
import {
  FaCreditCard,
  FaPaypal,
  FaUniversity,
  FaCheck,
  FaPlus,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const HostPaymentsReceiving = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: 'bank', // 'bank', 'paypal', 'stripe'
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    paypalEmail: '',
    stripeAccount: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaCreditCard className="text-emerald-600" />
            Receiving Payments
          </h1>
          <p className="text-gray-600">Manage how you receive payments from bookings</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <FaPlus />
            <span>Add Payment Method</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingMethod !== null ? 'Edit Payment Method' : 'Add Payment Method'}
          </h2>

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
                ].map(option => {
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
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
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
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="123456789"
                  />
                </div>
              </>
            )}

            {formData.type === 'paypal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PayPal Email *
                </label>
                <input
                  type="email"
                  name="paypalEmail"
                  value={formData.paypalEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="paypal@example.com"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Payment Methods</h2>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaCreditCard className="text-5xl mx-auto mb-4 text-gray-300" />
            <p>No payment methods added yet</p>
            <p className="text-sm mt-2">Add a payment method to start receiving payments</p>
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
                  {getMethodIcon(method.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 capitalize">
                        {method.type === 'bank' ? 'Bank Account' : method.type}
                      </p>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {method.type === 'bank' && method.accountName}
                      {method.type === 'paypal' && method.paypalEmail}
                      {method.type === 'stripe' && method.stripeAccount}
                    </p>
                    {method.type === 'bank' && (
                      <p className="text-xs text-gray-500 mt-1">
                        ****{method.accountNumber?.slice(-4) || '****'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostPaymentsReceiving;

