// PayPalCancel.jsx - Handle PayPal payment cancellation
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import { FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

const PayPalCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    const bookingIdParam = searchParams.get('bookingId') || sessionStorage.getItem('pendingPaypalBookingId');
    setBookingId(bookingIdParam);

    // Update booking status to cancelled if booking exists
    if (bookingIdParam) {
      const updateBooking = async () => {
        try {
          const bookingRef = doc(db, 'bookings', bookingIdParam);
          const bookingSnap = await getDoc(bookingRef);
          
          if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data();
            // Only update if still pending PayPal
            if (bookingData.paymentStatus === 'pending_paypal') {
              await updateDoc(bookingRef, {
                paymentStatus: 'cancelled',
                status: 'cancelled',
                updatedAt: serverTimestamp()
              });
            }
          }
        } catch (error) {
          console.error('Error updating cancelled booking:', error);
        }
      };
      updateBooking();
    }

    // Clear sessionStorage
    sessionStorage.removeItem('pendingPaypalBookingId');
    sessionStorage.removeItem('pendingPaypalBookingData');
  }, [searchParams]);

  return (
    <>
      <SettingsHeader />
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <FaTimesCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
            <p className="text-gray-600 mb-6">
              Your payment was cancelled. No charges were made. You can try again or choose a different payment method.
            </p>
            <div className="flex gap-4 justify-center">
              {bookingId && (
                <button
                  onClick={() => navigate(`/payment`, { 
                    state: { 
                      bookingId,
                      retryPayment: true 
                    } 
                  })}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => navigate('/bookings')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                Go to Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayPalCancel;

