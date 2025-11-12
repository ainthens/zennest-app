import React from 'react';
import { motion } from 'framer-motion';
import {
  FaExclamationTriangle,
  FaHome,
  FaRedo,
  FaChevronLeft,
  FaInfoCircle
} from 'react-icons/fa';

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 RouteErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            {/* Main Error Card */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-200 overflow-hidden">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-600 px-6 sm:px-8 py-8 text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex items-center gap-4 mb-4"
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FaExclamationTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Oops!</h1>
                    <p className="text-red-100 text-sm">Something went wrong</p>
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="px-6 sm:px-8 py-8">
                {/* Error Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We encountered an unexpected error while loading this page. 
                    This might be temporary. Try one of the options below to continue.
                  </p>
                  
                  {/* Error Details Box */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-gray-700 break-words">
                          {this.state.error?.toString() || 'Unknown error'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stack Trace (Development only) */}
                  {import.meta.env.DEV && this.state.errorInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: this.state.showDetails ? 1 : 0, 
                        height: this.state.showDetails ? 'auto' : 0 
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <details 
                        open={this.state.showDetails}
                        onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                        className="cursor-pointer"
                      >
                        <summary className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors py-2 px-3 bg-gray-100 rounded-lg select-none">
                          {this.state.showDetails ? '▼' : '▶'} Technical Details (Development)
                        </summary>
                        <div className="mt-3 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-xs overflow-auto max-h-64 whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </details>
                    </motion.div>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <button
                    onClick={this.handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <FaRedo className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>

                  <button
                    onClick={this.handleReload}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <FaRedo className="w-4 h-4" />
                    <span>Reload Page</span>
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <FaHome className="w-4 h-4" />
                    <span>Go Home</span>
                  </button>

                  <button
                    onClick={this.handleGoBack}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                    <span>Go Back</span>
                  </button>
                </motion.div>

                {/* Support Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500"
                >
                  <p>
                    If the problem persists, please <a 
                      href="mailto:support@zennest.com" 
                      className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      contact support
                    </a>
                  </p>
                  <p className="mt-2 text-gray-400">
                    Error ID: {Date.now().toString(36).toUpperCase()}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-red-200 rounded-full opacity-20 blur-xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;