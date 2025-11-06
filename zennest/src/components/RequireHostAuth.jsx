// src/components/RequireHostAuth.jsx
import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getHostProfile, getGuestProfile } from "../services/firestoreService";
import Loading from "./Loading";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

const RequireHostAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingHost, setCheckingHost] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const checkHostStatus = async () => {
      if (!user) {
        setCheckingHost(false);
        return;
      }

      try {
        // Check if user is a host
        const hostResult = await getHostProfile(user.uid);
        if (hostResult.success && hostResult.data) {
          // Verify the role is actually 'host' in the profile
          const role = hostResult.data.role;
          if (role === 'host') {
            setIsHost(true);
          } else {
            // Profile exists but role is not 'host'
            setIsHost(false);
          }
        } else {
          // User is not a host - check if they're a guest to show appropriate message
          const { getGuestProfile } = await import('../services/firestoreService');
          const guestResult = await getGuestProfile(user.uid);
          if (guestResult.success && guestResult.data) {
            // User is a guest, not a host
            setIsHost(false);
          } else {
            // User has no profile yet
            setIsHost(false);
          }
        }
      } catch (err) {
        console.error('Error checking host status:', err);
        setError('Failed to verify host status. Please try again.');
      } finally {
        setCheckingHost(false);
      }
    };

    if (!loading && user) {
      checkHostStatus();
    } else if (!loading && !user) {
      setCheckingHost(false);
    }
  }, [user, loading]);

  // Show loading state
  if (loading || checkingHost) {
    return <Loading message="Verifying host access..." size="large" fullScreen={true} />;
  }

  // Not authenticated - redirect to login
  if (!user && !loading && !checkingHost) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Not a host - redirect to onboarding (but don't redirect if already on onboarding/register page)
  // Also check that we're actually on a protected route that requires host status
  const isOnboardingOrRegister = location.pathname.startsWith('/host/onboarding') || 
                                  location.pathname.startsWith('/host/register') ||
                                  location.pathname.startsWith('/host/verify-email');
  
  if (!isHost && !error && !loading && !checkingHost && !isOnboardingOrRegister) {
    return <Navigate to="/host/onboarding" replace />;
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

  // User is authenticated and is a host - render children
  return children;
};

export default RequireHostAuth;

