// src/pages/HostCalendar.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHostBookings, getHostListings } from '../services/firestoreService';
import useAuth from '../hooks/useAuth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaCheck, FaTimes, FaHome } from 'react-icons/fa';
import Loading from '../components/Loading';

const HostCalendar = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'list'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [bookingsResult, listingsResult] = await Promise.all([
        getHostBookings(user.uid),
        getHostListings(user.uid)
      ]);

      setBookings(bookingsResult.data || []);
      setListings(listingsResult.data || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (selectedListing !== 'all' && booking.listingId !== selectedListing) {
      return false;
    }
    return true;
  });

  // Get bookings for selected date
  const getBookingsForDate = (date) => {
    return filteredBookings.filter(booking => {
      if (!booking.checkIn) return false;
      const checkInDate = booking.checkIn.toDate 
        ? booking.checkIn.toDate()
        : new Date(booking.checkIn);
      
      const dateStr = date.toDateString();
      const checkInStr = checkInDate.toDateString();
      return dateStr === checkInStr;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const calendarDays = getDaysInMonth(selectedDate);

  if (loading) {
    return <Loading message="Loading calendar..." size="medium" fullScreen={false} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaCalendarAlt className="text-emerald-600" />
            Calendar
          </h1>
          <p className="text-gray-600">Manage your listing availability</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'month'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'list'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Listing:</label>
          <select
            value={selectedListing}
            onChange={(e) => setSelectedListing(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Listings</option>
            {listings.map(listing => (
              <option key={listing.id} value={listing.id}>
                {listing.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Calendar View */}
      {view === 'month' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dayBookings = date ? getBookingsForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] border-r border-b border-gray-200 p-2
                    ${date ? 'bg-white' : 'bg-gray-50'}
                    ${isToday ? 'bg-emerald-50' : ''}
                  `}
                >
                  {date && (
                    <>
                      <div className={`
                        text-sm font-medium mb-1
                        ${isToday ? 'text-emerald-700' : 'text-gray-900'}
                      `}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map((booking, idx) => (
                          <div
                            key={idx}
                            className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded truncate"
                            title={`${booking.guestName || 'Guest'} - ${booking.listingTitle || 'Listing'}`}
                          >
                            {booking.guestName || 'Guest'}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredBookings
              .sort((a, b) => {
                const dateA = a.checkIn?.toDate ? a.checkIn.toDate() : new Date(a.checkIn);
                const dateB = b.checkIn?.toDate ? b.checkIn.toDate() : new Date(b.checkIn);
                return dateA - dateB;
              })
              .map((booking, index) => (
                <motion.div
                  key={booking.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FaHome className="text-emerald-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.listingTitle || 'Listing'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.guestName || 'Guest'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-medium text-gray-900">
                            {booking.checkIn?.toDate
                              ? booking.checkIn.toDate().toLocaleDateString()
                              : new Date(booking.checkIn).toLocaleDateString()
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-medium text-gray-900">
                            {booking.checkOut?.toDate
                              ? booking.checkOut.toDate().toLocaleDateString()
                              : new Date(booking.checkOut).toLocaleDateString()
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-emerald-700">
                            ₱{(booking.total || booking.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${booking.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {booking.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {filteredBookings.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <FaCalendarAlt className="text-5xl mx-auto mb-4 text-gray-300" />
              <p>No bookings found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostCalendar;

