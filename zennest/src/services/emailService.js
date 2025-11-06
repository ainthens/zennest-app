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
    console.log('🔧 EmailJS Configuration Check:', {
      serviceId: emailjsConfig.serviceId,
      templateId: emailjsConfig.templateId,
      publicKey: emailjsConfig.publicKey ? '✅ Set' : '❌ Missing'
    });

    // Calculate expiration time (15 minutes from now)
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000);
    const formattedTime = expirationTime.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Parameters for the beautiful new template
    // NOTE: The regular template likely uses 'user_email' as the recipient field
    // Make sure your EmailJS service "To Email" is mapped to 'user_email'
    const templateParams = {
      // User information (EmailJS service should map 'user_email' to "To Email")
      user_name: userName || userEmail.split('@')[0],
      user_email: userEmail,  // This is likely mapped to "To Email" in your service
      
      // OTP information
      otp_code: otp,                    // The 6-digit OTP code
      expiry_time: formattedTime,       // Formatted expiration time
      
      // App information
      app_name: 'Zennest',
      app_link: window.location.origin + '/verify-email',
      website_link: window.location.origin,
      
      // Additional
      current_year: new Date().getFullYear(),
    };

    console.log('📧 Sending beautiful email with parameters:', {
      user_name: templateParams.user_name,
      user_email: templateParams.user_email,
      otp_code: templateParams.otp_code,
      expiry_time: templateParams.expiry_time
    });

    const result = await emailjs.send(
      emailjsConfig.serviceId,
      templateParams.templateId || emailjsConfig.templateId, // Allow override
      templateParams,
      emailjsConfig.publicKey
    );

    console.log('✅ Beautiful email sent successfully!', result.status, result.text);

    // Store OTP with timestamp (valid for 15 minutes)
    otpStorage.set(userEmail, {
      otp: otp,
      timestamp: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    return { success: true, result };
  } catch (error) {
    console.error('❌ Email sending failed:', {
      status: error.status,
      text: error.text,
      message: error.message
    });
    
    return { 
      success: false, 
      error: `Failed to send verification email: ${error.text || 'Please try again.'}` 
    };
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
    otpStorage.delete(userEmail);
    return { success: true };
  }

  return { success: false, error: 'Invalid OTP. Please check and try again.' };
};

// Send host registration OTP email
export const sendHostVerificationEmail = async (userEmail, otp, userName = '') => {
  try {
    // Validate email
    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
      console.error('❌ Invalid email address:', userEmail);
      return { 
        success: false, 
        error: 'Invalid email address. Please check your email and try again.' 
      };
    }

    // Validate template configuration
    if (!emailjsConfig.hostTemplateId || emailjsConfig.hostTemplateId === 'template_xxxxx') {
      console.error('❌ Host template ID not configured');
      return { 
        success: false, 
        error: 'Email template not configured. Please contact support.' 
      };
    }

    console.log('🔧 Sending Host Registration OTP Email:', {
      userEmail,
      userName,
      otp,
      serviceId: emailjsConfig.serviceId,
      templateId: emailjsConfig.hostTemplateId
    });

    // Calculate expiration time (15 minutes from now)
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000);
    const formattedTime = expirationTime.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Parameters for host registration template
    // IMPORTANT: EmailJS template must have recipient field mapped in EmailJS service settings
    // Common field names: to_email, user_email, email, reply_to
    // Make sure your EmailJS service "To Email" field is mapped to one of these
    const templateParams = {
      to_email: userEmail,      // Primary recipient field (check EmailJS service mapping)
      user_email: userEmail,    // Backup recipient field
      email: userEmail,         // Another common recipient field name
      user_name: userName || userEmail.split('@')[0],
      otp_code: otp,
      expiry_time: formattedTime,
      app_name: 'Zennest',
      app_link: window.location.origin + '/host/verify-email',
      website_link: window.location.origin,
      current_year: new Date().getFullYear(),
    };

    console.log('📧 Sending host verification email with parameters:', {
      to_email: templateParams.to_email,
      user_name: templateParams.user_name,
      user_email: templateParams.user_email,
      otp_code: templateParams.otp_code
    });

    const result = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.hostTemplateId, // Use host-specific template
      templateParams,
      emailjsConfig.publicKey
    );

    console.log('✅ Host verification email sent successfully!', result.status, result.text);

    // Store OTP with timestamp (valid for 15 minutes)
    otpStorage.set(userEmail, {
      otp: otp,
      timestamp: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    return { success: true, result };
  } catch (error) {
    console.error('❌ Host email sending failed:', {
      status: error.status,
      text: error.text,
      message: error.message
    });
    
    return { 
      success: false, 
      error: `Failed to send verification email: ${error.text || 'Please try again.'}` 
    };
  }
};

// Resend OTP
export const resendOTP = async (userEmail, userName = '', isHost = false) => {
  const newOTP = generateOTP();
  if (isHost) {
    return await sendHostVerificationEmail(userEmail, newOTP, userName);
  }
  return await sendVerificationEmail(userEmail, newOTP, userName);
};

// Initialize EmailJS
export const initEmailJS = () => {
  try {
    if (!emailjsConfig.publicKey) {
      console.error('❌ EmailJS public key is missing');
      return false;
    }
    
    emailjs.init(emailjsConfig.publicKey);
    console.log('✅ EmailJS initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ EmailJS initialization failed:', error);
    return false;
  }
};