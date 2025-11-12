// Create this new file for debugging admin login issues

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaSyncAlt, FaHome, FaShieldAlt, FaTrash } from 'react-icons/fa';

const AdminDebug = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = React.useState(0);

  // ✅ NEW: Read directly from localStorage using NEW keys
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminLoginTime = localStorage.getItem('adminLoginTime');

  const handleTestAdminLogin = () => {
    console.log('Testing admin login...');
    
    // ✅ Set admin session using NEW keys
    const loginTime = Date.now();
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminLoginTime', loginTime.toString());
    
    setRefresh(r => r + 1);
    
    setTimeout(() => {
      navigate('/admin', { replace: true });
    }, 100);
  };

  const handleClearSession = () => {
    console.log('Clearing admin session...');
    
    // ✅ Clear using NEW keys
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    
    setRefresh(r => r + 1);
  };

  const isSessionExpired = () => {
    if (!adminLoginTime) return true;

    const sessionAge = Date.now() - parseInt(adminLoginTime);
    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

    return sessionAge > SESSION_TIMEOUT;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <FaShieldAlt className="text-emerald-600" />
          Admin Debug Console
        </h1>

        {/* Status Display */}
        <div className="mb-8 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">isAdmin:</span>
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <>
                      <FaCheck className="text-green-600" />
                      <span className="text-green-600 font-semibold">true</span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="text-red-600" />
                      <span className="text-red-600 font-semibold">false</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Session Expired:</span>
                <div className="flex items-center gap-2">
                  {isSessionExpired() ? (
                    <>
                      <FaTimes className="text-red-600" />
                      <span className="text-red-600 font-semibold">Yes</span>
                    </>
                  ) : (
                    <>
                      <FaCheck className="text-green-600" />
                      <span className="text-green-600 font-semibold">No</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Admin Login Time:</span>
                <span className="text-gray-600 font-mono text-sm">{formatTime(adminLoginTime)}</span>
              </div>
            </div>
          </div>

          {/* localStorage Display */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">localStorage Contents (NEW System)</h2>
            <div className="space-y-2 font-mono text-sm bg-white p-3 rounded border border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">isAdmin:</span>
                <span className="font-bold text-gray-900">{localStorage.getItem('isAdmin') || 'NOT SET'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">adminLoginTime:</span>
                <span className="font-bold text-gray-900">{localStorage.getItem('adminLoginTime') || 'NOT SET'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTestAdminLogin}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
            >
              <FaCheck /> Set Admin Session & Redirect
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearSession}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2"
            >
              <FaTrash /> Clear Admin Session
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRefresh(r => r + 1)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
            >
              <FaSyncAlt /> Refresh Status
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold flex items-center justify-center gap-2"
            >
              <FaHome /> Go Home
            </motion.button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-2">NEW System (Active):</h3>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Uses <code className="bg-white px-1 rounded">localStorage.isAdmin</code></li>
            <li>Uses <code className="bg-white px-1 rounded">localStorage.adminLoginTime</code></li>
            <li>No context provider - direct localStorage checks</li>
            <li>Session timeout: 24 hours</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDebug;