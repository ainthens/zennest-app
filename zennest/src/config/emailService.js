// src/services/emailService.js
import emailjs from '@emailjs/browser';
import { emailjsConfig } from '../config/emailjs';

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use a database)
const otpStorage = new Map();

export const sendVerificationEmail = async (userEmail, otp, userName = '') => {
  try {
    console.log('🔧 EmailJS Configuration:', {
      serviceId: emailjsConfig.serviceId,
      templateId: emailjsConfig.templateId,
      publicKey: emailjsConfig.publicKey ? '✅ Set' : '❌ Missing'
    });

    // Use the EXACT parameter names that match your EmailJS template
    const templateParams = {
      user_email: userEmail, // Changed from to_email to user_email
      user_name: userName || userEmail.split('@')[0], // Changed from to_name to user_name
      otp_code: otp, // Changed from verification_otp to otp_code
      from_name: 'Zennest',
      reply_to: 'noreply@zennest.com',
      site_url: window.location.origin,
      current_year: new Date().getFullYear(),
    };

    console.log('📧 Sending email with params:', templateParams);

    const result = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams,
      emailjsConfig.publicKey
    );

    console.log('✅ Email sent successfully:', result);

    // Store OTP with timestamp (valid for 10 minutes)
    otpStorage.set(userEmail, {
      otp: otp,
      timestamp: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    return { success: true, result };
  } catch (error) {
    console.error('❌ Failed to send email - Full error:', error);
    console.error('❌ Error details:', {
      code: error.code,
      text: error.text,
      status: error.status,
      message: error.message
    });
    
    // More specific error messages
    if (error.status === 400) {
      return { success: false, error: 'Invalid template or service configuration' };
    } else if (error.status === 401) {
      return { success: false, error: 'Invalid EmailJS public key' };
    } else if (error.status === 403) {
      return { success: false, error: 'EmailJS service not authorized' };
    } else if (error.status === 422) {
      return { success: false, error: 'Template parameter mismatch. Check parameter names.' };
    } else {
      return { success: false, error: `Email service error: ${error.text || error.message}` };
    }
  }
};

// Verify OTP
export const verifyOTP = (userEmail, enteredOTP) => {
  const storedData = otpStorage.get(userEmail);
  
  if (!storedData) {
    return { success: false, error: 'OTP not found or expired. Please request a new one.' };
  }

  if (Date.now() > storedData.expiresAt) {
    otpStorage.delete(userEmail);
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (storedData.otp === enteredOTP) {
    otpStorage.delete(userEmail); // Remove OTP after successful verification
    return { success: true };
  }

  return { success: false, error: 'Invalid OTP. Please check and try again.' };
};

// Resend OTP
export const resendOTP = async (userEmail, userName = '') => {
  const newOTP = generateOTP();
  return await sendVerificationEmail(userEmail, newOTP, userName);
};

// Initialize EmailJS
export const initEmailJS = () => {
  try {
    emailjs.init(emailjsConfig.publicKey);
    console.log('✅ EmailJS initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ EmailJS initialization failed:', error);
    return false;
  }
};