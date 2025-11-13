// src/hooks/useActiveRole.js
import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { getUserRoles, getUserPreferences, setActiveRole } from '../services/firestoreService';

const useActiveRole = () => {
  const { user, loading } = useAuth();
  const [activeRole, setActiveRoleState] = useState(null); // 'host', 'guest', or null
  const [availableRoles, setAvailableRoles] = useState({ hasHost: false, hasGuest: false });
  const [roleLoading, setRoleLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user roles and active role preference
  useEffect(() => {
    const loadRoles = async () => {
      if (loading) {
        return;
      }

      if (!user) {
        setActiveRoleState(null);
        setAvailableRoles({ hasHost: false, hasGuest: false });
        setRoleLoading(false);
        return;
      }

      try {
        setRoleLoading(true);
        setError(null);

        // Get available roles
        const rolesResult = await getUserRoles(user.uid);
        if (rolesResult.success) {
          setAvailableRoles({
            hasHost: rolesResult.hasHost,
            hasGuest: rolesResult.hasGuest
          });
        }

        // Get active role preference
        const preferencesResult = await getUserPreferences(user.uid);
        let preferredRole = preferencesResult.success && preferencesResult.data?.activeRole 
          ? preferencesResult.data.activeRole 
          : null;

        // Check localStorage for immediate access
        if (typeof window !== 'undefined') {
          const storedRole = localStorage.getItem(`activeRole_${user.uid}`);
          if (storedRole && (storedRole === 'host' || storedRole === 'guest')) {
            preferredRole = storedRole;
          }
        }

        // Determine active role based on available roles and preference
        if (preferredRole) {
          // Verify the preferred role is available
          if (preferredRole === 'host' && rolesResult.hasHost) {
            setActiveRoleState('host');
          } else if (preferredRole === 'guest' && rolesResult.hasGuest) {
            setActiveRoleState('guest');
          } else {
            // Preferred role not available, use default
            if (rolesResult.hasHost) {
              setActiveRoleState('host');
            } else if (rolesResult.hasGuest) {
              setActiveRoleState('guest');
            } else {
              setActiveRoleState(null);
            }
          }
        } else {
          // No preference set, use default: host if available, otherwise guest
          if (rolesResult.hasHost) {
            setActiveRoleState('host');
          } else if (rolesResult.hasGuest) {
            setActiveRoleState('guest');
          } else {
            setActiveRoleState(null);
          }
        }
      } catch (err) {
        console.error('Error loading roles:', err);
        setError(err.message);
        setActiveRoleState(null);
      } finally {
        setRoleLoading(false);
      }
    };

    loadRoles();
  }, [user, loading]);

  // Switch active role
  const switchRole = async (newRole) => {
    if (!user) {
      setError('User must be logged in to switch roles');
      return { success: false, error: 'User must be logged in' };
    }

    if (newRole !== 'host' && newRole !== 'guest') {
      setError('Invalid role. Must be "host" or "guest"');
      return { success: false, error: 'Invalid role' };
    }

    // Verify the role is available
    if (newRole === 'host' && !availableRoles.hasHost) {
      setError('Host profile not available');
      return { success: false, error: 'Host profile not available' };
    }

    if (newRole === 'guest' && !availableRoles.hasGuest) {
      setError('Guest profile not available');
      return { success: false, error: 'Guest profile not available' };
    }

    try {
      // Update in Firestore
      const result = await setActiveRole(user.uid, newRole);
      
      if (result.success) {
        // Update local state
        setActiveRoleState(newRole);
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`activeRole_${user.uid}`, newRole);
        }
        
        setError(null);
        
        // Reload the page to apply role changes
        window.location.reload();
        
        return { success: true };
      } else {
        setError(result.error || 'Failed to switch role');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error switching role:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    activeRole, // Current active role: 'host', 'guest', or null
    availableRoles, // { hasHost: boolean, hasGuest: boolean }
    isHost: activeRole === 'host',
    isGuest: activeRole === 'guest',
    hasHost: availableRoles.hasHost,
    hasGuest: availableRoles.hasGuest,
    canSwitchRoles: availableRoles.hasHost && availableRoles.hasGuest,
    switchRole,
    loading: roleLoading,
    error
  };
};

export default useActiveRole;

