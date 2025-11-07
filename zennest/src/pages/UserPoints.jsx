// src/pages/UserPoints.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import SettingsHeader from '../components/SettingsHeader';
import Loading from '../components/Loading';
import { 
  FaStar, 
  FaTrophy,
  FaGift,
  FaHistory,
  FaCrown,
  FaMedal,
  FaAward,
  FaFire,
  FaChartLine,
  FaCalendarCheck,
  FaCoins
} from 'react-icons/fa';

const UserPoints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPointsData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      if (!user?.uid) {
        setPoints(null);
        setPointsHistory([]);
        return;
      }

      // Fetch points document
      const pointsRef = doc(db, 'userPoints', user.uid);
      const pointsSnap = await getDoc(pointsRef);
      
      if (pointsSnap.exists()) {
        setPoints({
          id: pointsSnap.id,
          ...pointsSnap.data()
        });
      } else {
        // Create default points structure
        setPoints({
          userId: user.uid,
          totalPoints: 0,
          currentPoints: 0,
          lifetimePoints: 0,
          tier: 'bronze',
          nextTierPoints: 1000
        });
      }

      // Fetch points history
      const historyRef = collection(db, 'pointsHistory');
      const q = query(
        historyRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));

      setPointsHistory(historyData);
    } catch (error) {
      console.error('Error fetching points data:', error);
      setPoints({ 
        totalPoints: 0, 
        currentPoints: 0, 
        lifetimePoints: 0,
        tier: 'bronze',
        nextTierPoints: 1000
      });
      setPointsHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return { 
          name: 'Platinum', 
          color: 'from-slate-400 to-slate-600',
          textColor: 'text-slate-700',
          icon: FaCrown,
          benefits: ['20% off all bookings', 'Priority support', 'Exclusive rewards', 'Free cancellation']
        };
      case 'gold':
        return { 
          name: 'Gold', 
          color: 'from-yellow-400 to-yellow-600',
          textColor: 'text-yellow-700',
          icon: FaTrophy,
          benefits: ['15% off bookings', 'Priority support', 'Special rewards', '24hr cancellation']
        };
      case 'silver':
        return { 
          name: 'Silver', 
          color: 'from-gray-300 to-gray-500',
          textColor: 'text-gray-700',
          icon: FaMedal,
          benefits: ['10% off bookings', 'Faster support', 'Bonus points', 'Early access']
        };
      default:
        return { 
          name: 'Bronze', 
          color: 'from-orange-400 to-orange-600',
          textColor: 'text-orange-700',
          icon: FaAward,
          benefits: ['5% off bookings', 'Earn points', 'Member rewards', 'Special offers']
        };
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'booking':
        return { icon: FaCalendarCheck, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'review':
        return { icon: FaStar, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'referral':
        return { icon: FaGift, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'bonus':
        return { icon: FaFire, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'redemption':
        return { icon: FaCoins, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: FaStar, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = () => {
    if (!points?.currentPoints || !points?.nextTierPoints) return 0;
    return Math.min((points.currentPoints / points.nextTierPoints) * 100, 100);
  };

  const tierInfo = getTierInfo(points?.tier);
  const TierIcon = tierInfo.icon;
  const progress = calculateProgress();

  if (!user) {
    return (
      <>
        <SettingsHeader />
        <div className="min-h-screen bg-slate-100 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <FaStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
              <p className="text-gray-600 mb-6">Sign in to view your rewards points</p>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Rewards Points</h1>
            <p className="text-gray-600">Earn points with every booking and unlock exclusive benefits</p>
          </div>

          {loading ? (
            <Loading message="Loading points..." size="medium" fullScreen={false} />
          ) : (
            <>
              {/* Points Overview Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br ${tierInfo.color} rounded-2xl shadow-xl p-8 mb-8 text-white`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <TierIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">Your Tier</p>
                      <h2 className="text-3xl font-bold">{tierInfo.name}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm font-medium mb-1">Current Points</p>
                    <h2 className="text-4xl font-bold">{(points?.currentPoints || 0).toLocaleString()}</h2>
                  </div>
                </div>

                {/* Progress to Next Tier */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/90 font-medium">Progress to Next Tier</span>
                    <span className="text-white font-semibold">
                      {points?.currentPoints || 0} / {points?.nextTierPoints || 1000}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-white rounded-full shadow-lg"
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <FaChartLine className="w-5 h-5 mb-2" />
                    <p className="text-xs text-white/80 mb-1">Lifetime Points</p>
                    <p className="text-xl font-bold">{(points?.lifetimePoints || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <FaHistory className="w-5 h-5 mb-2" />
                    <p className="text-xs text-white/80 mb-1">Total Transactions</p>
                    <p className="text-xl font-bold">{pointsHistory.length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <FaGift className="w-5 h-5 mb-2" />
                    <p className="text-xs text-white/80 mb-1">Redeemed</p>
                    <p className="text-xl font-bold">
                      {pointsHistory
                        .filter(h => h.action === 'redemption')
                        .reduce((sum, h) => sum + Math.abs(h.points || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Tier Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaTrophy className="text-emerald-600" />
                  Your {tierInfo.name} Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tierInfo.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaStar className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Points History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FaHistory className="text-emerald-600" />
                  Points History
                </h3>

                {pointsHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHistory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No history yet</h3>
                    <p className="text-gray-600 mb-6">Start earning points by booking stays!</p>
                    <button
                      onClick={() => navigate('/homestays')}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Explore Listings
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pointsHistory.map((item, index) => {
                      const iconInfo = getActionIcon(item.action);
                      const Icon = iconInfo.icon;
                      const isEarned = item.points > 0;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl ${iconInfo.bg} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-5 h-5 ${iconInfo.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 capitalize mb-1">
                                {item.action === 'booking' ? 'Booking Completed' : item.action}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">
                                {item.description || 'No description'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(item.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className={`text-2xl font-bold ${isEarned ? 'text-green-600' : 'text-red-600'}`}>
                              {isEarned ? '+' : ''}{item.points}
                            </p>
                            <p className="text-xs text-gray-500">points</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserPoints;

