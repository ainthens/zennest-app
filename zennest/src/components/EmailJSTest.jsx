// src/components/EmailTest.jsx (temporary test component)
import React from 'react';
import { sendVerificationEmail, initEmailJS } from '../services/emailService';

const EmailTest = () => {
  const testEmailSending = async () => {
    console.log('🧪 Testing email service...');
    
    // Test initialization
    const initResult = initEmailJS();
    console.log('EmailJS Init:', initResult ? '✅ Success' : '❌ Failed');
    
    // Test email sending with a real email
    const testEmail = 'your-real-email@gmail.com'; // Use a real email for testing
    const testOTP = '123456';
    const testName = 'Test User';
    
    console.log('Sending test email to:', testEmail);
    
    const result = await sendVerificationEmail(testEmail, testOTP, testName);
    
    if (result.success) {
      alert('✅ Email sent successfully! Check your inbox.');
    } else {
      alert(`❌ Failed: ${result.error}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Email Service Test</h3>
      <button 
        onClick={testEmailSending}
        style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Test Email Service
      </button>
    </div>
  );
};

export default EmailTest;