// src/components/RequireHostAuth.jsx
import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useActiveRole from "../hooks/useActiveRole";
import Loading from "./Loading";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

const RequireHostAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const { activeRole, hasHost, loading: roleLoading } = useActiveRole();
  const location = useLocation();
  const [error, setError] = useState(null);

  // Check if user's active role is 'host'
  const isHost = activeRole === 'host';
  const checkingHost = loading || roleLoading;

  // Show loading state
  if (loading || checkingHost) {
    return <Loading message="Verifying host access..." size="large" fullScreen={true} />;
  }

  // Not authenticated - redirect to login
  if (!user && !loading && !checkingHost) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user is on onboarding/register pages (allow access)
  const isOnboardingOrRegister = location.pathname.startsWith('/host/onboarding') || 
                                  location.pathname.startsWith('/host/register') ||
                                  location.pathname.startsWith('/host/verify-email');
  
  // User doesn't have a host profile - redirect to onboarding (unless on onboarding pages)
  if (!hasHost && !error && !loading && !checkingHost && !isOnboardingOrRegister) {
    return <Navigate to="/host/onboarding" replace />;
  }
  
  // User has host profile - allow access (regardless of active role)
  // The RoleSwitcher component will allow them to switch roles if needed
  // This allows hosts to access host routes even if they're currently in guest mode

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

  // User is authenticated and is a host - render children
  return children;
};

export default RequireHostAuth;

