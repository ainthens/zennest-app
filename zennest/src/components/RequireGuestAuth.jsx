// src/components/RequireGuestAuth.jsx
import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useActiveRole from "../hooks/useActiveRole";
import Loading from "./Loading";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const RequireGuestAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const { activeRole, hasGuest, loading: roleLoading } = useActiveRole();
  const location = useLocation();
  const [error, setError] = useState(null);

  // Check if user's active role is 'guest'
  const isGuest = activeRole === 'guest';
  const checkingRole = loading || roleLoading;

  // Show loading state
  if (loading || checkingRole) {
    return <Loading message="Verifying access..." size="large" fullScreen={true} />;
  }

  // Not authenticated - redirect to login, preserve any state including bookingData
  if (!user && !loading && !checkingRole) {
    // Preserve bookingData from sessionStorage if state is lost
    const preservedState = {
      from: location.pathname,
      ...location.state
    };
    
    // If we have bookingData in sessionStorage but not in state, add it
    if (!preservedState.bookingData) {
      try {
        const stored = sessionStorage.getItem('bookingData');
        if (stored) {
          preservedState.bookingData = JSON.parse(stored);
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    return <Navigate to="/login" state={preservedState} replace />;
  }

  // If user has guest profile but active role is host, still allow access to guest routes
  // (They can switch to guest view from within the app)
  // However, if they don't have a guest profile at all, allow access (profile will be created)
  if (hasGuest && !isGuest && !error && !loading && !checkingRole) {
    // User has guest profile but is in host mode - allow access
    // The RoleSwitcher component will handle switching
    return children;
  }
  
  // If user doesn't have guest profile, allow access (profile will be created automatically)
  if (!hasGuest && !error && !loading && !checkingRole) {
    // User doesn't have guest profile yet - allow access (profile will be created)
    return children;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  // User is authenticated and is a guest (or no profile yet) - render children
  return children;
};

export default RequireGuestAuth;
