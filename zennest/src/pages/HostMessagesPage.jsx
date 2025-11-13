// src/pages/HostMessagesPage.jsx
// This is a placeholder page. The actual implementation is in HostMessages.jsx
// This file is kept for routing compatibility
// Note: Host pages are rendered within HostDashboard layout, so no header is needed here
import React from 'react';

const HostMessagesPage = () => {
  // This page is rendered within HostDashboard layout which has its own sidebar
  // No header component needed as it's for guest accounts
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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