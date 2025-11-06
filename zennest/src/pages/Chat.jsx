// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getHostProfile, getGuestProfile, subscribeToMessages, sendConversationMessage, deleteMessage, markConversationAsRead, deleteConversation, subscribeToTypingStatus, setTypingStatus } from '../services/firestoreService';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import Loading from '../components/Loading';
import { FaPaperPlane, FaTrash, FaSpinner, FaArrowLeft, FaUser, FaEllipsisV, FaEnvelope } from 'react-icons/fa';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!user?.uid || !conversationId) {
      setLoading(false);
      return;
    }

    // Fetch conversation details
    const fetchConversation = async () => {
      try {
        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationSnap = await getDoc(conversationRef);
        
        if (conversationSnap.exists()) {
          const data = conversationSnap.data();
          setConversation({ id: conversationSnap.id, ...data });
          
          // Fetch other user's profile
          const otherUserId = user.uid === data.guestId ? data.hostId : data.guestId;
          const otherUserType = user.uid === data.guestId ? 'host' : 'guest';
          
          if (otherUserType === 'host') {
            // Try host profile first, fallback to guest profile if not found
            const hostResult = await getHostProfile(otherUserId);
            if (hostResult.success && hostResult.data) {
              setOtherUser({
                ...hostResult.data,
                id: otherUserId,
                type: 'host'
              });
            } else {
              // Fallback to guest profile if host profile doesn't exist
              const guestResult = await getGuestProfile(otherUserId);
              if (guestResult.success && guestResult.data) {
                setOtherUser({
                  ...guestResult.data,
                  id: otherUserId,
                  type: 'guest'
                });
              }
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
          
          // Mark conversation as read
          await markConversationAsRead(conversationId, user.uid);
        } else {
          navigate('/messages');
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        navigate('/messages');
      }
    };

    fetchConversation();

    // Fetch current user profile for avatar
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const result = await getGuestProfile(user.uid);
          if (result.success && result.data) {
            setUserProfile(result.data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    fetchUserProfile();

    // Set up real-time listener for messages
    const unsubscribeMessages = subscribeToMessages(conversationId, (result) => {
      if (result.success) {
        setMessages(result.data || []);
        setLoading(false);
      }
    });

    // Set up real-time listener for typing status
    const unsubscribeTyping = subscribeToTypingStatus(conversationId, user.uid, (result) => {
      if (result.success) {
        setIsOtherUserTyping(result.isTyping);
      }
    });

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeTyping) unsubscribeTyping();
      // Clear typing status on unmount
      setTypingStatus(conversationId, user.uid, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, conversationId, navigate]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversation || !user) return;

    // Clear typing status when sending
    await setTypingStatus(conversationId, user.uid, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setSending(true);
    try {
      const senderName = user.displayName || user.email?.split('@')[0] || 'User';
      const senderType = user.uid === conversation.guestId ? 'guest' : 'host';
      
      const result = await sendConversationMessage(
        conversationId,
        user.uid,
        senderName,
        senderType,
        newMessage.trim(),
        conversation.listingId,
        conversation.listingTitle
      );

      if (result.success) {
        setNewMessage('');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!conversation || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status if user is typing
    if (value.trim().length > 0) {
      await setTypingStatus(conversationId, user.uid, true);
      
      // Clear typing status after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(async () => {
        await setTypingStatus(conversationId, user.uid, false);
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      // Clear typing status if input is empty
      await setTypingStatus(conversationId, user.uid, false);
    }
  };

  const handleDeleteMessage = async (messageId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setDeletingId(messageId);
    try {
      const result = await deleteMessage(conversationId, messageId);
      if (!result.success) {
        alert('Failed to delete message. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    } finally {
      setDeletingId(null);
      setShowDeleteMenu(null);
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteConversation(conversationId);
      if (result.success) {
        navigate('/messages');
      } else {
        alert('Failed to delete conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const formatMessageTime = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
             dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  };

  if (!user) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-slate-100 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <FaEnvelope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
              <p className="text-gray-600 mb-6">Sign in to view your messages</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading || !conversation) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-slate-100 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <Loading message="Loading conversation..." size="medium" fullScreen={false} />
            </div>
          </div>
        </div>
      </>
    );
  }

  const otherUserName = otherUser?.firstName && otherUser?.lastName
    ? `${otherUser.firstName} ${otherUser.lastName}`
    : otherUser?.email?.split('@')[0] || 'User';

  const otherUserAvatar = otherUser?.profilePicture || null;

  return (
    <>
      <SettingsHeader />
      <div className="min-h-screen bg-slate-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/messages')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Back to messages"
                >
                  <FaArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                
                {otherUserAvatar ? (
                  <img
                    src={otherUserAvatar}
                    alt={otherUserName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                    {otherUserName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div>
                  <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
                  <p className="text-sm text-gray-600">
                    {isOtherUserTyping ? (
                      <span className="text-emerald-600 italic flex items-center gap-1">
                        <span className="animate-pulse">typing</span>
                        <span className="inline-flex gap-1">
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                      </span>
                    ) : (
                      conversation.listingTitle
                    )}
                  </p>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowDeleteMenu(showDeleteMenu === 'conversation' ? null : 'conversation')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="More options"
                >
                  <FaEllipsisV className="w-5 h-5 text-gray-700" />
                </button>
                
                <AnimatePresence>
                  {showDeleteMenu === 'conversation' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                    >
                      <button
                        onClick={handleDeleteConversation}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        Delete Conversation
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white"
              style={{ scrollbarWidth: 'thin' }}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <FaEnvelope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user.uid;
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                  const showTime = index === messages.length - 1 || 
                    (messages[index + 1].senderId !== message.senderId) ||
                    ((messages[index + 1].createdAt?.getTime?.() || 0) - (message.createdAt?.getTime?.() || 0)) > 300000; // 5 minutes

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div className={`flex items-end gap-2 max-w-[70%] sm:max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar for received messages */}
                        {!isOwn && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              otherUserAvatar ? (
                                <img
                                  src={otherUserAvatar}
                                  alt={otherUserName}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200">
                                  {otherUserName.charAt(0).toUpperCase()}
                                </div>
                              )
                            ) : (
                              <div className="w-10" />
                            )}
                          </div>
                        )}

                        {/* Avatar for own messages (optional - shows your profile) */}
                        {isOwn && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              userProfile?.profilePicture || user.photoURL ? (
                                <img
                                  src={userProfile?.profilePicture || user.photoURL}
                                  alt="You"
                                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-semibold border-2 border-emerald-200">
                                  {(user.displayName || user.email?.charAt(0) || 'U').charAt(0).toUpperCase()}
                                </div>
                              )
                            ) : (
                              <div className="w-10" />
                            )}
                          </div>
                        )}

                        <div className={`relative group flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                              isOwn
                                ? 'bg-emerald-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                            
                            {/* Delete button (for own messages) */}
                            {isOwn && (
                              <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleDeleteMessage(message.id, e)}
                                  disabled={deletingId === message.id}
                                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-full shadow-sm"
                                  aria-label="Delete message"
                                >
                                  {deletingId === message.id ? (
                                    <FaSpinner className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <FaTrash className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {showTime && (
                            <span className={`text-xs text-gray-400 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {formatMessageTime(message.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

              {/* Typing Indicator */}
              {isOtherUserTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-start mb-2"
                >
                  <div className="flex items-end gap-2 max-w-[70%] sm:max-w-[75%]">
                    <div className="flex-shrink-0">
                      {otherUserAvatar ? (
                        <img
                          src={otherUserAvatar}
                          alt={otherUserName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200">
                          {otherUserName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  disabled={sending}
                />
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {sending ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                  ) : (
                    <FaPaperPlane className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
