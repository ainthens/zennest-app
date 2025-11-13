// src/components/RoleSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useActiveRole from '../hooks/useActiveRole';
import { FaUser, FaHome, FaExchangeAlt, FaSpinner, FaChevronDown } from 'react-icons/fa';

const RoleSwitcher = ({ variant = 'default' }) => {
  const { activeRole, hasHost, hasGuest, canSwitchRoles, switchRole, loading } = useActiveRole();
  const [switching, setSwitching] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);

  // Check if this is a sidebar variant
  const isSidebar = variant === 'sidebar';

  // Calculate dropdown position for sidebar variant
  // IMPORTANT: Hooks must be called before any conditional returns
  useEffect(() => {
    if (isSidebar && buttonRef.current && showMenu && canSwitchRoles) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const buttonRect = buttonRef.current.getBoundingClientRect();
          // Position dropdown above the button
          // Approximate dropdown height is ~280px, position it above with some margin
          const dropdownHeight = 280;
          const margin = 8;
          setDropdownPosition({
            top: buttonRect.top - dropdownHeight - margin,
            left: buttonRect.left,
            width: buttonRect.width
          });
        }
      };
      
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isSidebar, showMenu, canSwitchRoles]);

  // Don't show switcher if user can't switch roles - must be after all hooks
  if (!canSwitchRoles || loading) {
    return null;
  }

  const handleSwitchRole = async (newRole) => {
    if (newRole === activeRole || switching) {
      return;
    }

    try {
      setSwitching(true);
      setShowMenu(false);
      
      // Switch role (this will reload the page automatically on success)
      const result = await switchRole(newRole);
      
      if (!result.success) {
        console.error('Failed to switch role:', result.error);
        alert(result.error || 'Failed to switch role. Please try again.');
        setSwitching(false);
      }
      // Note: If successful, switchRole will reload the page, so we don't need to navigate
    } catch (error) {
      console.error('Error switching role:', error);
      alert('Failed to switch role. Please try again.');
      setSwitching(false);
    }
  };

  if (switching) {
    return (
      <div className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg ${isSidebar ? 'w-full' : ''}`}>
        <FaSpinner className="animate-spin text-emerald-600 text-xs sm:text-sm" />
        <span className={`text-emerald-700 font-medium ${isSidebar ? 'text-xs' : 'text-sm'}`}>Switching...</span>
      </div>
    );
  }

  const renderDropdown = () => (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onClick={() => setShowMenu(false)}
      />
      
      {/* Dropdown Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: isSidebar ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: isSidebar ? 10 : -10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`
          ${isSidebar ? 'fixed' : 'absolute'} 
          ${isSidebar ? '' : 'right-0 top-full mt-2'} 
          ${isSidebar ? '' : 'w-64'} 
          bg-white rounded-xl shadow-2xl border border-gray-200 z-[101] overflow-hidden
          ${isSidebar ? 'max-h-[280px] overflow-y-auto' : ''}
        `}
        style={isSidebar ? {
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`
        } : {}}
      >
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
          <p className="text-xs font-semibold text-emerald-900 mb-1">Switch View</p>
          <p className="text-xs text-emerald-700">
            Change your perspective to access different features
          </p>
        </div>

        <div className="py-2">
          {/* Host View Option */}
          {hasHost && (
            <button
              onClick={() => handleSwitchRole('host')}
              disabled={activeRole === 'host'}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeRole === 'host'
                  ? 'bg-emerald-50 text-emerald-700 cursor-default'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeRole === 'host'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <FaHome className="text-lg" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Host View</p>
                <p className="text-xs text-gray-500">Manage listings & bookings</p>
              </div>
              {activeRole === 'host' && (
                <span className="text-xs font-semibold text-emerald-600">Active</span>
              )}
            </button>
          )}

          {/* Guest View Option */}
          {hasGuest && (
            <button
              onClick={() => handleSwitchRole('guest')}
              disabled={activeRole === 'guest'}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeRole === 'guest'
                  ? 'bg-emerald-50 text-emerald-700 cursor-default'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeRole === 'guest'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <FaUser className="text-lg" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Guest View</p>
                <p className="text-xs text-gray-500">Browse & book listings</p>
              </div>
              {activeRole === 'guest' && (
                <span className="text-xs font-semibold text-emerald-600">Active</span>
              )}
            </button>
          )}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Same account, different perspective
          </p>
        </div>
      </motion.div>
    </>
  );

  return (
    <div className={`relative ${isSidebar ? 'w-full' : ''}`}>
      <motion.button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className={`
          w-full flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg
          transition-all duration-200 font-semibold border-2
          shadow-sm hover:shadow-md min-h-[44px]
          ${isSidebar 
            ? 'justify-between text-emerald-700 bg-white border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300' 
            : 'justify-center bg-white border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700'
          }
        `}
        whileHover={{ scale: isSidebar ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Switch role"
        aria-expanded={showMenu}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FaExchangeAlt className={`${isSidebar ? 'text-xs sm:text-sm text-emerald-600 flex-shrink-0' : 'text-gray-600'}`} />
          <span className={`${isSidebar ? 'text-xs sm:text-sm' : 'text-sm'} font-semibold truncate`}>
            {activeRole === 'host' ? 'Host View' : 'Guest View'}
          </span>
        </div>
        <FaChevronDown className={`text-xs sm:text-sm transition-transform duration-200 flex-shrink-0 ${showMenu ? 'rotate-180' : ''} ${isSidebar ? 'text-emerald-600' : 'text-gray-500'}`} />
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          isSidebar && typeof document !== 'undefined'
            ? createPortal(renderDropdown(), document.body)
            : renderDropdown()
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSwitcher;
