// src/pages/UserMessages.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  subscribeToUserConversations, 
  deleteConversation,
  subscribeToMessages, 
  sendConversationMessage, 
  markConversationAsRead,
  getHostProfile,
  getGuestProfile,
  setTypingStatus,
  subscribeToTypingStatus
} from '../services/firestoreService';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import {
  FaEnvelope,
  FaTrash,
  FaMapMarkerAlt,
  FaArrowRight,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaCircle,
  FaUser,
  FaPaperPlane,
  FaArrowLeft,
  FaEllipsisV
} from 'react-icons/fa';

const UserMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Conversation panel states
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  // Get conversation ID from URL params
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [searchParams]);

  // Fetch current user profile
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (user?.uid) {
        try {
          const result = await getGuestProfile(user.uid);
          if (result.success && result.data) {
            setCurrentUserProfile(result.data);
          }
        } catch (error) {
          console.error('Error fetching current user profile:', error);
        }
      }
    };
    
    fetchCurrentUserProfile();
  }, [user]);

  // Subscribe to conversations
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

  // Load selected conversation details
  useEffect(() => {
    if (!selectedConversationId || !user?.uid) {
      setSelectedConversation(null);
      setMessages([]);
      setOtherUser(null);
      return;
    }

    const loadConversation = async () => {
      try {
        setMessagesLoading(true);
        const conversationRef = doc(db, 'conversations', selectedConversationId);
        const conversationSnap = await getDoc(conversationRef);
        
        if (conversationSnap.exists()) {
          const data = conversationSnap.data();
          setSelectedConversation({ id: conversationSnap.id, ...data });
          
          // Fetch other user's profile
          const otherUserId = user.uid === data.guestId ? data.hostId : data.guestId;
          const otherUserType = user.uid === data.guestId ? 'host' : 'guest';
          
          if (otherUserType === 'host') {
            const hostResult = await getHostProfile(otherUserId);
            if (hostResult.success && hostResult.data) {
              setOtherUser({
                ...hostResult.data,
                id: otherUserId,
                type: 'host'
              });
            }
          } else {
            const guestResult = await getGuestProfile(otherUserId);
            if (guestResult.success && guestResult.data) {
              setOtherUser({
                ...guestResult.data,
                id: otherUserId,
                type: 'guest'
              });
            }
          }
          
          // Mark as read
          await markConversationAsRead(selectedConversationId, user.uid);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadConversation();
  }, [selectedConversationId, user]);

  // Subscribe to messages
  useEffect(() => {
    if (!selectedConversationId) return;

    const unsubscribe = subscribeToMessages(selectedConversationId, (result) => {
      if (result.success) {
        setMessages(result.data || []);
        scrollToBottom();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedConversationId]);

  // Subscribe to typing status
  useEffect(() => {
    if (!selectedConversationId || !otherUser?.id) {
      setIsOtherUserTyping(false);
      return;
    }

    // Reset typing status when conversation changes
    setIsOtherUserTyping(false);

    const unsubscribe = subscribeToTypingStatus(
      selectedConversationId,
      user.uid, // Pass current user ID, not other user ID
      (result) => {
        // The callback returns an object with { success, isTyping, typingUsers }
        if (result && result.success) {
          setIsOtherUserTyping(result.isTyping === true);
        } else {
          setIsOtherUserTyping(false);
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
      setIsOtherUserTyping(false);
    };
  }, [selectedConversationId, otherUser, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!selectedConversationId || !user?.uid) return;

    // Only set typing to true, let the timeout handle setting it to false
    setTypingStatus(selectedConversationId, user.uid, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing to false after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedConversationId && user?.uid) {
        setTypingStatus(selectedConversationId, user.uid, false);
      }
    }, 2000);
  };

  // Cleanup typing status on unmount or conversation change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedConversationId && user?.uid) {
        setTypingStatus(selectedConversationId, user.uid, false);
      }
    };
  }, [selectedConversationId, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversationId || sending) return;

    setSending(true);
    
    // Clear typing timeout and status immediately when sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTypingStatus(selectedConversationId, user.uid, false);

    try {
      const result = await sendConversationMessage(
        selectedConversationId,
        user.uid,
        user.displayName || user.email || 'User',
        'guest',
        newMessage.trim(),
        selectedConversation?.listingId,
        selectedConversation?.listingTitle
      );

      if (result.success) {
        setNewMessage('');
        scrollToBottom();
        // Keep input focused after sending - use requestAnimationFrame for better reliability
        requestAnimationFrame(() => {
          setTimeout(() => {
            messageInputRef.current?.focus();
          }, 10);
        });
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
      // Keep input focused even on error
      requestAnimationFrame(() => {
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 10);
      });
    }
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setSearchParams({ conversation: conversationId });
    // Focus input when conversation is selected (especially on mobile)
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 300);
  };

  const handleBackToInbox = () => {
    setSelectedConversationId(null);
    setSearchParams({});
  };

  const handleDeleteConversation = async (conversationId) => {
    setDeletingId(conversationId);
    try {
      const result = await deleteConversation(conversationId);
      if (result.success) {
        setDeleteConfirmId(null);
        if (selectedConversationId === conversationId) {
          handleBackToInbox();
        }
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

  const formatMessageTime = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
    return dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getAvatarColor = (id) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-orange-500', 'bg-cyan-500'];
    const index = id?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header - Hidden on mobile when conversation is selected */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 ${selectedConversationId ? 'hidden md:block' : ''}`}
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
            /* Split View Layout */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] md:h-[calc(100vh-16rem)]">
              {/* Left Side - Inbox (Hidden on mobile when conversation selected) */}
              <div className={`
                md:col-span-4 lg:col-span-3 
                ${selectedConversationId ? 'hidden md:block' : 'block'}
                bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col
                h-full max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-14rem)] md:max-h-[calc(100vh-16rem)]
              `}>
                {/* Search Bar */}
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-7 sm:pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {filteredConversations.length > 0 ? (
                      filteredConversations.map((conversation, index) => {
                        const isUnread = conversation.unreadCount?.[user.uid] > 0;
                        const unreadMessages = conversation.unreadCount?.[user.uid] || 0;
                        const isSelected = selectedConversationId === conversation.id;

                        return (
                          <motion.div
                            key={conversation.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            onClick={() => handleSelectConversation(conversation.id)}
                            onMouseEnter={() => setHoveredId(conversation.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`
                              relative cursor-pointer transition-all duration-200
                              border-b border-gray-100 p-4 hover:bg-emerald-50
                              ${isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : 'border-l-4 border-l-transparent'}
                              ${isUnread ? 'bg-blue-50/50' : 'bg-white'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className={`
                                relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                                text-white font-semibold text-sm
                                ${getAvatarColor(conversation.listingId || conversation.id)}
                              `}>
                                {getInitials(conversation.listingTitle)}
                                {isUnread && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{unreadMessages}</span>
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className={`
                                    font-semibold truncate text-sm
                                    ${isUnread ? 'text-gray-900' : 'text-gray-700'}
                                  `} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {conversation.listingTitle || 'Conversation'}
                                  </h3>
                                  <span className="text-xs text-gray-500 flex-shrink-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {formatTime(conversation.lastMessageAt || conversation.createdAt)}
                                  </span>
                                </div>
                                <p className={`
                                  text-xs truncate
                                  ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}
                                `} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {truncateMessage(conversation.lastMessage, 35)}
                                </p>
                              </div>
                            </div>

                            {/* Delete Button on Hover */}
                            {hoveredId === conversation.id && !deleteConfirmId && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(conversation.id);
                                }}
                                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FaTrash className="w-3 h-3" />
                              </motion.button>
                            )}

                            {/* Delete Confirmation */}
                            {deleteConfirmId === conversation.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute inset-0 bg-red-50 border-l-4 border-red-500 p-3 flex items-center justify-between z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="text-xs text-red-700 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  Delete?
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmId(null);
                                    }}
                                    className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteConversation(conversation.id);
                                    }}
                                    disabled={deletingId === conversation.id}
                                    className="px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                                  >
                                    {deletingId === conversation.id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 px-4">
                        <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          No conversations found
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Side - Conversation Panel */}
              <div className={`
                md:col-span-8 lg:col-span-9
                ${selectedConversationId ? 'block' : 'hidden md:flex'}
                bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col
                h-full max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-14rem)] md:max-h-[calc(100vh-16rem)]
              `}>
                {selectedConversationId && selectedConversation ? (
                  <>
                    {/* Conversation Header - Sticky on mobile */}
                    <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-3 sm:p-4 flex items-center justify-between border-b border-emerald-800 z-20 shadow-md">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Back Button (Mobile Only) */}
                        <motion.button
                          onClick={handleBackToInbox}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="md:hidden p-1.5 sm:p-2 hover:bg-emerald-700 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Back to inbox"
                        >
                          <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>

                        {/* User Info */}
                        <div className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0
                          ${otherUser?.profilePicture ? '' : 'bg-emerald-800'}
                        `}>
                          {otherUser?.profilePicture ? (
                            <img 
                              src={otherUser.profilePicture} 
                              alt={otherUser.displayName || 'User'}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <FaUser className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-semibold text-sm sm:text-lg truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {selectedConversation.listingTitle || 'Conversation'}
                          </h2>
                          <p className="text-xs text-emerald-100 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {otherUser?.displayName || 'Host'}
                          </p>
                        </div>
                      </div>

                      {/* Menu Button */}
                      <button
                        onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                        className="p-2 hover:bg-emerald-700 rounded-lg transition-colors relative"
                      >
                        <FaEllipsisV className="w-4 h-4" />
                        {showDeleteMenu && (
                          <div className="absolute right-0 top-12 bg-white text-gray-700 rounded-lg shadow-xl border border-gray-200 py-1 w-48 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteMenu(false);
                                handleDeleteConversation(selectedConversationId);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                            >
                              <FaTrash className="w-3 h-3" />
                              Delete Conversation
                            </button>
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Messages Area - Enhanced mobile experience */}
                    <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 pb-2 sm:pb-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-slate-50 via-white to-white" style={{ scrollBehavior: 'smooth' }}>
                      {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <FaSpinner className="w-8 h-8 text-emerald-600 animate-spin" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <FaEnvelope className="w-16 h-16 text-gray-300 mb-4" />
                          <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            No messages yet. Start the conversation!
                          </p>
                        </div>
                      ) : (
                        <>
                          {messages.map((message, index) => {
                            const isOwnMessage = message.senderId === user.uid;
                            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                              >
                                {/* Avatar */}
                                <div className="w-8 h-8 flex-shrink-0">
                                  {showAvatar && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                                      {isOwnMessage ? (
                                        currentUserProfile?.profilePicture || user.photoURL ? (
                                          <img 
                                            src={currentUserProfile?.profilePicture || user.photoURL} 
                                            alt="Your profile"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-white">
                                              {user.displayName?.[0] || user.email?.[0] || 'Y'}
                                            </span>
                                          </div>
                                        )
                                      ) : (
                                        otherUser?.profilePicture ? (
                                          <img 
                                            src={otherUser.profilePicture} 
                                            alt="Host profile"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                            <FaUser className="w-4 h-4 text-white" />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]">
                                  {/* Message Bubble - Enhanced mobile design */}
                                  <div className={`
                                    px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-sm
                                    ${isOwnMessage 
                                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-br-sm' 
                                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                                    }
                                  `}>
                                    <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                      {message.text || message.content}
                                    </p>
                                  </div>
                                  
                                  {/* Timestamp below message */}
                                  {showAvatar && (
                                    <p className={`
                                      text-[10px] sm:text-xs text-gray-400 px-2
                                      ${isOwnMessage ? 'text-right' : 'text-left'}
                                    `} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                      {formatMessageTime(message.createdAt)}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                          <div ref={messagesEndRef} />

                          {/* Typing Indicator */}
                          {isOtherUserTyping && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2"
                            >
                              <div className="w-8 h-8" />
                              <div className="bg-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                                <div className="flex gap-1">
                                  <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity }}
                                    className="w-2 h-2 bg-gray-500 rounded-full"
                                  />
                                  <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 bg-gray-500 rounded-full"
                                  />
                                  <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                    className="w-2 h-2 bg-gray-500 rounded-full"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Message Input - Enhanced mobile experience */}
                    <form 
                      onSubmit={handleSendMessage} 
                      className="sticky bottom-0 p-2.5 sm:p-3 md:p-4 bg-white border-t border-gray-200 shadow-lg sm:shadow-md z-10"
                      onClick={() => {
                        // Focus input when form is clicked (especially on mobile)
                        requestAnimationFrame(() => {
                          messageInputRef.current?.focus();
                        });
                      }}
                    >
                      <div className="flex items-end gap-2 sm:gap-3">
                        <div className="flex-1 relative">
                          <input
                            ref={messageInputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              handleTyping();
                            }}
                            onBlur={(e) => {
                              // Prevent blur on mobile when keyboard might close
                              // Only allow blur if clicking outside the form
                              const relatedTarget = e.relatedTarget;
                              if (!relatedTarget || !e.currentTarget.form?.contains(relatedTarget)) {
                                // Small delay to allow focus to return if needed
                                setTimeout(() => {
                                  if (selectedConversationId && document.activeElement !== messageInputRef.current) {
                                    messageInputRef.current?.focus();
                                  }
                                }, 100);
                              }
                            }}
                            placeholder="Type your message..."
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none resize-none"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                            disabled={sending}
                            autoFocus={selectedConversationId ? true : false}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="sentences"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="p-2.5 sm:p-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl sm:rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg active:scale-95"
                          aria-label="Send message"
                          onClick={(e) => {
                            // Prevent form click from interfering
                            e.stopPropagation();
                          }}
                        >
                          {sending ? (
                            <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            <FaPaperPlane className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* No Conversation Selected */
                  <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                      <FaEnvelope className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Select a Conversation
                    </h2>
                    <p className="text-gray-600 max-w-md" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Choose a conversation from the list to start messaging with hosts
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserMessages;
