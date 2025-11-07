// src/pages/BookingDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getHostProfile, getOrCreateConversation } from '../services/firestoreService';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import Loading from '../components/Loading';
import {
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaBed,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaExclamationTriangle,
  FaBan,
  FaChevronLeft,
  FaUser,
  FaCreditCard,
  FaInfoCircle,
  FaShieldAlt,
  FaPrint,
  FaDownload
} from 'react-icons/fa';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchBookingDetails();
    } else if (!user) {
      setLoading(false);
      setError('Please sign in to view booking details');
    }
  }, [id, user]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.uid) {
        setError('Please sign in to view booking details');
        setLoading(false);
        return;
      }

      // Fetch booking
      const bookingRef = doc(db, 'bookings', id);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        setError('Booking not found');
        setLoading(false);
        return;
      }

      const bookingData = bookingSnap.data();

      // Verify this booking belongs to the current user
      if (bookingData.guestId !== user.uid) {
        setError('You do not have permission to view this booking');
        setLoading(false);
        return;
      }

      // Convert dates
      const checkInDate = bookingData.checkIn?.toDate 
        ? bookingData.checkIn.toDate() 
        : bookingData.checkIn 
          ? new Date(bookingData.checkIn) 
          : null;
      
      const checkOutDate = bookingData.checkOut?.toDate 
        ? bookingData.checkOut.toDate() 
        : bookingData.checkOut 
          ? new Date(bookingData.checkOut) 
          : null;
      
      const createdAtDate = bookingData.createdAt?.toDate 
        ? bookingData.createdAt.toDate() 
        : bookingData.createdAt 
          ? new Date(bookingData.createdAt) 
          : new Date();

      const cancelledAtDate = bookingData.cancelledAt?.toDate 
        ? bookingData.cancelledAt.toDate() 
        : bookingData.cancelledAt 
          ? new Date(bookingData.cancelledAt) 
          : null;

      const bookingWithDates = {
        id: bookingSnap.id,
        ...bookingData,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        createdAt: createdAtDate,
        cancelledAt: cancelledAtDate
      };

      setBooking(bookingWithDates);

      // Fetch listing details
      if (bookingData.listingId) {
        try {
          const listingRef = doc(db, 'listings', bookingData.listingId);
          const listingSnap = await getDoc(listingRef);
          if (listingSnap.exists()) {
            setListing({ id: listingSnap.id, ...listingSnap.data() });
            
            // Fetch host profile
            if (listingSnap.data().hostId) {
              const hostResult = await getHostProfile(listingSnap.data().hostId);
              if (hostResult.success && hostResult.data) {
                setHost({ ...hostResult.data, uid: listingSnap.data().hostId });
              }
            }
          }
        } catch (error) {
          console.error('Error fetching listing:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatus = (booking) => {
    if (booking.status === 'cancelled') return 'cancelled';
    
    if (!booking.checkIn || !booking.checkOut) {
      if (booking.status === 'confirmed') return 'active';
      if (booking.status === 'pending' || booking.status === 'reserved') return 'upcoming';
      return 'past';
    }
    
    const now = new Date();
    const checkIn = booking.checkIn instanceof Date ? booking.checkIn : new Date(booking.checkIn);
    const checkOut = booking.checkOut instanceof Date ? booking.checkOut : new Date(booking.checkOut);

    if (now < checkIn) return 'upcoming';
    if (now >= checkIn && now <= checkOut) return 'active';
    return 'past';
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'upcoming':
        return { 
          label: 'Upcoming', 
          color: 'bg-blue-100 text-blue-700 border-blue-300',
          icon: FaClock 
        };
      case 'active':
        return { 
          label: 'Active', 
          color: 'bg-green-100 text-green-700 border-green-300',
          icon: FaCheckCircle 
        };
      case 'past':
        return { 
          label: 'Completed', 
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: FaCheckCircle 
        };
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          color: 'bg-red-100 text-red-700 border-red-300',
          icon: FaTimesCircle 
        };
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: FaInfoCircle 
        };
    }
  };

  const canCancelBooking = (booking) => {
    const status = getBookingStatus(booking);
    return status === 'upcoming' || status === 'active' || 
           booking.status === 'pending' || booking.status === 'reserved';
  };

  const handleCancelClick = () => {
    setCancelBookingId(booking.id);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancelBookingId) return;

    try {
      setCancelling(true);
      const bookingRef = doc(db, 'bookings', cancelBookingId);
      
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Booking cancelled successfully');
      
      // Refresh booking details
      await fetchBookingDetails();
      
      // Close modal and show success
      setShowCancelModal(false);
      setCancelBookingId(null);
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      alert(`Failed to cancel booking: ${error.message || 'Please try again.'}`);
    } finally {
      setCancelling(false);
    }
  };

  const handleContactHost = async () => {
    if (!user?.uid) {
      if (window.confirm('Please sign in to contact the host. Would you like to sign in?')) {
        navigate('/login');
      }
      return;
    }

    const hostId = host?.uid || listing?.hostId;
    
    if (!hostId || !listing?.id) {
      alert('Host information not available');
      return;
    }

    try {
      const result = await getOrCreateConversation(
        user.uid, 
        hostId, 
        listing.id, 
        listing.title || 'Listing'
      );
      if (result.success && result.data?.id) {
        navigate(`/messages/${result.data.id}`);
      } else {
        console.error('Failed to create conversation:', result.error);
        alert('Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error contacting host:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
    const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut);
    const diff = checkOutDate - checkInDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (!user) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-slate-100 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <FaCalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
              <p className="text-gray-600 mb-6">Sign in to view booking details</p>
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

  if (loading) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-slate-100 pt-20">
          <Loading message="Loading booking details..." size="large" fullScreen={false} className="pt-20" />
        </div>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-slate-100 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <FaTimesCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
              <button
                onClick={() => navigate('/bookings')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const status = getBookingStatus(booking);
  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;
  const nights = calculateNights(booking.checkIn, booking.checkOut);

  return (
    <>
      <SettingsHeader />
      <div className="min-h-screen bg-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/bookings')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <FaChevronLeft className="w-4 h-4" />
              <span className="font-medium">Back to Bookings</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">Booking Details</h1>
                <p className="text-gray-600">Booking ID: {booking.id}</p>
              </div>
              <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-semibold text-sm">{statusInfo.label}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Listing Card */}
              {listing && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {listing.images && listing.images.length > 0 && (
                    <div className="h-64 bg-gradient-to-br from-emerald-400 to-emerald-600 relative">
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h2>
                    {listing.location && (
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <FaMapMarkerAlt className="text-emerald-600" />
                        <span>{listing.location}</span>
                      </div>
                    )}
                    {listing.description && (
                      <p className="text-gray-700 leading-relaxed mb-4">{listing.description}</p>
                    )}
                    <button
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                    >
                      View Listing
                    </button>
                  </div>
                </div>
              )}

              {/* Booking Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaCalendarCheck className="text-emerald-600" />
                  Booking Information
                </h3>
                
                <div className="space-y-4">
                  {booking.checkIn && (
                    <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <FaCalendarAlt className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Check-in</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(booking.checkIn)}</p>
                      </div>
                    </div>
                  )}

                  {booking.checkOut && (
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Check-out</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(booking.checkOut)}</p>
                      </div>
                    </div>
                  )}

                  {booking.guests && (
                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <FaUsers className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Guests</p>
                        <p className="text-lg font-semibold text-gray-900">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                      </div>
                    </div>
                  )}

                  {nights > 0 && (
                    <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <FaBed className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Duration</p>
                        <p className="text-lg font-semibold text-gray-900">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FaClock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Booking Date</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>

                  {booking.cancelledAt && (
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <FaTimesCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Cancelled On</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDateTime(booking.cancelledAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaCreditCard className="text-emerald-600" />
                  Payment Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₱{(booking.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-semibold text-gray-900">₱{(booking.serviceFee || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 pt-4">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">₱{(booking.total || booking.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  
                  {booking.paymentMethod && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                      <p className="font-semibold text-gray-900 capitalize">{booking.paymentMethod}</p>
                    </div>
                  )}

                  {booking.paymentStatus && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        booking.paymentStatus === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : booking.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.paymentStatus === 'completed' && <FaCheckCircle className="w-3 h-3" />}
                        {booking.paymentStatus === 'pending' && <FaClock className="w-3 h-3" />}
                        {booking.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Host Information */}
              {host && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FaUser className="text-emerald-600" />
                    Host Information
                  </h3>
                  
                  <div className="flex items-start gap-4 mb-6">
                    {host.profilePicture ? (
                      <img
                        src={host.profilePicture}
                        alt={`${host.firstName || ''} ${host.lastName || ''}`.trim() || 'Host'}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                        {host.firstName && host.lastName ? (
                          <span>
                            {host.firstName.charAt(0).toUpperCase()}
                            {host.lastName.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <FaUser className="w-10 h-10" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {host.firstName && host.lastName 
                          ? `${host.firstName} ${host.lastName}`
                          : host.email?.split('@')[0] || 'Host'
                        }
                      </h4>
                      {host.bio && (
                        <p className="text-gray-600 text-sm mb-3">{host.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {host.subscriptionStatus === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                            <FaShieldAlt className="w-3 h-3" />
                            Verified Host
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {host.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FaEnvelope className="text-emerald-600" />
                        <a 
                          href={`mailto:${host.email}`}
                          className="text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                          {host.email}
                        </a>
                      </div>
                    )}
                    {host.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FaPhone className="text-emerald-600" />
                        <a 
                          href={`tel:${host.phone}`}
                          className="text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                          {host.phone}
                        </a>
                      </div>
                    )}
                    <button
                      onClick={handleContactHost}
                      className="w-full px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                    >
                      Contact Host
                    </button>
                  </div>
                </div>
              )}

              {/* Message to Host */}
              {booking.messageToHost && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaEnvelope className="text-emerald-600" />
                    Message to Host
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {booking.messageToHost}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Action Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                
                <div className="space-y-3">
                  {canCancelBooking(booking) && (
                    <button
                      onClick={handleCancelClick}
                      className="w-full px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <FaBan className="w-4 h-4" />
                      Cancel Booking
                    </button>
                  )}
                  
                  <button
                    onClick={handleContactHost}
                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <FaEnvelope className="w-4 h-4" />
                    Contact Host
                  </button>

                  {listing && (
                    <button
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <FaMapMarkerAlt className="w-4 h-4" />
                      View Listing
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <FaPrint className="w-4 h-4" />
                    Print Details
                  </button>
                </div>
              </div>

              {/* Booking Summary Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Booking ID</span>
                    <span className="font-mono text-xs text-gray-900">{booking.id.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold ${statusInfo.color.replace('bg-', 'text-').replace('border-', '')}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  {booking.paymentStatus && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment</span>
                      <span className={`font-semibold ${
                        booking.paymentStatus === 'completed' ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-emerald-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Total</span>
                      <span className="text-xl font-bold text-emerald-700">
                        ₱{(booking.total || booking.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !cancelling && setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
                  <p className="text-sm text-gray-600">Are you sure you want to cancel this booking?</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-medium mb-2">⚠️ Important Information:</p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>This action cannot be undone</li>
                  <li>Your booking will be marked as cancelled</li>
                  <li>Refund policies apply based on cancellation terms</li>
                  <li>The host will be notified of this cancellation</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelBookingId(null);
                  }}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <FaBan className="w-4 h-4" />
                      Yes, Cancel Booking
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingDetails;

