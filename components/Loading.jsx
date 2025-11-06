// src/components/Loading.jsx
import React from 'react';
import { motion } from 'framer-motion';
import zennestLoadingIcon from '../assets/zennest-loading-icon.svg';

const Loading = ({ message = 'Loading...', size = 'medium', fullScreen = false, className = '' }) => {                                                          
  const logoSizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const circleSizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-28 h-28'
  };

  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <div className="mb-4 flex justify-center items-center relative" style={{ width: circleSizeClasses[size], height: circleSizeClasses[size] }}>
          {/* Spinning circle outline behind the logo */}
          <div className={`${circleSizeClasses[size]} absolute top-0 left-0 right-0 bottom-0 m-auto`}>
            <motion.div
              className="w-full h-full border-2 border-emerald-600 rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{
                rotate: {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                }
              }}
            />
          </div>
          {/* Static logo - no animations */}
          <img
            src={zennestLoadingIcon}
            alt="Loading"
            className={`${logoSizeClasses[size]} relative z-10`}
          />
        </div>
        {message && (
          <p className="text-gray-600 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
