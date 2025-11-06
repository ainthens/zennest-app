// src/utils/emailjsConfig.js
import emailjs from '@emailjs/browser';

export const initEmailJS = () => {
  // Replace with your actual EmailJS public key
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'p_q8TaCGGwI6hjYNY';
  
  if (publicKey && publicKey !== 'p_q8TaCGGwI6hjYNY') {
    emailjs.init(publicKey);
    console.log('EmailJS initialized');
  } else {
    console.warn('EmailJS public key not found. Email functionality may not work.');
  }
};

export default initEmailJS;