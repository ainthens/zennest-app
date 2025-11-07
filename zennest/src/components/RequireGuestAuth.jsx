// src/components/RequireGuestAuth.jsx
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getGuestProfile, getHostProfile } from "../services/firestoreService";
import Loading from "./Loading";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const RequireGuestAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        // First check if user is a host (hosts cannot access guest routes)
        const hostResult = await getHostProfile(user.uid);
        if (hostResult.success && hostResult.data) {
          setIsHost(true);
          setIsGuest(false);
          setCheckingRole(false);
          return;
        }

        // Not a host, check if user is a guest
        const guestResult = await getGuestProfile(user.uid);
        if (guestResult.success && guestResult.data) {
          setIsGuest(true);
          setIsHost(false);
        } else {
          // User is authenticated but has no profile yet
          // Allow access - profile will be created automatically
          setIsGuest(true);
          setIsHost(false);
        }
      } catch (err) {
        console.error('Error checking user role:', err);
        setError('Failed to verify user status. Please try again.');
      } finally {
        setCheckingRole(false);
      }
    };

    // Wait for auth to finish loading before checking role
    if (!loading) {
      if (user) {
        checkUserRole();
      } else {
        setCheckingRole(false);
      }
    }
  }, [user, loading]);

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

  // User is a host - redirect to host dashboard
  if (isHost && !error && !loading && !checkingRole) {
    return <Navigate to="/host/dashboard" replace />;
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
