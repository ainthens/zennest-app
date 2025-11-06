import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getConversationMessages, sendMessage, markMessagesAsRead, deleteConversation, reportConversation, blockUser } from '../services/firestoreService';
import useAuth from '../hooks/useAuth';
import {
  FaArrowLeft,
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaEllipsisV,
  FaTrash,
  FaFlag,
  FaBan,
  FaCheck,
  FaCheckDouble,
  FaSpinner,
  FaImage,
  FaTimes,
  FaClock,
  FaExclamationCircle,
  FaPhone,
  FaVideo,
  FaInfo,
  FaCircle
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const OpenConversation = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const menuRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and messages
  useEffect(() => {
    if (!user?.uid || !conversationId) {
      setLoading(false);
      return;
    }

    const unsubscribe = getConversationMessages(conversationId, (result) => {
      if (result.success) {
        setConversation(result.conversation);
        setMessages(result.messages || []);
        
        // Mark messages as read
        const unreadMessages = result.messages?.filter(
          msg => msg.senderId !== user.uid && !msg.read
        ) || [];
        
        if (unreadMessages.length > 0) {
          markMessagesAsRead(conversationId, user.uid);
        }
      } else {
        setError(result.error || 'Failed to load conversation');
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, conversationId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() && attachedFiles.length === 0) return;

    setSending(true);
    try {
      const result = await sendMessage(conversationId, {
        text: messageText.trim(),
        senderId: user.uid,
        attachments: attachedFiles,
        timestamp: new Date()
      });

      if (result.success) {
        setMessageText('');
        setAttachedFiles([]);
        setShowEmojiPicker(false);
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessageText(prev => prev + emojiObject.emoji);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024); // 5MB limit
    
    if (validFiles.length < files.length) {
      setError('Some files exceed 5MB limit');
    }
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeAttachedFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteConversation = async () => {
    try {
      const result = await deleteConversation(conversationId);
      if (result.success) {
        navigate('/messages', { replace: true });
      } else {
        setError(result.error || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
    }
  };

  const handleReportConversation = async () => {
    try {
      const result = await reportConversation(conversationId, user.uid);
      if (result.success) {
        setError('');
        navigate('/messages', { replace: true });
      } else {
        setError(result.error || 'Failed to report conversation');
      }
    } catch (err) {
      console.error('Error reporting conversation:', err);
      setError('Failed to report conversation');
    }
  };

  const handleBlockUser = async () => {
    try {
      const otherUserId = conversation.participants.find(id => id !== user.uid);
      const result = await blockUser(user.uid, otherUserId);
      if (result.success) {
        navigate('/messages', { replace: true });
      } else {
        setError(result.error || 'Failed to block user');
      }
    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Failed to block user');
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp?.toDate?.() || msg.timestamp);
      const dateKey = date.toLocaleDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  }, [messages]);

  const formatTime = (date) => {
    const dateObj = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return dateString;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Please sign in to view messages
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
              <div className="w-64 h-12 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Input Skeleton */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto h-12 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaExclamationCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Conversation not found
          </p>
          <button
            onClick={() => navigate('/messages')}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Back to Messages
          </button>
        </motion.div>
      </div>
    );
  }

  const otherParticipant = conversation.participants?.find(id => id !== user.uid);
  const isOnline = conversation.onlineStatus?.[otherParticipant] || false;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/messages')}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to messages"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>

            {/* Participant Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {conversation.listingTitle?.charAt(0).toUpperCase() || '🏠'}
                </div>
                {isOnline && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-md"
                  />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {conversation.listingTitle || 'Conversation'}
                </h2>
                <p className={`
                  text-xs sm:text-sm
                  ${isOnline ? 'text-emerald-600' : 'text-gray-500'}
                `} style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isOnline ? '● Online now' : 'Away'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Call Button (placeholder) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              aria-label="Voice call"
            >
              <FaPhone className="w-5 h-5" />
            </motion.button>

            {/* Video Button (placeholder) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              aria-label="Video call"
            >
              <FaVideo className="w-5 h-5" />
            </motion.button>

            {/* Info Button (placeholder) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              aria-label="Conversation info"
            >
              <FaInfo className="w-5 h-5" />
            </motion.button>

            {/* Menu Button */}
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                aria-label="More options"
              >
                <FaEllipsisV className="w-5 h-5" />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-sm font-medium"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <FaTrash className="w-4 h-4" />
                      Delete Conversation
                    </button>
                    <div className="border-t border-gray-200" />
                    <button
                      onClick={handleReportConversation}
                      className="w-full px-4 py-3 text-left text-orange-600 hover:bg-orange-50 flex items-center gap-3 transition-colors text-sm font-medium"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <FaFlag className="w-4 h-4" />
                      Report Conversation
                    </button>
                    <div className="border-t border-gray-200" />
                    <button
                      onClick={handleBlockUser}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-sm font-medium"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <FaBan className="w-4 h-4" />
                      Block User
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center gap-2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <FaExclamationCircle className="w-4 h-4" />
            {error}
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-xs text-gray-600 font-medium px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {formatDateHeader(dateKey)}
                </span>
                <div className="flex-1 h-px bg-gray-300" />
              </motion.div>

              {/* Messages */}
              {dayMessages.map((msg, index) => {
                const isOwn = msg.senderId === user.uid;
                const showTimestamp = index === 0 || dayMessages[index - 1].senderId !== msg.senderId;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-3`}
                  >
                    {!isOwn && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {conversation.otherParticipantName?.charAt(0).toUpperCase() || '👤'}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-xs sm:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
                      {/* Message Bubble */}
                      <motion.div
                        layout
                        className={`
                          px-4 py-2.5 rounded-2xl shadow-sm group
                          ${isOwn
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                          }
                        `}
                      >
                        {msg.text && (
                          <p className="text-sm leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {msg.text}
                          </p>
                        )}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {msg.attachments.map((att, idx) => (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center w-20 h-20 rounded-lg ${
                                  isOwn ? 'bg-emerald-500' : 'bg-gray-300'
                                } hover:opacity-80 transition-opacity`}
                              >
                                {att.type.startsWith('image') ? (
                                  <FaImage className="w-6 h-6" />
                                ) : (
                                  <FaPaperclip className="w-6 h-6" />
                                )}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className={`text-xs mt-1 ${isOwn ? 'text-emerald-100' : 'text-gray-600'}`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </motion.div>

                      {/* Read Receipt */}
                      {isOwn && (
                        <div className="flex items-center gap-1 mt-1 px-2">
                          {msg.read ? (
                            <FaCheckDouble className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <FaCheck className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {msg.read ? 'Seen' : 'Sent'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator (placeholder) */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <FaEnvelope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No messages yet. Start the conversation!
            </p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Delete Conversation?
              </h3>
              <p className="text-gray-600 mb-6 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                This action cannot be undone. All messages will be permanently deleted.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    handleDeleteConversation();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          {/* Attached Files Preview */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 flex flex-wrap gap-2"
              >
                {attachedFiles.map((file, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                  >
                    <FaPaperclip className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-900 truncate max-w-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeAttachedFile(idx)}
                      className="text-emerald-600 hover:text-emerald-700 ml-auto"
                    >
                      <FaTimes className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji Picker */}
          <div className="relative mb-3" ref={emojiPickerRef}>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-2 z-50 max-h-96 overflow-y-auto"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  emojiStyle="native"
                  width={300}
                  height={400}
                />
              </motion.div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />

            {/* Attachment Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              aria-label="Attach files"
            >
              <FaPaperclip className="w-5 h-5" />
            </motion.button>

            {/* Emoji Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`
                flex-shrink-0 p-2.5 rounded-lg transition-colors
                ${showEmojiPicker ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100 text-gray-600'}
              `}
              aria-label="Add emoji"
            >
              <FaSmile className="w-5 h-5" />
            </motion.button>

            {/* Text Input */}
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none resize-none max-h-32"
              rows="1"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={(!messageText.trim() && attachedFiles.length === 0) || sending}
              className={`
                flex-shrink-0 p-2.5 rounded-lg transition-colors font-bold
                ${sending || (!messageText.trim() && attachedFiles.length === 0)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg'
                }
              `}
              aria-label="Send message"
            >
              {sending ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : (
                <FaPaperPlane className="w-5 h-5" />
              )}
            </motion.button>
          </form>

          <p className="text-xs text-gray-500 mt-2 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpenConversation;