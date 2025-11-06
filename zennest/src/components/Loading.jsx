// src/components/Loading.jsx
import React from 'react';
import { motion } from 'framer-motion';
import zennestLoadingIcon from '../assets/zennest-loading-icon.svg';

const Loading = ({ message = 'Loading...', size = 'medium', fullScreen = false, className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const spinnerSizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-21 h-21',
    large: 'w-20 h-20'
  };

  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-4 inline-flex items-center justify-center relative"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {/* Spinning circular border */}
          <motion.div
            className={`${spinnerSizeClasses[size]} absolute inset-0 m-auto border-4 border-transparent border-t-emerald-600 border-r-emerald-600 rounded-full`}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {/* Static logo in the center */}
          <div className={`${sizeClasses[size]} flex items-center justify-center z-10 relative`}>
            <img
              src={zennestLoadingIcon}
              alt="Loading"
              className="w-16 h-16 object-contain"
            />
          </div>
        </motion.div>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-medium text-sm"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Loading;
