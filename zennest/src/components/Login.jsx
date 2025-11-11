import React, { useState, useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { getHostProfile } from "../services/firestoreService";
import { getAuthErrorMessage } from "../utils/firebaseErrors";
import { sendPasswordRecoveryEmail } from "../services/passwordRecovery";
import Logo from "../assets/zennest-logo-v2.svg";
import SideImage from "../assets/register-side.jpg";
import LightRays from "./LightRays";
import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaEnvelope,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
  FaSpinner,
  FaTimes
} from "react-icons/fa";

// Social Login Icons
const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.3 7.6 28.9 6 24 6 12.9 6 4 14.9 4 26s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.5-.4-3.7z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.4 16.1 18.9 14 24 14c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.3 7.6 28.9 6 24 6c-7.3 0-13.7 3.3-17.7 8.7z"/>
    <path fill="#4CAF50" d="M24 46c5.1 0 9.6-1.7 13.2-4.6l-6.1-5.1C29.7 37.6 27 38.7 24 38.7c-5.3 0-9.7-3.4-11.3-8H6.3l-6.6 5.1C10.3 42.7 16.6 46 24 46z"/>
    <path fill="#1976D2" d="M43.6 20.5h-1.9V20H24v8h11.3c-1 3-3.1 5.5-6.2 6.9l.1.1 6.1 5.1C39.1 36.6 44 31 44 24c0-1.3-.1-2.5-.4-3.7z"/>
  </svg>
);

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signInWithGoogle, loading, user } = useAuth();

  // Auto-hide error notification
  useEffect(() => {
    if (error) {
      setShowErrorNotification(true);

      const timer = setTimeout(() => {
        setShowErrorNotification(false);
        setTimeout(() => {
          setError("");
        }, 300);
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [error]);

  useLayoutEffect(() => {
    if (location.pathname === "/login") document.body.classList.add("hide-header");
    return () => document.body.classList.remove("hide-header");
  }, [location]);

  // Redirect based on user role
  useEffect(() => {
    const redirectUser = async () => {
      if (!user || loading) return;
      await new Promise(resolve => setTimeout(resolve, 100));

      const from = location.state?.from;
      const bookingData = location.state?.bookingData;
      
      // If we have a 'from' path and it's not the current path, navigate there
      // Preserve bookingData if it exists
      if (from && from !== location.pathname) {
        navigate(from, { 
          replace: true,
          state: bookingData ? { bookingData } : undefined
        });
        return;
      }

      // If we have bookingData but no 'from', go to payment page
      if (bookingData) {
        navigate('/payment', { 
          replace: true,
          state: { bookingData }
        });
        return;
      }

      try {
        const hostResult = await getHostProfile(user.uid);
        if (hostResult.success && hostResult.data) {
          navigate("/host/dashboard", { replace: true });
          return;
        }
      } catch (err) {
        console.error('Error checking host status:', err);
      }

      if (location.pathname !== "/") {
        navigate("/", { replace: true });
      }
    };

    if (user && !loading) {
      redirectUser();
    }
  }, [user, loading, navigate, location.state, location.pathname]);

  // Real-time validation
  const validateField = (name, value) => {
    if (!touched[name]) return "";
    
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
    }
    
    if (name === "password") {
      if (!value.trim()) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
    }
    
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setFieldErrors({ ...fieldErrors, [name]: error });
    }
    
    if (error) {
      setShowErrorNotification(false);
      setTimeout(() => {
        setError("");
      }, 300);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setFieldErrors({ ...fieldErrors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const emailError = validateField("email", form.email);
    const passwordError = validateField("password", form.password);
    
    setFieldErrors({ email: emailError, password: passwordError });
    
    if (emailError || passwordError) {
      setError("Please fix the errors before submitting");
      return;
    }
    
    try {
      await login(form.email, form.password);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code) || err.message;
      setError(errorMessage);
      console.error("Login error:", {
        code: err.code,
        message: err.message,
        errorMessage
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getAuthErrorMessage(err.code) || err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoverySuccess(false);
    
    if (!recoveryEmail || !recoveryEmail.includes('@')) {
      setRecoveryError("Please enter a valid email address.");
      return;
    }

    setRecoveryLoading(true);
    try {
      const result = await sendPasswordRecoveryEmail(recoveryEmail);
      if (result.success) {
        setRecoverySuccess(true);
        setRecoveryEmail("");
        setTimeout(() => {
          setShowForgotPassword(false);
          setRecoverySuccess(false);
        }, 3000);
      } else {
        setRecoveryError(result.error || "Failed to send recovery email. Please try again.");
      }
    } catch (err) {
      setRecoveryError("An error occurred. Please try again later.");
      console.error("Password recovery error:", err);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <section 
      className="relative min-h-screen flex overflow-hidden bg-gray-50" 
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Error Notification Overlay - Top Right */}
      <AnimatePresence>
        {showErrorNotification && error && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className="fixed top-6 right-6 z-50 max-w-md w-full"
          >
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                  <FaExclamationCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-red-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{error}</p>
                </div>
                <button
                  onClick={() => {
                    setShowErrorNotification(false);
                    setTimeout(() => {
                      setError("");
                    }, 300);
                  }}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Close notification"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Left side: Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 py-8 z-20 bg-white md:bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.15 }}
          className="w-full max-w-md"
        >

          {/* Logo & Welcome */}
          <div className="text-center mb-5">
            <motion.img
              src={Logo}
              alt="Zennest Logo"
              className="h-10 mx-auto mb-2.5"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome Back
            </h1>
            <p className="text-gray-600 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Sign in to continue your journey with Zennest
            </p>
          </div>


          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5">
            <form className="space-y-3.5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className={`w-3.5 h-3.5 ${fieldErrors.email && touched.email ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    autoComplete="email"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm border-2 rounded-xl transition-all focus:outline-none ${
                      fieldErrors.email && touched.email
                        ? 'border-red-500 focus:border-red-600 bg-red-50'
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {fieldErrors.email && touched.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-[10px] text-red-600 flex items-center gap-1"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <FaExclamationCircle className="w-2.5 h-2.5" />
                      {fieldErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`w-3.5 h-3.5 ${fieldErrors.password && touched.password ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    className={`w-full pl-10 pr-11 py-2.5 text-sm border-2 rounded-xl transition-all focus:outline-none ${
                      fieldErrors.password && touched.password
                        ? 'border-red-500 focus:border-red-600 bg-red-50'
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-4 h-4" />
                    ) : (
                      <FaEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {fieldErrors.password && touched.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-[10px] text-red-600 flex items-center gap-1"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <FaExclamationCircle className="w-2.5 h-2.5" />
                      {fieldErrors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                style={{ fontFamily: 'Poppins, sans-serif' }}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FaLock className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Security Badges */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-3 text-[10px] text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="flex items-center gap-1">
                  <FaShieldAlt className="w-3 h-3 text-emerald-600" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1">
                  <FaCheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Secure Login</span>
                </div>
              </div>
            </div>

            {/* Register Link */}
            <p className="mt-4 text-center text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              New to Zennest?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Social Login */}
          <div className="mt-5">
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white md:bg-transparent text-gray-500 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="mt-4 grid grid-cols-1 gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleSignIn}
                style={{ fontFamily: 'Poppins, sans-serif' }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                <GoogleLogo />
                <span className="font-semibold text-gray-700 text-xs">Continue with Google</span>
              </motion.button>
            </div>
          </div>

          {/* Trust Message */}
          <div className="mt-5 text-center">
            <p className="text-[10px] text-gray-500 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-emerald-700 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-emerald-700 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowForgotPassword(false);
              setRecoveryEmail("");
              setRecoveryError("");
              setRecoverySuccess(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {recoverySuccess ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <FaCheckCircle className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-gray-600 text-xs mb-1.5 leading-relaxed">
                    We've sent password reset instructions to your email address.
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Didn't receive it? Check your spam folder or try again.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setRecoveryEmail("");
                        setRecoveryError("");
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-4 text-xs leading-relaxed">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label htmlFor="recovery-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <input
                          id="recovery-email"
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          disabled={recoveryLoading}
                          className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {recoveryError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2"
                      >
                        <FaExclamationCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <p className="text-xs text-red-800">{recoveryError}</p>
                      </motion.div>
                    )}

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setRecoveryEmail("");
                          setRecoveryError("");
                        }}
                        disabled={recoveryLoading}
                        className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={recoveryLoading}
                        className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {recoveryLoading ? (
                          <>
                            <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </motion.button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right side: Background Image */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src={SideImage}
          alt="Zennest Experience"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent">
          <LightRays
            raysOrigin="top-center"
            raysColor="#FBEC5D"
            raysSpeed={2}
            lightSpread={30}
            rayLength={100}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
          />
        </div>
        
        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Your Next Adventure Awaits
            </h2>
            <p className="text-base text-white/90 mb-5 max-w-md" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Discover unique stays, unforgettable experiences, and exceptional services across the Philippines.
            </p>
            <div className="flex items-center gap-5 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>1000+ Properties</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Hosts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="absolute bottom-4 right-6 text-[10px] text-white/80" style={{ fontFamily: 'Poppins, sans-serif' }}>
          © Zennest {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
};

export default Login; 