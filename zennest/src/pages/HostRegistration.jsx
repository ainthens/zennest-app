// src/pages/HostRegistration.jsx - Fixed with proper PayPal integration
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import Loading from '../components/Loading';
import { auth } from '../config/firebase';
import { updateSubscriptionStatus } from '../services/firestoreService';
import { generateOTP, sendHostVerificationEmail } from '../services/emailService';
import {
  FaCheck,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaCreditCard,
  FaArrowLeft,
  FaTimes,
  FaFileContract,
  FaShieldAlt,
  FaStar,
  FaCrown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

/**
 * PayPalButtonsWrapper for Host Registration
 * Handles PayPal script loading and currency fallback
 */
const PayPalButtonsWrapper = ({
  createOrder,
  onApprove,
  onError,
  onCancel,
  style = { layout: 'vertical' },
  forceReinitKey,
  currency,
  onCurrencyFallback,
  disabled = false
}) => {
  const [{ options, loadingStatus }, dispatch] = usePayPalScriptReducer();

  // Handle script loading failures and currency fallback
  useEffect(() => {
    if (loadingStatus === 'REJECTED') {
      console.error('❌ PayPal SDK script loading REJECTED for options:', options);

      // If PHP fails, fallback to USD
      if ((options.currency === 'PHP' || currency === 'PHP') && typeof onCurrencyFallback === 'function') {
        console.warn('🔄 Attempting fallback to USD due to PHP SDK load failure');
        onCurrencyFallback('USD');

        dispatch({
          type: 'resetOptions',
          value: {
            ...options,
            currency: 'USD',
            components: 'buttons'
          }
        });
      }
    }
  }, [loadingStatus, options, dispatch, currency, onCurrencyFallback]);

  if (loadingStatus === 'pending' || loadingStatus === 'rejected') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading PayPal...</p>
          {loadingStatus === 'rejected' && (
            <p className="text-xs text-amber-600 mt-1">Having trouble loading PayPal. Retrying...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PayPalButtons
        style={style}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={onCancel}
        onError={onError}
        disabled={disabled}
        key={forceReinitKey}
      />
    </div>
  );
};

const HostRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Prefill from location.state or auth.currentUser
  const loggedUser = auth.currentUser;
  let prefillFirstName = '';
  let prefillLastName = '';
  let prefillEmail = '';
  
  if (loggedUser) {
    prefillEmail = loggedUser.email || '';
    if (loggedUser.displayName) {
      const nameParts = loggedUser.displayName.split(' ');
      prefillFirstName = nameParts[0] || '';
      prefillLastName = nameParts.slice(1).join(' ');
    }
  }

  // Component state
  const [step, setStep] = useState(location.state?.step || 1);
  const [formData, setFormData] = useState({
    firstName: location.state?.firstName || prefillFirstName,
    lastName: location.state?.lastName || prefillLastName,
    email: location.state?.email || prefillEmail,
    password: location.state?.password || '',
    confirmPassword: '',
    phone: location.state?.phone || '',
    subscriptionPlan: location.state?.subscriptionPlan || 'pro'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // PayPal state
  const [paypalError, setPaypalError] = useState(null);
  const [paypalCurrency, setPaypalCurrency] = useState(() => {
    const saved = sessionStorage.getItem('paypalCurrency');
    return saved || 'PHP';
  });
  const [currencySwitched, setCurrencySwitched] = useState(false);
  const [forceReinitKey, setForceReinitKey] = useState(0);

  // PayPal Client ID configuration
  const envClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const globalClientId = typeof window !== 'undefined' && window.PAYPAL_CLIENT_ID ? window.PAYPAL_CLIENT_ID : null;
  const paypalClientId = (envClientId && envClientId.trim()) || (globalClientId && globalClientId.trim()) || '';

  // Update step when location.state changes
  useEffect(() => {
    if (location.state?.step) {
      setStep(location.state.step);
    }
  }, [location.state]);

  // Validate PayPal configuration on mount
  useEffect(() => {
    if (!paypalClientId) {
      console.error('❌ PayPal Client ID is missing for host registration');
      setPaypalError('PayPal client ID is not configured. Please set VITE_PAYPAL_CLIENT_ID in your environment.');
    } else {
      console.log('✅ PayPal Client ID available for host registration. Using currency:', paypalCurrency);
    }
  }, [paypalClientId, paypalCurrency]);

  const subscriptionPlans = {
    basic: {
      name: 'Basic',
      price: 500,
      duration: 1,
      durationText: '/ month',
      priceText: '₱500 / month',
      description: 'Perfect for getting started.',
      listingLimit: 5,
      features: [
        'Up to 5 property listings',
        'Basic analytics dashboard',
        'Email support within 48hrs',
        'Standard listing visibility'
      ],
      icon: 'shield',
      popular: false
    },
    pro: {
      name: 'Pro',
      price: 1200,
      duration: 3,
      durationText: '/ 3 months',
      priceText: '₱1,200 / 3 months',
      description: 'Most popular for serious hosts.',
      listingLimit: 20,
      features: [
        'Up to 20 property listings',
        'Advanced analytics & insights',
        'Priority support within 24hrs',
        'Enhanced listing visibility',
        'Marketing tools access'
      ],
      icon: 'star',
      popular: true,
      savings: 300
    },
    premium: {
      name: 'Premium',
      price: 4500,
      duration: 12,
      durationText: '/ year',
      priceText: '₱4,500 / year',
      description: 'Maximum value for professionals.',
      listingLimit: -1,
      features: [
        'Unlimited property listings',
        'Premium analytics suite',
        '24/7 dedicated phone support',
        'Featured homepage placement',
        'Full marketing automation',
        'Personal account manager'
      ],
      icon: 'sparkle',
      popular: false,
      savings: 1500
    }
  };

  const termsAndConditions = {
    title: "Zennest Host Terms and Conditions",
    lastUpdated: "November 5, 2025",
    sections: [
      {
        title: "1. Host Account and Responsibilities",
        content: [
          "By creating a host account, you agree to provide accurate and complete information about yourself and your properties.",
          "You are responsible for maintaining the security of your account credentials.",
          "You must be at least 18 years old to register as a host.",
          "You agree to comply with all local laws and regulations regarding property rental and hosting."
        ]
      },
      // ... (other sections remain the same)
    ],
    footer: "By checking the box below and proceeding with registration, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions."
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAccountCreation = async () => {
    setError('');
    setLoading(true);

    // Validate form data
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your first and last name');
      setLoading(false);
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!loggedUser) {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms and Conditions to continue');
      setLoading(false);
      return;
    }

    try {
      const otp = generateOTP();
      const userName = `${formData.firstName} ${formData.lastName}`.trim();
      const emailToUse = loggedUser ? loggedUser.email : formData.email;

      console.log('🚀 Starting host email sending process...', {
        email: emailToUse,
        userName: userName,
        otp: otp
      });

      const emailResult = await sendHostVerificationEmail(emailToUse, otp, userName);
      
      console.log('📨 Host email sending result:', emailResult);

      if (emailResult.success) {
        console.log('✅ Host verification email sent successfully, navigating to verification page');
        const emailForState = loggedUser ? loggedUser.email : formData.email;
        navigate('/host/verify-email', {
          state: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: emailForState,
            phone: formData.phone,
            subscriptionPlan: formData.subscriptionPlan,
            otp,
            userName,
            password: loggedUser ? undefined : formData.password
          },
          replace: false
        });
      } else {
        const errorMessage = emailResult.error || 'Failed to send verification email. Please try again.';
        console.error('❌ Host email sending failed:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    } catch (err) {
      console.error('💥 Host registration error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentId, paidAmount) => {
    try {
      setLoading(true);
      setError('');
      
      const user = auth.currentUser;
      
      if (!user) {
        setError('Session expired. Please log in to continue.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        setLoading(false);
        return;
      }

      // Get subscription plan details
      const selectedPlan = subscriptionPlans[formData.subscriptionPlan || 'pro'];
      
      if (!selectedPlan) {
        throw new Error('Invalid subscription plan selected');
      }
      
      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + selectedPlan.duration);

      console.log('💳 Updating subscription status...', {
        userId: user.uid,
        plan: formData.subscriptionPlan || 'pro',
        paymentId: paymentId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Update subscription status with plan details
      await updateSubscriptionStatus(
        user.uid, 
        'active', 
        paymentId,
        formData.subscriptionPlan || 'pro',
        startDate,
        endDate
      );
      
      console.log('✅ Subscription status updated successfully');
      
      // Reload user data to get latest state
      await user.reload();
      
      // Move to Step 3 (Congratulations)
      setStep(3);
      setPaymentCompleted(true);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error updating subscription:', error);
      const errorMessage = error.message || 'Payment processed but failed to activate subscription. Please contact support with your payment ID.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // PayPal order creation
  const createPayPalOrder = (data, actions) => {
    try {
      const plan = subscriptionPlans[formData.subscriptionPlan || 'pro'];
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }
      
      if (!auth.currentUser) {
        throw new Error('You must be logged in to complete payment');
      }
      
      console.log('Creating PayPal order for plan:', plan.name, 'Price:', plan.price, 'Currency:', paypalCurrency);
      
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: plan.price.toFixed(2),
            currency_code: paypalCurrency
          },
          description: `Zennest Host Subscription - ${plan.name} Plan`,
          custom_id: auth.currentUser.uid
        }],
        application_context: {
          brand_name: 'Zennest',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW'
        }
      });
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      setPaypalError(error.message || 'Failed to create payment order. Please try again.');
      return Promise.reject(error);
    }
  };

  // PayPal order approval
  const onApprovePayPalOrder = async (data, actions) => {
    try {
      setLoading(true);
      setPaypalError('');
      
      const details = await actions.order.capture();
      console.log('✅ PayPal payment approved:', details);
      
      if (details.status === 'COMPLETED') {
        const purchaseUnit = details.purchase_units?.[0];
        const amount = purchaseUnit?.amount;
        const paidAmount = amount?.value ? parseFloat(amount.value) : null;
        const currency = amount?.currency_code || 'PHP';
        
        // Verify user is still logged in
        const user = auth.currentUser;
        if (!user) {
          setError('Session expired. Please log in and try again.');
          setLoading(false);
          return;
        }
        
        // Get selected plan
        const selectedPlan = subscriptionPlans[formData.subscriptionPlan || 'pro'];
        
        // Validate payment amount (allow small rounding differences)
        if (paidAmount && Math.abs(paidAmount - selectedPlan.price) > 0.01) {
          console.warn(`⚠️ Payment amount mismatch: Expected ${selectedPlan.price}, received ${paidAmount}`);
        }
        
        // Store payment details
        setPaymentDetails({
          paymentId: details.id,
          orderId: data.orderID,
          paidAmount: paidAmount || selectedPlan.price,
          currency: currency,
          payer: details.payer,
          createTime: details.create_time,
          updateTime: details.update_time
        });
        
        // Process payment success
        await handlePaymentSuccess(details.id, paidAmount || selectedPlan.price);
      } else {
        console.error('❌ Payment not completed. Status:', details.status);
        setPaypalError(`Payment was not completed. Status: ${details.status}. Please try again.`);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ PayPal payment error:', error);
      const errorMessage = error.message || 'Payment failed. Please try again or contact support.';
      setPaypalError(errorMessage);
      setLoading(false);
    }
  };

  // PayPal error handler
  const onPayPalError = (err) => {
    console.error('❌ PayPal error:', err);
    setPaypalError(err.message || 'Payment failed. Please try again.');
    setLoading(false);
  };

  // PayPal cancel handler
  const onPayPalCancel = (data) => {
    console.log('❌ PayPal payment cancelled:', data);
    setPaypalError('Payment was cancelled. You can try again when ready.');
  };

  // Currency fallback handler
  const handleCurrencyFallback = (newCurrency) => {
    try {
      console.warn('PayPal currency fallback:', paypalCurrency, '->', newCurrency);
      sessionStorage.setItem('paypalCurrency', newCurrency);
      setPaypalCurrency(newCurrency);
      setCurrencySwitched(true);
      setForceReinitKey((k) => k + 1);
    } catch (e) {
      console.error('Currency fallback error:', e);
    }
  };

  // Render PayPal payment section
  const renderPayPalPayment = () => {
    const selectedPlan = subscriptionPlans[formData.subscriptionPlan];

    return (
      <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-gray-200">
        {!paypalClientId ? (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 rounded-lg">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-amber-800 font-semibold mb-1">PayPal Not Configured</p>
                <p className="text-amber-700 text-sm">
                  Please add VITE_PAYPAL_CLIENT_ID to your environment variables.
                </p>
              </div>
            </div>
          </div>
        ) : paypalError ? (
          <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <FaTimes className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-rose-700 text-sm">{paypalError}</p>
            </div>
          </div>
        ) : null}

        {paypalClientId && (
          <PayPalScriptProvider
            options={{
              'client-id': paypalClientId,
              currency: paypalCurrency,
              intent: 'capture',
              components: 'buttons'
            }}
          >
            <PayPalButtonsWrapper
              createOrder={createPayPalOrder}
              onApprove={onApprovePayPalOrder}
              onError={onPayPalError}
              onCancel={onPayPalCancel}
              style={{
                layout: 'vertical',
                shape: 'rect',
                label: 'paypal',
                color: 'gold',
                height: 45
              }}
              forceReinitKey={forceReinitKey}
              currency={paypalCurrency}
              onCurrencyFallback={handleCurrencyFallback}
              disabled={!auth.currentUser || loading}
            />
          </PayPalScriptProvider>
        )}

        {/* Currency fallback notice */}
        {paypalCurrency === 'USD' && currencySwitched && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p className="font-semibold text-yellow-800">Using USD for Testing</p>
            <p className="text-yellow-700 mt-1">
              PayPal sandbox may not support PHP. We've switched to USD automatically.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  sessionStorage.setItem('paypalCurrency', 'PHP');
                  setPaypalCurrency('PHP');
                  setCurrencySwitched(false);
                  setForceReinitKey(k => k + 1);
                }}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
              >
                Try PHP Again
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem('paypalCurrency', 'USD');
                  setPaypalCurrency('USD');
                  setCurrencySwitched(true);
                  setForceReinitKey(k => k + 1);
                }}
                className="px-3 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
              >
                Keep USD
              </button>
            </div>
          </div>
        )}

        {/* Security notice */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-600">
          <FaShieldAlt className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p>Your payment is secure and encrypted. By completing payment, you agree to our Terms of Service.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 pt-16 sm:pt-20 pb-8 px-4 sm:px-6">
      <div className={`mx-auto w-full ${step === 2 ? 'max-w-6xl' : 'max-w-3xl'}`}>
        
        {/* Back Button */}
        {step === 1 && (
          <button
            onClick={() => navigate('/')}
            className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group text-sm sm:text-base"
          >
            <FaArrowLeft className="text-xs sm:text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs sm:text-sm font-medium">Back to Home</span>
          </button>
        )}
        {step === 2 && !location.state?.fromVerification && (
          <button
            onClick={() => setStep(1)}
            className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group text-sm sm:text-base"
          >
            <FaArrowLeft className="text-xs sm:text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs sm:text-sm font-medium">Back to Personal Info</span>
          </button>
        )}

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 md:gap-3 max-w-md mx-auto">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center flex-1 sm:flex-none">
                  <div className={`
                    flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-semibold text-xs sm:text-sm
                    transition-all duration-300 ease-in-out
                    ${step >= s 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                    }
                    ${step === s ? 'ring-2 sm:ring-4 ring-emerald-100 scale-110' : 'scale-100'}
                  `}>
                    {step > s ? <FaCheck className="text-xs" /> : s}
                  </div>
                  <span className={`
                    block sm:hidden text-[10px] font-medium mt-1.5 text-center transition-colors max-w-[60px] leading-tight
                    ${step >= s ? 'text-emerald-700' : 'text-gray-400'}
                  `}>
                    {s === 1 ? 'Info' : s === 2 ? 'Plan' : 'Done'}
                  </span>
                  <span className={`
                    hidden sm:block text-xs font-medium mt-2 transition-colors
                    ${step >= s ? 'text-emerald-700' : 'text-gray-400'}
                  `}>
                    {s === 1 ? 'Personal Info' : s === 2 ? 'Choose Plan' : 'Congratulations'}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`
                    flex-1 h-0.5 mx-1 sm:mx-2 transition-all duration-500
                    ${step > s 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                      : 'bg-gray-200'
                    }
                  `} 
                  style={{ minWidth: '20px', maxWidth: '80px' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-gray-200/50 p-4 sm:p-6 md:p-8 border border-gray-100">
          
          {/* Step 1: Account Registration */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 sm:space-y-5"
            >
              {/* ... (Step 1 content remains exactly the same as your original) */}
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight px-2">
                  Become a Zennest Host
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto px-2">
                  Create your host account and start listing your properties
                </p>
              </div>

              {error && (
                <div className="p-3 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <p className="text-rose-700 text-xs font-medium leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-800">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 text-sm
                        border-2 border-gray-200 rounded-lg
                        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100
                        transition-all duration-200
                        hover:border-gray-300
                        placeholder:text-gray-400
                        text-gray-900 font-medium"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-800">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 text-sm
                        border-2 border-gray-200 rounded-lg
                        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100
                        transition-all duration-200
                        hover:border-gray-300
                        placeholder:text-gray-400
                        text-gray-900 font-medium"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-800">
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-sm
                      border-2 border-gray-200 rounded-lg
                      focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100
                      transition-all duration-200
                      hover:border-gray-300
                      placeholder:text-gray-400
                      text-gray-900 font-medium"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-800">
                  Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-sm
                      border-2 border-gray-200 rounded-lg
                      focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100
                      transition-all duration-200
                      hover:border-gray-300
                      placeholder:text-gray-400
                      text-gray-900 font-medium"
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {!loggedUser && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-800">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400 text-gray-900 font-medium"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-800">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          minLength={6}
                          className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400 text-gray-900 font-medium"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="termsCheckbox" className="flex-1 text-xs text-gray-700 leading-relaxed cursor-pointer">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold underline inline-flex items-center gap-1 break-words"
                    >
                      <FaFileContract className="text-xs flex-shrink-0" />
                      <span className="break-words">Terms and Conditions</span>
                    </button>
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleAccountCreation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 
                  text-white py-3 px-4 sm:px-5 rounded-lg 
                  hover:from-emerald-700 hover:to-emerald-800 
                  transition-all duration-200 
                  font-semibold text-sm
                  shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                  active:scale-98
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm">Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm">Continue to Email Verification</span>
                    <span className="text-base sm:text-lg">→</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Step 2: Subscription Selection & Payment */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
                  Choose Your Plan
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
                  Select the perfect plan for your hosting journey
                </p>
              </div>

              {!auth.currentUser && (
                <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg shadow-sm mb-6 max-w-3xl mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-rose-700 text-sm font-medium leading-relaxed">
                        You must be logged in to complete payment. Please log in and try again.
                      </p>
                      <button
                        onClick={() => navigate('/login', { state: { from: '/host/register', step: 2 } })}
                        className="mt-2 text-rose-700 text-sm font-semibold underline hover:text-rose-800 transition-colors"
                      >
                        Go to Login →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Plans Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
                {Object.entries(subscriptionPlans).map(([key, plan]) => {
                  const isSelected = formData.subscriptionPlan === key;
                  const IconComponent = 
                    plan.icon === 'shield' ? FaShieldAlt :
                    plan.icon === 'star' ? FaStar :
                    plan.icon === 'sparkle' ? FaCrown : FaShieldAlt;
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: key === 'basic' ? 0.1 : key === 'pro' ? 0.2 : 0.3 }}
                      onClick={() => setFormData(prev => ({ ...prev, subscriptionPlan: key }))}
                      className={`
                        relative cursor-pointer rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300
                        flex flex-col h-full bg-white
                        ${isSelected && plan.popular
                          ? 'border-orange-500 shadow-xl ring-2 ring-orange-200'
                          : isSelected
                          ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                    >
                      {/* Most Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 z-20">
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                            MOST POPULAR
                          </span>
                        </div>
                      )}

                      {/* Savings Badge */}
                      {plan.savings && (
                        <div className="absolute top-2 sm:top-3 -right-1 sm:-right-2 z-20">
                          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-md whitespace-nowrap">
                            Save ₱{plan.savings.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className="flex justify-center mb-3 sm:mb-4 mt-1">
                        <div className={`
                          w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors
                          ${plan.popular && isSelected
                            ? 'bg-orange-100'
                            : isSelected
                            ? 'bg-emerald-100'
                            : 'bg-gray-100'
                          }
                        `}>
                          <IconComponent className={`
                            text-lg sm:text-xl transition-colors
                            ${plan.popular && isSelected
                              ? 'text-orange-600'
                              : isSelected
                              ? 'text-emerald-600'
                              : 'text-gray-400'
                            }
                          `} />
                        </div>
                      </div>

                      {/* Plan Name */}
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-1 sm:mb-2">
                        {plan.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-600 text-center mb-3 sm:mb-4 min-h-[2.5rem] px-1">
                        {plan.description}
                      </p>

                      {/* Price */}
                      <div className="text-center mb-4 sm:mb-5">
                        <div className="text-xl sm:text-2xl font-black text-gray-900 mb-1">
                          {plan.priceText.split(' / ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {plan.priceText.split(' / ')[1]}
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 flex-grow">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <FaCheckCircle className={`
                              mt-0.5 flex-shrink-0 text-xs
                              ${isSelected
                                ? 'text-emerald-500'
                                : 'text-gray-400'
                              }
                            `} />
                            <span className={`
                              text-xs leading-relaxed
                              ${isSelected
                                ? 'text-gray-900'
                                : 'text-gray-600'
                              }
                            `}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Select Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, subscriptionPlan: key }));
                        }}
                        className={`
                          w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all mt-auto
                          ${isSelected && plan.popular
                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                            : isSelected
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }
                        `}
                      >
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Payment Section */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-gray-200 shadow-lg max-w-3xl mx-auto">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <FaCreditCard className="text-emerald-600 text-lg sm:text-xl" />
                    <span>Complete Payment</span>
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 px-2">
                    Pay securely with PayPal to activate your <span className="font-semibold text-emerald-700">{subscriptionPlans[formData.subscriptionPlan].name}</span> subscription
                  </p>
                </div>

                {/* Selected Plan Summary */}
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg sm:rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 border-2 border-emerald-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="text-center sm:text-left w-full sm:w-auto">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                        {subscriptionPlans[formData.subscriptionPlan].name} Plan
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {subscriptionPlans[formData.subscriptionPlan].listingLimit === -1 
                          ? 'Unlimited listings' 
                          : `Up to ${subscriptionPlans[formData.subscriptionPlan].listingLimit} property listings`}
                      </p>
                    </div>
                    <div className="text-center sm:text-right w-full sm:w-auto">
                      <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                        {subscriptionPlans[formData.subscriptionPlan].priceText.split(' / ')[0]}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">
                        {subscriptionPlans[formData.subscriptionPlan].priceText.split(' / ')[1]}
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg shadow-sm mb-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <p className="text-rose-700 text-xs font-medium leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                {/* PayPal Payment Integration */}
                {renderPayPalPayment()}
              </div>
            </motion.div>
          )}

          {/* Step 3: Congratulations */}
          {step === 3 && paymentCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              {/* ... (Step 3 content remains exactly the same as your original) */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="relative inline-block mb-6 sm:mb-8"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200">
                  <FaCheckCircle className="text-4xl sm:text-6xl text-white" />
                </div>
                <motion.div
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-400 rounded-full"
                />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2"
              >
                Congratulations! 🎉
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-gray-700 mb-2 font-semibold px-2"
              >
                You are now a part of Zennest Hosting Service!
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed px-2"
              >
                Your {subscriptionPlans[formData.subscriptionPlan]?.name} subscription has been activated successfully. 
                You can now start listing your properties and welcoming guests!
              </motion.p>

              {/* Subscription Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-emerald-200 shadow-md max-w-md mx-auto w-full"
              >
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Subscription Details</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Plan:</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {subscriptionPlans[formData.subscriptionPlan]?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Amount Paid:</span>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-700">
                      {paymentDetails?.paidAmount 
                        ? `₱${paymentDetails.paidAmount.toLocaleString()}` 
                        : `₱${subscriptionPlans[formData.subscriptionPlan]?.price.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Listing Limit:</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {subscriptionPlans[formData.subscriptionPlan]?.listingLimit === -1 
                        ? 'Unlimited' 
                        : `${subscriptionPlans[formData.subscriptionPlan]?.listingLimit} listings`}
                    </span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
              >
                <button
                  onClick={() => navigate('/host/dashboard')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-sm sm:text-base rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/host/listings/new')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-emerald-700 font-bold text-sm sm:text-base rounded-lg border-2 border-emerald-600 hover:bg-emerald-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  Create Your First Listing
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTermsModal(false)}
          >
            {/* ... (Terms modal content remains exactly the same as your original) */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostRegistration;