import React, { useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";
import { verifyOTP, resendOTP } from "../services/emailService";
import { getAuthErrorMessage } from "../utils/firebaseErrors";
import { createUserProfile } from "../services/firestoreService";
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaClock, FaShieldAlt } from "react-icons/fa";
import Logo from "../assets/zennest-logo-v2.svg";

const EmailVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { firstName, lastName, email, password, otp, userName } = location.state || {};

  const [inputOtp, setInputOtp] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | verifying | verified | error
  const [resending, setResending] = useState(false);

  // Hide header for this page
  useLayoutEffect(() => {
    if (location.pathname === "/verify-email") document.body.classList.add("hide-header");
    return () => document.body.classList.remove("hide-header");
  }, [location]);

  // Handle OTP input
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setInputOtp(value);
  };

  // Verify OTP and create Firebase account
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("verifying");
    
    if (inputOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      setStatus("idle");
      return;
    }

    if (!email || !password) {
      setError("Missing registration data. Please register again.");
      setStatus("idle");
      return;
    }

    try {
      // Verify OTP first
      const otpResult = verifyOTP(email, inputOtp);
      if (!otpResult.success) {
        setError(otpResult.error);
        setStatus("idle");
        return;
      }

      // OTP verified, create Firebase account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile with display name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });

      // Create user profile in Firestore with all registration data
      try {
        await createUserProfile(userCredential.user.uid, {
          firstName: firstName,
          lastName: lastName,
          email: email,
          displayName: `${firstName} ${lastName}`.trim(),
          emailVerified: true,
          otpVerified: true
        });
        console.log('✅ User profile created in Firestore with registration data');
      } catch (profileError) {
        console.error('❌ Error creating user profile in Firestore:', profileError);
        // Don't fail registration if profile creation fails, but log it
      }

      setStatus("verified");
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login", {
          state: { 
            message: "Registration successful! You can now log in.",
            email: email 
          },
        });
      }, 2000);
      
    } catch (err) {
      console.error('Firebase account creation error:', err);
      setError(getAuthErrorMessage(err.code) || "Account creation failed. Please try again.");
      setStatus("idle");
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError("");
    
    try {
      await resendOTP(email, userName);
      setInputOtp("");
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // If no registration data, show error
  if (!email || !password) {
    return (
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        {/* Branding */}
        <div className="absolute top-6 left-6 flex items-center space-x-2">
          <img 
            src={Logo} 
            alt="Zennest Logo" 
            className="h-14 w-auto" 
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white shadow-2xl rounded-2xl px-8 py-12 max-w-md w-full text-center relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-100 rounded-full opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-100 rounded-full opacity-50"></div>
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="relative z-10"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShieldAlt className="text-3xl text-red-500" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl font-bold text-gray-800 mb-3"
          >
            Registration Required
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 mb-6 leading-relaxed"
          >
            Please complete your registration first to verify your email address.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={() => navigate("/register")}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              <FaEnvelope className="text-sm" />
              <span>Go to Register</span>
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
              <FaArrowLeft className="text-sm" />
              <span>Go Back</span>
            </button>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      {/* Branding */}
      <div className="absolute top-6 left-6 flex items-center space-x-2">
        <img 
          src={Logo} 
          alt="Zennest Logo" 
          className="h-14 w-auto" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-2xl px-8 py-10 max-w-md w-full relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-100 rounded-full opacity-50"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>

        {status === "verified" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-3xl text-emerald-500" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-2xl font-bold text-emerald-700 mb-4"
            >
              Registration Successful!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-gray-600 mb-6 leading-relaxed"
            >
              Your account has been created successfully. Redirecting to login...
            </motion.p>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden"
            >
              <div className="bg-emerald-600 h-2 rounded-full animate-pulse"></div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
              className="text-center mb-6"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-2xl text-blue-500" />
              </div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                Verify Your Email
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-gray-600 mb-2"
              >
                Enter the 6-digit OTP sent to
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-emerald-700 font-semibold text-lg"
              >
                {email}
              </motion.p>
            </motion.div>

            <form onSubmit={handleVerify} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 text-lg text-center font-semibold rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200"
                  value={inputOtp}
                  onChange={handleChange}
                  disabled={status === "verifying"}
                  autoFocus
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Enter exactly 6 digits</span>
                  <span>{inputOtp.length}/6</span>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                disabled={status === "verifying" || inputOtp.length !== 6}
              >
                {status === "verifying" ? (
                  <>
                    <FaClock className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt />
                    <span>Verify & Register</span>
                  </>
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center mt-6 space-y-4"
            >
              <div>
                <p className="text-gray-600 text-sm mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-emerald-600 font-medium hover:text-emerald-700 transition disabled:opacity-50 text-sm flex items-center justify-center space-x-1 mx-auto"
                >
                  {resending ? (
                    <>
                      <FaClock className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      <span>Resend OTP</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate("/register")}
                  className="text-gray-600 hover:text-emerald-700 transition text-sm flex items-center justify-center space-x-1 mx-auto"
                >
                  <FaArrowLeft />
                  <span>Back to Register</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default EmailVerifyPage;