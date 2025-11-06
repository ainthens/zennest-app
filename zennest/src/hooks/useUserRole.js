// src/hooks/useUserRole.js
import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { getHostProfile, getGuestProfile } from '../services/firestoreService';

const useUserRole = () => {
  const { user, loading } = useAuth();
  const [role, setRole] = useState(null); // 'host', 'guest', or null
  const [roleLoading, setRoleLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      if (loading) {
        return;
      }

      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        setRoleLoading(true);
        setError(null);

        // First check if user is a host
        const hostResult = await getHostProfile(user.uid);
        if (hostResult.success && hostResult.data) {
          const profileRole = hostResult.data.role;
          if (profileRole === 'host') {
            setRole('host');
            setRoleLoading(false);
            return;
          }
        }

        // Not a host, check if user is a guest
        const guestResult = await getGuestProfile(user.uid);
        if (guestResult.success && guestResult.data) {
          const profileRole = guestResult.data.role;
          if (profileRole === 'guest') {
            setRole('guest');
            setRoleLoading(false);
            return;
          }
        }

        // User is authenticated but has no profile yet
        setRole(null);
        setRoleLoading(false);
      } catch (err) {
        console.error('Error checking user role:', err);
        setError(err.message);
        setRole(null);
        setRoleLoading(false);
      }
    };

    checkRole();
  }, [user, loading]);

  return {
    role, // 'host', 'guest', or null
    isHost: role === 'host',
    isGuest: role === 'guest',
    hasRole: role !== null,
    loading: roleLoading,
    error
  };
};

export default useUserRole;
