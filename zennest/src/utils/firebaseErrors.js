// src/utils/firebaseErrors.js
export function getAuthErrorMessage(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    
    // Password-related errors - Improved messages
    case "auth/wrong-password":
      return "Incorrect password. Please check your password and try again, or use 'Forgot password?' to reset it.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again, or use 'Forgot password?' if you need to reset it.";
    case "auth/invalid-password":
      return "Invalid password format. Please check your password and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support for assistance.";
    
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later or reset your password.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";

    // Google login errors
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completing. Please try again.";
    case "auth/cancelled-popup-request":
      return "Only one sign-in popup can be open at a time.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using another sign-in method. Please try a different method.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked by your browser. Please allow popups and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google sign-in.";

    // Email verification
    case "auth/email-not-verified":
      return "Please verify your email before logging in. Check your inbox for the verification link.";

    default:
      // Handle non-Firebase errors (like our custom email verification error)
      if (code && code.includes && code.includes("email")) {
        return "Please verify your email before logging in.";
      }
      // Check if it's a credential-related error
      if (code && (code.includes("credential") || code.includes("password") || code.includes("invalid"))) {
        return "Invalid email or password. Please check your credentials and try again, or use 'Forgot password?' to reset it.";
      }
      return "Something went wrong. Please try again.";
  }
}