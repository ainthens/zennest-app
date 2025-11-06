// src/pages/UserFavorites.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserFavorites, removeFromFavorites } from '../services/firestoreService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import Loading from '../components/Loading'; // Adjust path if needed
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaStar, FaTrash } from 'react-icons/fa';

const UserFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      if (!user?.uid) {
        setFavorites([]);
        return;
      }

      const result = await getUserFavorites(user.uid);
      if (result.success && result.data) {
        const listingIds = result.data;
        
        // Fetch full listing details for each favorite
        const listingPromises = listingIds.map(async (listingId) => {
          try {
            const listingRef = doc(db, 'listings', listingId);
            const listingSnap = await getDoc(listingRef);
            if (listingSnap.exists()) {
              const data = listingSnap.data();
              return {
                id: listingSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching listing ${listingId}:`, error);
            return null;
          }
        });

        const listings = await Promise.all(listingPromises);
        const validListings = listings.filter(Boolean);
        setFavorites(validListings);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId, e) => {
    e.stopPropagation();
    if (!user?.uid) return;

    setRemovingId(listingId);
    try {
      const result = await removeFromFavorites(user.uid, listingId);
      if (result.success) {
        // Remove from local state
        setFavorites(prev => prev.filter(fav => fav.id !== listingId));
      } else {
        alert('Failed to remove from favorites. Please try again.');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewDetails = (listing) => {
    navigate(`/listing/${listing.id}`);
  };

  if (!user) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-6">Sign in to view and manage your favorites</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SettingsHeader />
      <div className="min-h-screen bg-slate-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length > 0 
              ? `You have ${favorites.length} saved ${favorites.length === 1 ? 'favorite' : 'favorites'}`
              : 'Your saved favorites will appear here'}
          </p>
        </div>

        {loading ? (
          <Loading message="Loading favorites..." size="medium" fullScreen={false} />
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <FaRegHeart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">Start exploring and save your favorite listings!</p>
            <button
              onClick={() => navigate('/homestays')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Explore Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleViewDetails(listing)}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 group cursor-pointer h-full flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
                  )}
                  
                  {/* Remove Favorite Button */}
                  <button
                    onClick={(e) => handleRemoveFavorite(listing.id, e)}
                    disabled={removingId === listing.id}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-lg z-10"
                    aria-label="Remove from favorites"
                  >
                    {removingId === listing.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                    ) : (
                      <FaHeart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </button>

                  {/* Rating */}
                  {listing.rating > 0 && (
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                      <FaStar className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      <span className="text-white text-xs font-semibold">{listing.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-3 flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {listing.title || 'Untitled Listing'}
                    </h3>
                    
                    {/* Location */}
                    {listing.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <FaMapMarkerAlt className="text-emerald-600 flex-shrink-0" />
                        <span className="line-clamp-1">{listing.location}</span>
                      </div>
                    )}

                    {/* Property Details */}
                    {(listing.bedrooms || listing.bathrooms || listing.guests) && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {listing.guests > 0 && (
                          <div className="flex items-center gap-1">
                            <FaUsers className="text-emerald-600" />
                            <span>{listing.guests}</span>
                          </div>
                        )}
                        {listing.bedrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <FaBed className="text-emerald-600" />
                            <span>{listing.bedrooms}</span>
                          </div>
                        )}
                        {listing.bathrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <FaBath className="text-emerald-600" />
                            <span>{listing.bathrooms}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        {listing.discount > 0 ? (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-gray-900 text-xl">
                                ₱{((listing.rate || 0) * (1 - listing.discount / 100)).toFixed(0).toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ₱{(listing.rate || 0).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {listing.category === 'home' ? 'per night' : listing.category === 'service' ? 'per session' : 'per person'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-gray-900 text-xl">
                              ₱{(listing.rate || 0).toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {listing.category === 'home' ? 'per night' : listing.category === 'service' ? 'per session' : 'per person'}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(listing);
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>
      </>
    );
  };

export default UserFavorites;