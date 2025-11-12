// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';

import {
  FaChartLine,
  FaDollarSign,
  FaGavel,
  FaExclamationTriangle,
  FaWallet,
  FaDownload,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaShieldAlt,
  FaUsers,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaSearch,
  FaBell,
  FaChevronDown,
  FaBook,
  FaFileContract,
  FaClipboard,
  FaMoneyBillWave,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaSpinner
} from 'react-icons/fa';

// Loading Skeleton Component
const SkeletonLoader = ({ count = 3, height = 'h-12' }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${height} bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse`} />
    ))}
  </div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, trend, loading = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        ) : (
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        )}
      </div>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
        <Icon className="text-emerald-600 text-lg" />
      </div>
    </div>
    {trend && !loading && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
        {Math.abs(trend)}% vs last month
      </div>
    )}
  </motion.div>
);

// Section Header Component
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-2">
      {Icon && <Icon className="text-emerald-600 text-xl" />}
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
    {description && <p className="text-sm text-gray-600 ml-8">{description}</p>}
  </div>
);

// Modal Component
const Modal = ({ isOpen, title, children, onClose, primaryAction, primaryLabel = "Save" }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">{children}</div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              {primaryAction && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={primaryAction}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                >
                  {primaryLabel}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Toast Notification Component
const Toast = ({ message, type = 'success', isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 20, x: 20 }}
        className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
          type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}
      >
        {type === 'success' ? (
          <FaCheckCircle className="text-green-600" />
        ) : (
          <FaTimesCircle className="text-red-600" />
        )}
        <span className={type === 'success' ? 'text-green-900' : 'text-red-900'}>
          {message}
        </span>
      </motion.div>
    )}
  </AnimatePresence>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const [stats, setStats] = useState({
    totalHosts: 0,
    totalGuests: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeListings: 0,
    pendingReports: 0
  });

  const [serviceFee, setServiceFee] = useState(5);
  const [editingFee, setEditingFee] = useState(false);
  const [policies, setPolicies] = useState({
    cancellation: 'Users may cancel up to 48 hours before booking.',
    platformRules: 'All listings must comply with local regulations.',
    termsOfService: 'By using this platform, you agree to our terms.'
  });
  const [editingPolicy, setEditingPolicy] = useState(null);

  // ✅ FIXED: REMOVED all admin authentication checks
  // AdminRoute.jsx handles access control - this component assumes it only renders when admin is verified

  // ✅ FIXED: Only check session timeout on a schedule (optional)
  useEffect(() => {
    const sessionCheckInterval = setInterval(() => {
      const isAdmin = localStorage.getItem('isAdmin');
      const adminLoginTime = localStorage.getItem('adminLoginTime');
      
      if (!isAdmin || !adminLoginTime) {
        console.log('🚪 Admin session missing - logging out');
        handleLogout();
        return;
      }

      // Check if session is older than 24 hours
      const sessionAge = Date.now() - parseInt(adminLoginTime);
      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > SESSION_TIMEOUT) {
        console.log('⏰ Admin session expired (24+ hours) - logging out');
        handleLogout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, [navigate]);

  // ✅ FIXED: Load dashboard data on mount, independent of auth checks
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching admin dashboard data...');
      
      // Simulate API call - replace with actual Firebase queries
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalHosts: 156,
        totalGuests: 2340,
        totalBookings: 8920,
        totalRevenue: 450000,
        activeListings: 432,
        pendingReports: 12
      });
      
      console.log('✅ Dashboard data loaded');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      console.log('🚪 Admin logout initiated');
      
      // ✅ Clear admin flag using NEW keys
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminLoginTime');
      
      console.log('✅ Admin session cleared');
      
      // Navigate to admin login
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Still clear and redirect even if there's an error
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminLoginTime');
      
      navigate('/admin/login', { replace: true });
    }
  };

  // Handle Service Fee Update
  const handleUpdateServiceFee = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      showToast(`Service fee updated to ${serviceFee}%`);
      setEditingFee(false);
    } catch (error) {
      showToast('Failed to update service fee', 'error');
    }
  };

  // Handle Policy Update
  const handleUpdatePolicy = async (policyType) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      showToast(`${policyType} policy updated successfully`);
      setEditingPolicy(null);
    } catch (error) {
      showToast('Failed to update policy', 'error');
    }
  };

  // ✅ FIXED: Only show data loading state, not access verification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </motion.div>
      </div>
    );
  }

  // Menu items
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'service-fees', label: 'Service Fees', icon: FaDollarSign },
    { id: 'policies', label: 'Policies', icon: FaGavel },
    { id: 'reports', label: 'Reports', icon: FaExclamationTriangle },
    { id: 'payments', label: 'Payments', icon: FaWallet },
  ];

  // ✅ FIXED: Render full dashboard UI - AdminRoute guarantees admin access
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* ==================== SIDEBAR ==================== */}
      <motion.aside
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl z-50 flex flex-col overflow-hidden`}
      >
        {/* Logo & Branding */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <FaShieldAlt className="text-white text-lg" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Zennest</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                onClick={() => {
                  setActiveSection(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className="text-lg" />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-300 mb-1">Logged in as Admin</p>
            <p className="text-sm font-semibold text-white">Admin Dashboard</p>
            <p className="text-xs text-emerald-400 mt-1">✓ Admin Access</p>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 rounded-lg transition-all font-semibold text-sm"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ===== TOPBAR ===== */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            {/* Left: Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <FaTimes className="text-xl text-gray-600" />
                ) : (
                  <FaBars className="text-xl text-gray-600" />
                )}
              </motion.button>

              {/* Search Bar */}
              <div className="hidden sm:flex flex-1 max-w-md items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                <FaSearch className="text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
                />
              </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaBell className="text-lg text-gray-600" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              </motion.button>

              {/* User Menu Trigger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <FaChevronDown className="text-xs text-gray-600" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* ===== CONTENT AREA ===== */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              {/* ===== OVERVIEW SECTION ===== */}
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600 mt-1">Welcome back, Admin! Here's what's happening.</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                      icon={FaUsers}
                      title="Total Hosts"
                      value={stats.totalHosts}
                      trend={12}
                    />
                    <StatCard
                      icon={FaHome}
                      title="Total Guests"
                      value={`${stats.totalGuests}+`}
                      trend={8}
                    />
                    <StatCard
                      icon={FaCheckCircle}
                      title="Active Listings"
                      value={stats.activeListings}
                      trend={5}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                      icon={FaMoneyBillWave}
                      title="Total Revenue"
                      value={`₱${(stats.totalRevenue / 1000).toFixed(0)}K`}
                      trend={15}
                    />
                    <StatCard
                      icon={FaBook}
                      title="Total Bookings"
                      value={stats.totalBookings}
                      trend={22}
                    />
                    <StatCard
                      icon={FaExclamationTriangle}
                      title="Pending Reports"
                      value={stats.pendingReports}
                      trend={-3}
                    />
                  </div>

                  {/* Analytics Section */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <SectionHeader
                      icon={FaChartLine}
                      title="Platform Analytics"
                      description="Monthly performance metrics and trends"
                    />
                    <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      <p>Chart integration (Recharts) goes here</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== SERVICE FEES SECTION ===== */}
              {activeSection === 'service-fees' && (
                <motion.div
                  key="service-fees"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Service Fees Management</h1>
                    <p className="text-gray-600 mt-1">Configure platform fees and revenue settings.</p>
                  </div>

                  {/* Current Fee Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <SectionHeader icon={FaDollarSign} title="Current Service Fee" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Platform Fee Percentage</p>
                        <div className="flex items-end gap-2">
                          <input
                            type="number"
                            value={serviceFee}
                            onChange={(e) => setServiceFee(Number(e.target.value))}
                            disabled={!editingFee}
                            className={`flex-1 text-4xl font-bold outline-none ${
                              editingFee
                                ? 'bg-emerald-50 border-2 border-emerald-600 px-3 py-2 rounded-lg'
                                : 'bg-transparent'
                            }`}
                          />
                          <span className="text-3xl font-bold text-gray-600">%</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-end gap-3">
                        {!editingFee ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setEditingFee(true)}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                          >
                            Edit Fee
                          </motion.button>
                        ) : (
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setEditingFee(false)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleUpdateServiceFee}
                              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                            >
                              Save Changes
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fee Structure Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex gap-4">
                      <FaInfoCircle className="text-blue-600 text-lg flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">How Service Fees Work</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Service fee is applied to every booking transaction</li>
                          <li>• Fee is deducted from the host's earnings</li>
                          <li>• Changes take effect immediately for new bookings</li>
                          <li>• Current pending transactions use the previous fee rate</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== POLICIES SECTION ===== */}
              {activeSection === 'policies' && (
                <motion.div
                  key="policies"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Policies & Compliance</h1>
                    <p className="text-gray-600 mt-1">Manage platform policies and terms.</p>
                  </div>

                  {/* Policy Cards */}
                  {[
                    { key: 'cancellation', title: 'Cancellation Policy', icon: FaTimesCircle },
                    { key: 'platformRules', title: 'Platform Rules', icon: FaGavel },
                    { key: 'termsOfService', title: 'Terms of Service', icon: FaFileContract }
                  ].map((policy) => (
                    <div key={policy.key} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <SectionHeader icon={policy.icon} title={policy.title} />
                      <div className="space-y-4">
                        <textarea
                          value={policies[policy.key]}
                          onChange={(e) =>
                            setPolicies({ ...policies, [policy.key]: e.target.value })
                          }
                          disabled={editingPolicy !== policy.key}
                          className={`w-full p-4 border rounded-lg outline-none transition-all ${
                            editingPolicy === policy.key
                              ? 'border-emerald-600 focus:ring-2 focus:ring-emerald-200'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                          rows={6}
                        />
                        <div className="flex gap-3">
                          {editingPolicy !== policy.key ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setEditingPolicy(policy.key)}
                              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                            >
                              Edit Policy
                            </motion.button>
                          ) : (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setEditingPolicy(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                              >
                                Cancel
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleUpdatePolicy(policy.title)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                              >
                                Save Changes
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ===== REPORTS SECTION ===== */}
              {activeSection === 'reports' && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
                    <p className="text-gray-600 mt-1">Review and manage user reports and complaints.</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                      <SectionHeader
                        icon={FaExclamationTriangle}
                        title="Pending Reports"
                        description={`${stats.pendingReports} reports awaiting review`}
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Reporter</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">Inappropriate Content</td>
                              <td className="px-6 py-4 text-sm text-gray-600">user_{i + 1}@example.com</td>
                              <td className="px-6 py-4 text-sm text-gray-600">2024-01-{15 + i}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                  Pending
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                                >
                                  Review
                                </motion.button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== PAYMENTS SECTION ===== */}
              {activeSection === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-gray-600 mt-1">Monitor transactions and manage payouts.</p>
                  </div>

                  {/* Payment Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      icon={FaMoneyBillWave}
                      title="Total Revenue"
                      value={`₱${(stats.totalRevenue / 1000).toFixed(0)}K`}
                    />
                    <StatCard
                      icon={FaWallet}
                      title="Pending Payouts"
                      value="₱125,000"
                    />
                    <StatCard
                      icon={FaCheckCircle}
                      title="Completed Payouts"
                      value="₱325,000"
                    />
                  </div>

                  {/* Payment Table */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                      <SectionHeader icon={FaWallet} title="Recent Transactions" />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
                      >
                        <FaDownload />
                        Export
                      </motion.button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Host</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-600">2024-01-{20 - i}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">Host {i + 1}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                                ₱{(15000 + i * 5000).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    i < 2
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {i < 2 ? 'Completed' : 'Processing'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ==================== MODALS & NOTIFICATIONS ==================== */}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        onClose={() => setShowLogoutConfirm(false)}
        primaryAction={handleLogout}
        primaryLabel="Logout"
      >
        <p className="text-gray-600 mb-4">Are you sure you want to logout from the admin dashboard?</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
          <FaInfoCircle className="text-blue-600 text-lg flex-shrink-0" />
          <p className="text-sm text-blue-800">You will need to log in again with admin credentials.</p>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};

export default AdminDashboard;