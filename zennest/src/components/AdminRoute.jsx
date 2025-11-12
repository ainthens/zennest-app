import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * AdminRoute - Simple localStorage-based admin protection
 * Uses NEW system: localStorage.isAdmin and localStorage.adminLoginTime
 * NO context, NO hooks - just direct localStorage checks
 */
const AdminRoute = ({ children }) => {
  // ✅ NEW SYSTEM: Read from localStorage directly (synchronous)
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminLoginTime = localStorage.getItem('adminLoginTime');

  console.log('🔐 AdminRoute: Checking admin status...');
  console.log('📋 AdminRoute: isAdmin =', isAdmin);
  console.log('⏰ AdminRoute: adminLoginTime =', adminLoginTime);

  // ✅ Check if session is expired (24 hours)
  const isSessionExpired = () => {
    if (!adminLoginTime) return true;

    const sessionAge = Date.now() - parseInt(adminLoginTime);
    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > SESSION_TIMEOUT) {
      console.warn('⏰ AdminRoute: Admin session expired (older than 24 hours)');
      // Clear expired session
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminLoginTime');
      return true;
    }

    return false;
  };

  // Not admin or session expired - redirect to admin login
  if (!isAdmin || isSessionExpired()) {
    console.warn('❌ AdminRoute: User not admin or session expired - redirecting to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  // Is admin and session valid - render children
  console.log('✅ AdminRoute: Admin verified - rendering protected content');
  return children;
};

export default AdminRoute;