import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheck, 
  FaHome, 
  FaUserCheck, 
  FaCreditCard, 
  FaTimes,
  FaArrowRight,
  FaStar,
  FaRocket
} from 'react-icons/fa';

const HostOnboarding = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    // Navigate to home page - safe route that won't cause redirect loops
    navigate('/', { replace: false });
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber === 2) {
      navigate('/host/register');
    } else if (stepNumber === 3) {
      navigate('/host/listings/new');
    }
  };

  const steps = [
    {
      number: 1,
      title: "Complete Profile",
      description: "Set up your host profile and verification",
      icon: FaUserCheck,
      completed: true,
      color: "emerald"
    },
    {
      number: 2,
      title: "Choose Subscription",
      description: "Select your hosting plan and payment method",
      icon: FaCreditCard,
      completed: false,
      color: "blue"
    },
    {
      number: 3,
      title: "Create First Listing",
      description: "Add your space and set availability",
      icon: FaHome,
      completed: false,
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 pt-16 sm:pt-20 pb-6 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Close Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 sm:mb-10"
        >
          <button
            onClick={handleClose}
            className="absolute -top-1 right-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Close onboarding"
          >
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="text-center max-w-2xl mx-auto pr-8 sm:pr-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg mb-3 sm:mb-4"
            >
              <FaRocket className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Become a Zennest Host
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Follow these simple steps to start hosting and earning.
              <span className="block mt-1 text-emerald-600 font-medium">Let's get you started!</span>
            </p>
          </div>
        </motion.div>

        {/* Steps Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-3 sm:space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                    className={`group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                      step.completed
                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-emerald-200 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={() => !step.completed && handleStepClick(step.number)}
                  >
                    {/* Step Number/Icon */}
                    <div className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
                      step.completed
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 scale-100'
                        : step.number === 2
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:scale-105'
                        : step.number === 3
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:scale-105'
                        : 'bg-gradient-to-br from-emerald-400 to-emerald-500 group-hover:scale-105'
                    }`}>
                      {step.completed ? (
                        <FaCheck className="text-white text-base sm:text-lg md:text-xl" />
                      ) : (
                        <Icon className="text-white text-base sm:text-lg md:text-xl" />
                      )}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {step.title}
                        </h3>
                        {step.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 text-emerald-600 flex-shrink-0"
                          >
                            <FaStar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 sm:line-clamp-none" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {step.description}
                      </p>
                    </div>

                    {/* Action Button/Status */}
                    <div className="flex-shrink-0">
                      {step.completed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 sm:gap-1.5 bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-semibold text-xs whitespace-nowrap"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <FaCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden sm:inline">Completed</span>
                          <span className="sm:hidden">Done</span>
                        </motion.div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepClick(step.number);
                          }}
                          className={`flex items-center gap-1.5 sm:gap-2 text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 ${
                            step.number === 2
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                              : step.number === 3
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                          }`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <span>Start</span>
                          <FaArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </motion.button>
                      )}
                    </div>

                    {/* Progress Line */}
                    {index < steps.length - 1 && (
                      <div className={`absolute left-5 sm:left-6 top-[3.75rem] sm:top-[4.5rem] w-0.5 h-8 sm:h-10 ${
                        step.completed && steps[index + 1]?.completed
                          ? 'bg-emerald-400'
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-t border-gray-200 px-4 sm:px-6 md:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Ready to start earning?
                </p>
                <p className="text-[10px] sm:text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Complete all steps to unlock your hosting dashboard
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="w-full sm:w-auto px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Skip for now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HostOnboarding;