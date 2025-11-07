// src/pages/HostListingForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createListing, updateListing } from '../services/firestoreService';
import { uploadImageToCloudinary } from '../config/cloudinary';
import useAuth from '../hooks/useAuth';
import {
  FaHome,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaImage,
  FaSave,
  FaEye,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt
} from 'react-icons/fa';

const HostListingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [progress, setProgress] = useState(100);
  const [successProgress, setSuccessProgress] = useState(100);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'home',
    description: '',
    location: '',
    rate: '',
    discount: '',
    promo: '',
    images: [],
    status: 'draft',
    bedrooms: '',
    bathrooms: '',
    guests: '',
    amenities: [],
    unavailableDates: []
  });
  
  // Calendar state for availability management
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isEdit && id) {
      fetchListing();
    }
  }, [id, isEdit]);

  // Auto-hide error notification after 5 seconds with progress animation
  useEffect(() => {
    if (error) {
      setShowErrorNotification(true);
      setProgress(100);
      
      // Animate progress bar
      const duration = 5000; // 5 seconds
      const interval = 16; // ~60fps
      const decrement = (100 / duration) * interval;
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const next = prev - decrement;
          return next <= 0 ? 0 : next;
        });
      }, interval);

      const timer = setTimeout(() => {
        setShowErrorNotification(false);
        setTimeout(() => {
          setError("");
          setProgress(100);
        }, 300);
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [error]);

  // Auto-hide success notification after 5 seconds with progress animation
  useEffect(() => {
    if (success) {
      setShowSuccessNotification(true);
      setSuccessProgress(100);
      
      // Animate progress bar
      const duration = 5000; // 5 seconds
      const interval = 16; // ~60fps
      const decrement = (100 / duration) * interval;
      
      const progressInterval = setInterval(() => {
        setSuccessProgress((prev) => {
          const next = prev - decrement;
          return next <= 0 ? 0 : next;
        });
      }, interval);

      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
        setTimeout(() => {
          setSuccess("");
          setSuccessProgress(100);
        }, 300);
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [success]);

  // Check if form data has changed from original (for edit mode)
  const hasChanges = () => {
    if (!isEdit || !originalData) return true; // For new listings, always allow submit
    
    // Compare all fields
    const normalizedFormData = {
      title: (formData.title || '').trim(),
      category: formData.category || 'home',
      description: (formData.description || '').trim(),
      location: (formData.location || '').trim(),
      rate: formData.rate || '',
      discount: formData.discount || '',
      promo: (formData.promo || '').trim(),
      bedrooms: formData.bedrooms || '',
      bathrooms: formData.bathrooms || '',
      guests: formData.guests || '',
      images: formData.images || [],
      amenities: formData.amenities || [],
      unavailableDates: formData.unavailableDates || []
    };

    const normalizedOriginal = {
      title: (originalData.title || '').trim(),
      category: originalData.category || 'home',
      description: (originalData.description || '').trim(),
      location: (originalData.location || '').trim(),
      rate: originalData.rate || '',
      discount: originalData.discount || '',
      promo: (originalData.promo || '').trim(),
      bedrooms: originalData.bedrooms || '',
      bathrooms: originalData.bathrooms || '',
      guests: originalData.guests || '',
      images: originalData.images || [],
      amenities: originalData.amenities || [],
      unavailableDates: originalData.unavailableDates || []
    };

    // Deep compare objects
    return JSON.stringify(normalizedFormData) !== JSON.stringify(normalizedOriginal);
  };

  const fetchListing = async () => {
    try {
      const listingRef = doc(db, 'listings', id);
      const listingSnap = await getDoc(listingRef);
      if (listingSnap.exists()) {
        const data = listingSnap.data();
        
        // Convert unavailableDates from Firestore Timestamps to date strings
        let unavailableDates = [];
        if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
          unavailableDates = data.unavailableDates.map(date => {
            if (date?.toDate) {
              return date.toDate().toISOString().split('T')[0];
            } else if (date instanceof Date) {
              return date.toISOString().split('T')[0];
            } else if (typeof date === 'string') {
              return date;
            }
            return null;
          }).filter(Boolean);
        }
        
        const formattedData = {
          title: data.title || '',
          category: data.category || 'home',
          description: data.description || '',
          location: data.location || '',
          rate: data.rate || '',
          discount: data.discount || '',
          promo: data.promo || '',
          images: data.images || [],
          status: data.status || 'draft',
          bedrooms: data.bedrooms || '',
          bathrooms: data.bathrooms || '',
          guests: data.guests || '',
          amenities: data.amenities || [],
          unavailableDates: unavailableDates
        };
        setFormData(formattedData);
        // Store original data for comparison
        setOriginalData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const inputType = e.target.type;
    
    // For number inputs, only allow numeric values (including decimals for bathrooms)
    if (inputType === 'number') {
      // Allow empty string for clearing the field
      if (value === '' || value === null) {
        setFormData(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }
      
      // For bedrooms and guests (integer only), strip any non-digit characters
      if (name === 'bedrooms' || name === 'guests') {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue !== value) {
          // If value was changed, update with cleaned value
          setFormData(prev => ({
            ...prev,
            [name]: numericValue
          }));
          return;
        }
      }
      
      // For bathrooms (can have decimals), allow numbers and one decimal point
      if (name === 'bathrooms') {
        const numericValue = value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, ''); // Remove multiple decimal points
        if (numericValue !== value) {
          setFormData(prev => ({
            ...prev,
            [name]: numericValue
          }));
          return;
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    
    try {
      console.log(`Uploading ${files.length} image(s) to Cloudinary...`);
      
      const uploadPromises = files.map(async (file) => {
        console.log(`Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        const result = await uploadImageToCloudinary(file);
        if (!result.success) {
          console.error(`Failed to upload ${file.name}:`, result.error);
        }
        return result;
      });
      
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results
        .filter(r => r.success)
        .map(r => r.url);
      
      const failedUploads = results.filter(r => !r.success);

      if (successfulUploads.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...successfulUploads]
        }));
        console.log(`✅ Successfully uploaded ${successfulUploads.length} image(s)`);
        
        if (failedUploads.length > 0) {
          const failedErrors = failedUploads.map(r => r.error).filter(Boolean).join(', ');
          setError(prev => {
            const message = `${failedUploads.length} image(s) failed to upload. ${failedErrors}`;
            return prev ? `${prev}\n${message}` : message;
          });
        }
      } else {
        const allErrors = failedUploads.map(r => r.error).filter(Boolean).join(', ');
        setError(`All images failed to upload. ${allErrors || 'Please check your Cloudinary configuration.'}`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(`Failed to upload images: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      // Clear file input
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Check if user is authenticated
    if (!user || !user.uid) {
      setError('You must be logged in to create a listing');
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title for your listing');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description for your listing');
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Please enter a location for your listing');
      setLoading(false);
      return;
    }
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      setError('Please enter a valid rate per night');
      setLoading(false);
      return;
    }

    try {
      // Clean up the data - remove empty strings and convert to proper types
      // Convert unavailableDates to Firestore Timestamps
      const unavailableDatesTimestamps = (formData.unavailableDates || []).map(dateStr => {
        const date = new Date(dateStr);
        return Timestamp.fromDate(date);
      });
      
      const listingData = {
        title: formData.title.trim(),
        category: formData.category || 'home',
        description: formData.description.trim(),
        location: formData.location.trim(),
        hostId: user.uid,
        rate: parseFloat(formData.rate) || 0,
        discount: parseFloat(formData.discount) || 0,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : 0,
        guests: formData.guests ? parseInt(formData.guests) : 0,
        images: formData.images || [],
        promo: formData.promo?.trim() || '',
        amenities: formData.amenities || [],
        unavailableDates: unavailableDatesTimestamps,
        status: publish ? 'published' : 'draft' // Explicitly set to 'draft' when not publishing
      };

      console.log('Saving listing with data:', listingData);
      console.log('User ID:', user.uid);

      let result;
      if (isEdit) {
        console.log('Updating listing:', id);
        result = await updateListing(id, listingData);
        console.log('Update result:', result);
        if (!result || !result.success) {
          throw new Error(result?.error || 'Update failed - no success response');
        }
        setSuccess(publish ? 'Listing published successfully!' : 'Listing saved as draft!');
      } else {
        console.log('Creating new listing...');
        result = await createListing(listingData);
        console.log('Create result:', result);
        if (!result || !result.success) {
          throw new Error(result?.error || 'Creation failed - no success response');
        }
        setSuccess(publish ? 'Listing created and published successfully!' : 'Listing saved as draft!');
      }

      // Log for debugging
      console.log('Listing saved successfully with status:', listingData.status);
      console.log('Listing ID:', result.id);
      
      setLoading(false);

      // Don't navigate immediately - let success notification show
      // User will see the notification and can navigate manually or wait for auto-navigation
      if (isEdit) {
        // For edits, update original data to reflect current state
        setOriginalData({
          title: listingData.title,
          category: listingData.category,
          description: listingData.description,
          location: listingData.location,
          rate: listingData.rate.toString(),
          discount: listingData.discount.toString(),
          promo: listingData.promo,
          bedrooms: listingData.bedrooms.toString(),
          bathrooms: listingData.bathrooms.toString(),
          guests: listingData.guests.toString(),
          images: listingData.images,
          amenities: listingData.amenities,
          unavailableDates: formData.unavailableDates
        });
      }
      
      // Auto-navigate after 3 seconds (giving time to see the success notification)
      setTimeout(() => {
        navigate('/host/listings', { state: { refresh: true } });
      }, 3000);
    } catch (error) {
      console.error('Error saving listing:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Extract more detailed error message
      let errorMessage = 'Failed to save listing. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'Permission denied. Please check your account status.';
            break;
          case 'unavailable':
            errorMessage = 'Service unavailable. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = `Error: ${error.code}`;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const categories = [
    { value: 'home', label: 'Home', icon: FaHome },
    { value: 'experience', label: 'Experience', icon: FaStar },
    { value: 'service', label: 'Service', icon: FaClock }
  ];

  // Calendar helper functions for availability
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateUnavailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return formData.unavailableDates.includes(dateStr);
  };

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const toggleDateAvailability = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFormData(prev => {
      const currentDates = prev.unavailableDates || [];
      if (currentDates.includes(dateStr)) {
        return {
          ...prev,
          unavailableDates: currentDates.filter(d => d !== dateStr)
        };
      } else {
        return {
          ...prev,
          unavailableDates: [...currentDates, dateStr].sort()
        };
      }
    });
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (prevMonthDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prevMonthDate);
    }
  };

  const renderAvailabilityCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isUnavailable = isDateUnavailable(date);
      const isPast = isDateInPast(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && toggleDateAvailability(date)}
          disabled={isPast}
          className={`
            aspect-square p-2 text-sm font-medium rounded-lg transition-all relative
            ${isPast 
              ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
              : isUnavailable
              ? 'bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer border-2 border-red-400'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer border-2 border-transparent hover:border-emerald-300'
            }
          `}
          title={isPast ? 'Cannot select past dates' : isUnavailable ? 'Click to make available' : 'Click to mark unavailable'}
        >
          {day}
          {isUnavailable && (
            <div className="absolute inset-0 flex items-center justify-center">
              <FaTimes className="w-3 h-3 text-red-600" />
            </div>
          )}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={prevMonth}
            disabled={currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FaChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h3 className="text-lg font-bold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {days}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-50 border-2 border-emerald-300" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-400 relative">
              <FaTimes className="w-2 h-2 text-red-600 absolute inset-0 m-auto" />
            </div>
            <span className="text-gray-600">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-50" />
            <span className="text-gray-600">Past dates</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, unavailableDates: [] }))}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={() => setShowAvailabilityCalendar(false)}
            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Edit Listing' : 'Create New Listing'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update your listing details' : 'Add a new property, experience, or service'}
          </p>
        </div>
        <button
          onClick={() => navigate('/host/listings')}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Listings
        </button>
      </div>

      {/* Success Notification - Same style as Login page */}
      <AnimatePresence>
        {showSuccessNotification && success && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.4 
            }}
            className="fixed top-4 right-4 z-50 w-full max-w-sm"
          >
            <div className="relative bg-white rounded-xl shadow-2xl border-l-4 border-emerald-500 overflow-hidden">
              {/* Progress Bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-1.5 bg-emerald-500"
                initial={{ width: "100%" }}
                animate={{ width: `${successProgress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
              
              <div className="px-5 py-4 flex items-start gap-3">
                {/* Success Icon */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                
                {/* Message */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-medium text-gray-900 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {success}
                  </p>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowSuccessNotification(false);
                    setTimeout(() => {
                      setSuccess("");
                      setSuccessProgress(100);
                    }, 300);
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                  aria-label="Close notification"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification - Same style as Login page */}
      <AnimatePresence>
        {showErrorNotification && error && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.4 
            }}
            className="fixed top-4 right-4 z-50 w-full max-w-sm"
          >
            <div className="relative bg-white rounded-xl shadow-2xl border-l-4 border-red-500 overflow-hidden">
              {/* Progress Bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-1.5 bg-red-500"
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
              
              <div className="px-5 py-4 flex items-start gap-3">
                {/* Error Icon */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                
                {/* Message */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-medium text-gray-900 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {error}
                  </p>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowErrorNotification(false);
                    setTimeout(() => {
                      setError("");
                      setProgress(100);
                    }, 300);
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                  aria-label="Close notification"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  className={`
                    p-4 border-2 rounded-lg transition-all
                    ${formData.category === cat.value
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`text-2xl mx-auto mb-2 ${
                    formData.category === cat.value ? 'text-emerald-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-medium ${
                    formData.category === cat.value ? 'text-emerald-700' : 'text-gray-700'
                  }`}>
                    {cat.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter listing title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter location (e.g., Manila, Philippines)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          {/* Google Maps Preview */}
          {formData.location && formData.location.trim() && (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <div className="relative w-full h-64 bg-gray-100">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(formData.location)}&output=embed`}
                  title="Location preview"
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            placeholder="Describe your listing in detail..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Property Details - Home */}
        {formData.category === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                onKeyDown={(e) => {
                  // Prevent non-numeric keys except: backspace, delete, tab, escape, enter, and arrow keys
                  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                  const isNumber = /[0-9]/.test(e.key);
                  const isAllowedKey = allowedKeys.includes(e.key) || (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()));
                  
                  if (!isNumber && !isAllowedKey) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const paste = (e.clipboardData || window.clipboardData).getData('text');
                  const numericValue = paste.replace(/[^0-9]/g, '');
                  if (numericValue) {
                    setFormData(prev => ({
                      ...prev,
                      bedrooms: numericValue
                    }));
                  }
                }}
                min="0"
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                step="0.5"
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Guests
              </label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                placeholder="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Details for Services and Experiences */}
        {(formData.category === 'service' || formData.category === 'experience') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.category === 'experience' ? 'Max Participants' : 'Max Capacity'}
              </label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                placeholder="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.category === 'experience' ? 'Duration' : 'Service Duration'}
              </label>
              <input
                type="text"
                name="promo"
                value={formData.promo}
                onChange={handleChange}
                placeholder={formData.category === 'experience' ? 'e.g., 2.5 hours · Guided' : 'e.g., 1 hour session'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.category === 'experience' 
                  ? 'Duration of the experience (e.g., "2 hours", "Full day")'
                  : 'How long the service takes (e.g., "1 hour", "per session")'}
              </p>
            </div>
          </div>
        )}

        {/* Rate and Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.category === 'home' 
                ? 'Rate per Night (₱) *'
                : formData.category === 'service'
                ? 'Price (₱) *'
                : 'Price per Person (₱) *'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₱</span>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.category === 'home' 
                ? 'Price per night'
                : formData.category === 'service'
                ? 'Price for the service'
                : 'Price per person for this experience'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Optional discount percentage</p>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
            <span className="text-xs text-gray-500 ml-2">(Upload multiple images)</span>
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
                uploading 
                  ? 'border-emerald-300 bg-emerald-50 cursor-wait' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-emerald-400 cursor-pointer'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
                      <p className="mb-2 text-sm text-emerald-600 font-semibold">Uploading images...</p>
                      <p className="text-xs text-gray-500">Please wait</p>
                    </>
                  ) : (
                    <>
                      <FaImage className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB each</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>


            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Availability Calendar - Only for home listings */}
        {formData.category === 'home' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability Calendar
              <span className="text-xs text-gray-500 ml-2">(Mark dates as unavailable)</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAvailabilityCalendar(!showAvailabilityCalendar)}
                className="w-full border-2 border-gray-300 rounded-lg p-4 hover:border-emerald-500 focus:border-emerald-500 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-emerald-600 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formData.unavailableDates.length === 0 
                          ? 'All dates available' 
                          : `${formData.unavailableDates.length} date${formData.unavailableDates.length === 1 ? '' : 's'} marked unavailable`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Click to manage availability
                      </p>
                    </div>
                  </div>
                  <FaChevronRight className={`text-gray-400 transition-transform ${showAvailabilityCalendar ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {/* Calendar Dropdown */}
              <AnimatePresence>
                {showAvailabilityCalendar && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 z-50"
                  >
                    {renderAvailabilityCalendar()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {formData.unavailableDates.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2 font-semibold">Unavailable dates:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.unavailableDates.slice(0, 5).map((dateStr) => (
                    <span
                      key={dateStr}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium"
                    >
                      {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            unavailableDates: prev.unavailableDates.filter(d => d !== dateStr)
                          }));
                        }}
                        className="hover:text-red-900"
                      >
                        <FaTimes className="w-2 h-2" />
                      </button>
                    </span>
                  ))}
                  {formData.unavailableDates.length > 5 && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                      +{formData.unavailableDates.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || (isEdit && !hasChanges())}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              (isEdit && !hasChanges())
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
            }`}
            title={isEdit && !hasChanges() ? 'No changes to save' : ''}
          >
            <FaSave />
            {loading ? 'Saving...' : isEdit ? 'Update Draft' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading || (isEdit && !hasChanges())}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              (isEdit && !hasChanges())
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
            }`}
            title={isEdit && !hasChanges() ? 'No changes to publish' : ''}
          >
            <FaEye />
            {loading ? 'Publishing...' : isEdit ? 'Update & Publish' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HostListingForm;

