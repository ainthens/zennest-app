// src/pages/HostMessagesPage.jsx
// This is a placeholder page. The actual implementation is in HostMessages.jsx
// This file is kept for routing compatibility
import React from 'react';
import { Navigate } from 'react-router-dom';

const HostMessagesPage = () => {
  // Redirect to the actual messages page if needed
  // Or you can import and render HostMessages here
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 sm:mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Host Messages
        </h1>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <p className="text-gray-600 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Messages content coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostMessagesPage;