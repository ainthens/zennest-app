// src/utils/consoleManager.js
// Utility to manage console logs in production

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

/**
 * Initialize console manager to control logging based on environment
 */
export const initConsoleManager = () => {
  if (isProduction) {
    // In production, suppress non-critical logs
    console.log = () => {};
    console.debug = () => {};
    
    // Keep warnings but prefix them
    console.warn = (...args) => {
      // Filter out Firestore index warnings in production
      const message = args[0]?.toString() || '';
      if (message.includes('Firestore index') || message.includes('orderBy')) {
        return; // Suppress index warnings in production
      }
      originalConsole.warn('[Warning]', ...args);
    };
    
    // Keep errors but prefix them
    console.error = (...args) => {
      originalConsole.error('[Error]', ...args);
    };
    
    console.info = (...args) => {
      originalConsole.info('[Info]', ...args);
    };
  }
};

/**
 * Restore original console methods (useful for debugging)
 */
export const restoreConsole = () => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
};

/**
 * Custom logger that respects environment
 */
export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      originalConsole.log(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      originalConsole.warn(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors
    originalConsole.error(...args);
  },
  
  info: (...args) => {
    if (isDevelopment) {
      originalConsole.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      originalConsole.debug(...args);
    }
  }
};

export default logger;

