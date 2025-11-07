// PayPalReturn.jsx - Handle PayPal payment return
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import Loading from '../components/Loading';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PayPalReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const bookingId = searchParams.get('bookingId') || sessionStorage.getItem('pendingPaypalBookingId');
        const paymentId = searchParams.get('paymentId');
        const token = searchParams.get('token');
        const payerId = searchParams.get('PayerID');

        if (!bookingId) {
          setStatus('error');
          setMessage('Booking ID not found. Please contact support.');
          setTimeout(() => navigate('/bookings'), 3000);
          return;
        }

        // Get booking document
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
          setStatus('error');
          setMessage('Booking not found. Please contact support.');
          setTimeout(() => navigate('/bookings'), 3000);
          return;
        }

        const bookingData = bookingSnap.data();

        // Check if payment was already processed
        if (bookingData.paymentStatus === 'completed') {
          setStatus('success');
          setMessage('Payment already processed successfully!');
          setTimeout(() => navigate('/bookings', { 
            state: { success: true, message: 'Booking confirmed! Payment processed successfully.' }
          }), 2000);
          return;
        }

        // Update booking status to completed
        await updateDoc(bookingRef, {
          paymentStatus: 'completed',
          status: 'confirmed',
          paypalPaymentId: paymentId || token,
          paypalPayerId: payerId,
          updatedAt: serverTimestamp()
        });

        // Create transaction record
        const transactionsRef = collection(db, 'transactions');
        await addDoc(transactionsRef, {
          userId: user?.uid,
          type: 'payment',
          amount: bookingData.total || bookingData.totalAmount || 0,
          status: 'completed',
          description: `Booking payment for ${bookingData.listingTitle}`,
          paymentMethod: 'paypal',
          bookingId: bookingId,
          paypalPaymentId: paymentId || token,
          createdAt: serverTimestamp()
        });

        // Clear sessionStorage
        sessionStorage.removeItem('pendingPaypalBookingId');
        sessionStorage.removeItem('pendingPaypalBookingData');

        setStatus('success');
        setMessage('Payment processed successfully!');

        setTimeout(() => {
          navigate('/bookings', { 
            state: { 
              success: true, 
              message: 'Booking confirmed! Payment processed successfully.' 
            } 
          });
        }, 2000);

      } catch (error) {
        console.error('Error processing PayPal return:', error);
        setStatus('error');
        setMessage('Failed to process payment. Please contact support if payment was deducted.');
        setTimeout(() => navigate('/bookings'), 3000);
      }
    };

    if (user) {
      processPayment();
    }
  }, [searchParams, navigate, user]);

  return (
    <>
      <SettingsHeader />
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            {status === 'processing' && (
              <>
                <Loading message={message} size="large" fullScreen={false} />
              </>
            )}
            {status === 'success' && (
              <>
                <FaCheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
              </>
            )}
            {status === 'error' && (
              <>
                <FaTimesCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                  onClick={() => navigate('/bookings')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                >
                  Go to Bookings
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PayPalReturn;

