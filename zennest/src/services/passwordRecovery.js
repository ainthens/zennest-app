// src/services/passwordRecovery.js
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import emailjs from '@emailjs/browser';
import { emailjsConfig } from '../config/emailjs';

/**
 * Send password reset email using Firebase Auth (recommended method)
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent successfully!' };
  } catch (error) {
    console.error('Password reset error:', error);
    let errorMessage = 'Failed to send password reset email.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please try again later.';
        break;
      default:
        errorMessage = error.message || 'Failed to send password reset email.';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Send custom password recovery email using EmailJS
 * This provides a custom branded email experience
 * 
 * Note: Firebase generates its own secure reset link automatically.
 * The reset_link in EmailJS template is informational only.
 * Users should use the Firebase-generated link from Firebase's email.
 */
export const sendPasswordRecoveryEmail = async (email) => {
  try {
    // Always send Firebase reset email first (this contains the actual working reset link)
    const firebaseResult = await sendPasswordReset(email);
    
    if (!firebaseResult.success) {
      return firebaseResult; // Return Firebase error if it fails
    }

    // If EmailJS template is configured, send custom branded email as well
    if (emailjsConfig.passwordRecoveryTemplateId && emailjsConfig.passwordRecoveryTemplateId.trim() !== '') {
      try {
        const userName = email.split('@')[0];
        
        // Note: Firebase reset link is generated automatically and sent via Firebase email
        // This link is just for display purposes in the EmailJS template
        const informationalLink = `${window.location.origin}/reset-password`;
        
        const templateParams = {
          user_email: email,
          user_name: userName,
          reset_link: informationalLink, // Informational only - Firebase link is in Firebase email
          from_name: 'Zennest',
          reply_to: 'noreply@zennest.com',
          site_url: window.location.origin,
          current_year: new Date().getFullYear(),
          support_email: 'support@zennest.com',
          note: 'Please use the reset link provided in the Firebase email that was also sent to you.',
        };

        console.log('📧 Sending branded password recovery email via EmailJS...');

        await emailjs.send(
          emailjsConfig.serviceId,
          emailjsConfig.passwordRecoveryTemplateId,
          templateParams,
          emailjsConfig.publicKey
        );

        console.log('✅ Branded password recovery email sent successfully');
      } catch (emailjsError) {
        // EmailJS failure is non-critical - Firebase email was already sent
        console.warn('⚠️ EmailJS email failed, but Firebase reset email was sent:', emailjsError);
      }
    }

    return { success: true, message: 'Password recovery email sent! Please check your inbox for the reset link.' };
  } catch (error) {
    console.error('❌ Password recovery failed:', error);
    return { success: false, error: error.message || 'Failed to send password recovery email.' };
  }
};

/**
 * Verify reset token and allow password reset
 * This would typically be handled by Firebase Auth when user clicks the reset link
 */
export const verifyResetToken = async (actionCode) => {
  // This is handled automatically by Firebase Auth
  // When user clicks the reset link, Firebase handles verification
  return { success: true };
};

