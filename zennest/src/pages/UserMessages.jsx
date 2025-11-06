// src/pages/UserMessages.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToUserConversations, deleteConversation } from '../services/firestoreService';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import {
  FaEnvelope,
  FaTrash,
  FaMapMarkerAlt,
  FaArrowRight,
  FaSpinner,
  FaSearch,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaCircle,
  FaUser
} from 'react-icons/fa';

const UserMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserConversations(user.uid, 'guest', (result) => {
      if (result.success) {
        setConversations(result.data || []);
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      (conv.listingTitle && conv.listingTitle.toLowerCase().includes(query)) ||
      (conv.lastMessage && conv.lastMessage.toLowerCase().includes(query)) ||
      (conv.listingId && conv.listingId.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const handleDeleteConversation = async (conversationId) => {
    setDeletingId(conversationId);
    try {
      const result = await deleteConversation(conversationId);
      if (result.success) {
        // Conversation will be removed via real-time listener
        setDeleteConfirmId(null);
      } else {
        alert('Failed to delete conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
    const now = new Date();
    const diff = now - dateObj;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return dateObj.toLocaleDateString();
  };

  // Generate consistent color based on listingId
  const getAvatarColor = (id) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-orange-500', 'bg-cyan-500'];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get initials from title
  const getInitials = (title) => {
    if (!title) return '🏠';
    return title
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const truncateMessage = (message, maxLength = 60) => {
    if (!message) return 'No messages yet';
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  if (!user) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-16 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaEnvelope className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Please Sign In
              </h2>
              <p className="text-gray-600 mb-8 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Sign in to view and manage your conversations
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-lg transition-all"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Sign In to Messages
              </motion.button>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Messages
            </h1>
            <p className="text-gray-600 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {conversations.length > 0
                ? `You have ${conversations.length} conversation${conversations.length === 1 ? '' : 's'}`
                : 'Start messaging with hosts about their listings'}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mb-6"></div>
              <p className="text-gray-600 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Loading your conversations...
              </p>
            </div>
          ) : conversations.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-16 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaEnvelope className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                No conversations yet
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Start by messaging a host about a listing you're interested in. Your conversations will appear here.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/homestays')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-lg transition-all"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Browse Listings
              </motion.button>
            </motion.div>
          ) : (
            <>
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by listing title, location, or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-gray-700"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Results Info */}
              {searchQuery && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Found {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                </motion.p>
              )}

              {/* Conversations List */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation, index) => {
                      const isUnread = conversation.unreadCount?.[user.uid] > 0;
                      const unreadMessages = conversation.unreadCount?.[user.uid] || 0;

                      return (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onHoverStart={() => setHoveredId(conversation.id)}
                          onHoverEnd={() => setHoveredId(null)}
                          onClick={() => navigate(`/messages/${conversation.id}`)}
                          className={`
                            relative group cursor-pointer transition-all duration-300
                            ${isUnread
                              ? 'bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-l-4 border-emerald-600 shadow-md'
                              : 'bg-white border-l-4 border-transparent hover:shadow-lg'
                            }
                            rounded-2xl border-r border-t border-b border-gray-200 p-4 sm:p-5
                            hover:bg-white hover:shadow-xl
                          `}
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className={`
                              flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center
                              text-white font-semibold text-lg relative
                              ${getAvatarColor(conversation.listingId || conversation.id)}
                              shadow-md
                            `}>
                              {getInitials(conversation.listingTitle)}
                              {isUnread && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"
                                />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className={`
                                      font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors
                                      ${isUnread ? 'text-lg' : 'text-base'}
                                    `} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                      {conversation.listingTitle || 'Listing Conversation'}
                                    </h3>
                                    {isUnread && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex-shrink-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-full px-2.5 py-0.5 shadow-md"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                      >
                                        {unreadMessages} new
                                      </motion.span>
                                    )}
                                  </div>
                                </div>
                                <span className={`
                                  flex-shrink-0 text-sm font-medium whitespace-nowrap
                                  ${isUnread ? 'text-emerald-600' : 'text-gray-500'}
                                `} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {formatTime(conversation.lastMessageAt || conversation.createdAt)}
                                </span>
                              </div>

                              {/* Location */}
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2.5">
                                <FaMapMarkerAlt className="text-emerald-600 flex-shrink-0 w-3.5 h-3.5" />
                                <span className="truncate text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  ID: {conversation.listingId?.slice(0, 12)}...
                                </span>
                              </div>

                              {/* Last Message Preview */}
                              <div className={`
                                p-3 rounded-lg bg-gray-50 border border-gray-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all
                                ${isUnread ? 'border-emerald-300 bg-emerald-50' : ''}
                              `}>
                                <p className={`
                                  text-sm truncate leading-relaxed
                                  ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'}
                                `} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {truncateMessage(conversation.lastMessage, 70)}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              {/* Arrow Icon */}
                              <motion.div
                                animate={{ x: hoveredId === conversation.id ? 5 : 0 }}
                                className="text-gray-400 group-hover:text-emerald-600 transition-colors"
                              >
                                <FaArrowRight className="w-5 h-5" />
                              </motion.div>

                              {/* Delete Button */}
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                  opacity: hoveredId === conversation.id ? 1 : 0,
                                  scale: hoveredId === conversation.id ? 1 : 0.8
                                }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(conversation.id);
                                }}
                                disabled={deletingId === conversation.id}
                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                aria-label="Delete conversation"
                              >
                                {deletingId === conversation.id ? (
                                  <FaSpinner className="w-5 h-5 animate-spin" />
                                ) : (
                                  <FaTrash className="w-5 h-5" />
                                )}
                              </motion.button>
                            </div>
                          </div>

                          {/* Delete Confirmation */}
                          <AnimatePresence>
                            {deleteConfirmId === conversation.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-3"
                              >
                                <p className="text-sm text-red-700 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  Delete this conversation?
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmId(null);
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteConversation(conversation.id);
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No conversations match "{searchQuery}"
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Clear search
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserMessages;
