// src/components/RequireVerified.jsx
import React, { useLayoutEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../config/firebase"; // Fixed import path
import { motion } from "framer-motion";
import Logo from "../assets/zennest-logo-v2.svg";

const RequireVerified = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [resending, setResending] = useState(false);

  // Hide header for this page
  useLayoutEffect(() => {
    if (location.pathname.includes("verify")) {
      document.body.classList.add("hide-header");
    }
    return () => document.body.classList.remove("hide-header");
  }, [location]);

  if (loading) {
    return (
      <section className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.emailVerified) {
    const handleResend = async () => {
      setResending(true);
      try {
        await sendEmailVerification(auth.currentUser);
        alert("Verification email resent. Please check your inbox.");
      } finally {
        setResending(false);
      }
    };

    return (
      <section className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-2xl px-10 py-12 max-w-md w-full text-center"
        >
          <img src={Logo} alt="Zennest Logo" className="h-12 mx-auto mb-6" />

          <h2 className="text-2xl font-bold text-yellow-600 mb-2">
            Email Not Verified
          </h2>
          <p className="text-gray-600 mb-6">
            We sent a verification link to{" "}
            <span className="font-medium">{user.email}</span>. Please verify
            your email to continue.
          </p>

          <button
            onClick={handleResend}
            disabled={resending}
            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend Verification Email"}
          </button>
        </motion.div>

        {/* Credits */}
        <p className="absolute bottom-3 text-xs text-gray-500">
          © Zennest {new Date().getFullYear()}
        </p>
      </section>
    );
  }

  return children;
};

export default RequireVerified;