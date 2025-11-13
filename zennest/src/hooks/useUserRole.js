// src/hooks/useUserRole.js
import useAuth from './useAuth';
import useActiveRole from './useActiveRole';

const useUserRole = () => {
  const { user, loading } = useAuth();
  const { 
    activeRole, 
    availableRoles, 
    isHost, 
    isGuest, 
    hasHost, 
    hasGuest, 
    canSwitchRoles,
    switchRole,
    loading: roleLoading, 
    error 
  } = useActiveRole();

  return {
    role: activeRole, // Current active role: 'host', 'guest', or null
    isHost, // true if active role is 'host'
    isGuest, // true if active role is 'guest'
    hasRole: activeRole !== null, // true if user has an active role
    hasHost, // true if user has a host profile
    hasGuest, // true if user has a guest profile
    canSwitchRoles, // true if user has both host and guest profiles
    switchRole, // function to switch roles
    availableRoles, // { hasHost: boolean, hasGuest: boolean }
    loading: loading || roleLoading, // true if auth or role is loading
    error
  };
};

export default useUserRole;
