// src/pages/UserBookings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
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
  FaHourglassHalf,
  FaTimesCircle,
  FaCalendarAlt,
  FaInfoCircle,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

const UserBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (!user?.uid) {
        setBookings([]);
        return;
      }

      // Fetch bookings from Firestore
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookingsData = [];

      for (const docSnap of querySnapshot.docs) {
        const bookingData = docSnap.data();
        
        // Fetch listing details
        let listingData = null;
        if (bookingData.listingId) {
          try {
            const listingRef = doc(db, 'listings', bookingData.listingId);
            const listingSnap = await getDoc(listingRef);
            if (listingSnap.exists()) {
              listingData = listingSnap.data();
            }
          } catch (error) {
            console.error('Error fetching listing:', error);
          }
        }

        bookingsData.push({
          id: docSnap.id,
          ...bookingData,
          listing: listingData,
          checkIn: bookingData.checkIn?.toDate ? bookingData.checkIn.toDate() : new Date(bookingData.checkIn),
          checkOut: bookingData.checkOut?.toDate ? bookingData.checkOut.toDate() : new Date(bookingData.checkOut),
          createdAt: bookingData.createdAt?.toDate ? bookingData.createdAt.toDate() : new Date(bookingData.createdAt)
        });
      }

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    if (booking.status === 'cancelled') return 'cancelled';
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

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return getBookingStatus(booking) === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const diff = new Date(checkOut) - new Date(checkIn);
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
              <p className="text-gray-600 mb-6">Sign in to view your bookings</p>
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

  return (
    <>
      <SettingsHeader />
      <div className="min-h-screen bg-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">
              {bookings.length > 0 
                ? `You have ${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'}`
                : 'Your bookings will appear here'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Bookings' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'active', label: 'Active' },
              { value: 'past', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === value
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <Loading message="Loading bookings..." size="medium" fullScreen={false} />
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
              <FaCalendarCheck className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
              </h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Start exploring and book your next adventure!'
                  : `You don't have any ${filter} bookings at the moment.`}
              </p>
              <button
                onClick={() => navigate('/homestays')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Explore Listings
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => {
                const status = getBookingStatus(booking);
                const statusInfo = getStatusInfo(status);
                const StatusIcon = statusInfo.icon;
                const nights = calculateNights(booking.checkIn, booking.checkOut);

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50"
                  >
                    <div className="md:flex">
                      {/* Image */}
                      <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-emerald-400 to-emerald-600 relative overflow-hidden">
                        {booking.listing?.images && booking.listing.images.length > 0 ? (
                          <>
                            <img 
                              src={booking.listing.images[0]} 
                              alt={booking.listing.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
                        )}
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full border ${statusInfo.color} backdrop-blur-sm flex items-center gap-2`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">{statusInfo.label}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex flex-col h-full">
                          {/* Title and Location */}
                          <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {booking.listing?.title || 'Booking'}
                            </h3>
                            {booking.listing?.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaMapMarkerAlt className="text-emerald-600" />
                                <span>{booking.listing.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Booking Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Check-in */}
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <FaCalendarAlt className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Check-in</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkIn)}</p>
                              </div>
                            </div>

                            {/* Check-out */}
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FaCalendarAlt className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Check-out</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkOut)}</p>
                              </div>
                            </div>

                            {/* Guests */}
                            {booking.guests && (
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                  <FaUsers className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-0.5">Guests</p>
                                  <p className="text-sm font-semibold text-gray-900">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                                </div>
                              </div>
                            )}

                            {/* Nights */}
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <FaBed className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                                <p className="text-sm font-semibold text-gray-900">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
                              <p className="text-2xl font-bold text-gray-900">₱{(booking.totalAmount || 0).toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => navigate(`/listing/${booking.listingId}`)}
                              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                            >
                              View Listing
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserBookings;
