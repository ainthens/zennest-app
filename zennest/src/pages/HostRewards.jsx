// src/pages/HostRewards.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHostProfile, updateHostPoints, getHostBookings } from '../services/firestoreService';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import {
  FaGift,
  FaStar,
  FaTrophy,
  FaCoins,
  FaChartLine,
  FaCheckCircle,
  FaArrowUp,
  FaSpinner,
  FaTicketAlt
} from 'react-icons/fa';

const HostRewards = () => {
  const { user } = useAuth();
  const [hostProfile, setHostProfile] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRewardsData();
    }
  }, [user]);

  const fetchRewardsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch host profile
      const profileResult = await getHostProfile(user.uid);
      if (profileResult.success && profileResult.data) {
        setHostProfile(profileResult.data);
      } else {
        setError('Failed to load host profile');
      }

      // Fetch total earnings from bookings
      try {
        const bookingsResult = await getHostBookings(user.uid);
        const bookings = bookingsResult.data || [];
        
        // Calculate total earnings from completed bookings
        const earnings = bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total || b.totalAmount || 0), 0);
        
        setTotalEarnings(earnings);
      } catch (earningsError) {
        console.error('Error fetching earnings:', earningsError);
      }

      // Fetch points transactions
      try {
        const pointsRef = collection(db, 'pointsTransactions');
        const q = query(
          pointsRef,
          where('hostId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const history = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          history.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt
          });
        });
        setPointsHistory(history);
      } catch (queryError) {
        // If index error, try without orderBy
        if (queryError.code === 'failed-precondition') {
          const pointsRef = collection(db, 'pointsTransactions');
          const q = query(
            pointsRef,
            where('hostId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const history = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({ 
              id: doc.id, 
              ...data,
              createdAt: data.createdAt
            });
          });
          // Sort in memory
          history.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
            return dateB - dateA;
          });
          setPointsHistory(history);
        } else {
          console.error('Error fetching points history:', queryError);
        }
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      setError('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const points = hostProfile?.points || 0;

  // Calculate tier based on points
  const getTier = () => {
    if (points >= 10000) return { 
      name: 'Platinum', 
      bgGradient: 'from-purple-500 to-purple-700',
      icon: FaTrophy,
      nextTier: null,
      nextTierPoints: null
    };
    if (points >= 5000) return { 
      name: 'Gold', 
      bgGradient: 'from-yellow-500 to-yellow-700',
      icon: FaTrophy,
      nextTier: 'Platinum',
      nextTierPoints: 10000
    };
    if (points >= 2000) return { 
      name: 'Silver', 
      bgGradient: 'from-gray-400 to-gray-600',
      icon: FaStar,
      nextTier: 'Gold',
      nextTierPoints: 5000
    };
    return { 
      name: 'Bronze', 
      bgGradient: 'from-orange-500 to-orange-700',
      icon: FaStar,
      nextTier: 'Silver',
      nextTierPoints: 2000
    };
  };

  const tier = getTier();
  const TierIcon = tier.icon;

  const handleRedeemReward = async (reward) => {
    if (points < reward.points) {
      setError(`You need ${reward.points - points} more points to redeem this reward`);
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      setRedeeming(reward.points);
      setError('');
      
      // Create voucher/coupon
      const vouchersRef = collection(db, 'vouchers');
      const voucherCode = `HOST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      await addDoc(vouchersRef, {
        hostId: user.uid,
        code: voucherCode,
        type: reward.type,
        discount: reward.discount,
        discountType: reward.discountType || 'fixed',
        status: 'active',
        redeemed: false,
        redeemedAt: null,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        createdAt: serverTimestamp(),
        pointsCost: reward.points,
        description: reward.reward
      });
      
      // Deduct points
      await updateHostPoints(
        user.uid, 
        -reward.points, 
        `Redeemed: ${reward.reward}`,
        points - reward.points
      );
      
      // Refresh data
      await fetchRewardsData();
      
      setSuccess(`Successfully redeemed ${reward.reward}! Your voucher code is: ${voucherCode}`);
      setTimeout(() => setSuccess(''), 10000);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setError('Failed to redeem reward. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setRedeeming(null);
    }
  };

  const rewards = [
    { 
      points: 500, 
      reward: '₱500 Discount Voucher', 
      available: points >= 500,
      type: 'discount',
      discount: 500,
      discountType: 'fixed'
    },
    { 
      points: 1000, 
      reward: '₱1,000 Discount Voucher', 
      available: points >= 1000,
      type: 'discount',
      discount: 1000,
      discountType: 'fixed'
    },
    { 
      points: 2000, 
      reward: '10% Off Next Booking', 
      available: points >= 2000,
      type: 'discount',
      discount: 10,
      discountType: 'percentage'
    },
    { 
      points: 2500, 
      reward: '₱2,500 Discount Voucher', 
      available: points >= 2500,
      type: 'discount',
      discount: 2500,
      discountType: 'fixed'
    },
    { 
      points: 5000, 
      reward: '₱5,000 Discount Voucher', 
      available: points >= 5000,
      type: 'discount',
      discount: 5000,
      discountType: 'fixed'
    },
    { 
      points: 7500, 
      reward: '20% Off Next Booking', 
      available: points >= 7500,
      type: 'discount',
      discount: 20,
      discountType: 'percentage'
    },
    { 
      points: 10000, 
      reward: 'Premium Host Badge + ₱10,000 Voucher', 
      available: points >= 10000,
      type: 'premium',
      discount: 10000,
      discountType: 'fixed'
    }
  ];

  const waysToEarn = [
    { action: 'Complete first booking', points: 100, icon: FaCheckCircle },
    { action: 'Publish a listing', points: 50, icon: FaCheckCircle },
    { action: 'Receive 5-star review', points: 25, icon: FaStar },
    { action: 'Complete 10 bookings', points: 250, icon: FaCheckCircle },
    { action: 'Complete 50 bookings', points: 1000, icon: FaTrophy },
    { action: 'Monthly active host', points: 100, icon: FaChartLine },
    { action: 'Refer a host', points: 200, icon: FaArrowUp },
    { action: 'Earn ₱10,000', points: 500, icon: FaCoins }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FaGift className="text-emerald-600" />
          Points & Rewards
        </h1>
        <p className="text-gray-600">Earn points and unlock exclusive rewards</p>
      </div>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded"
          >
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded"
          >
            <p className="text-emerald-700 text-sm font-medium">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <FaCoins className="text-3xl" />
            <div className="text-right">
              <p className="text-sm opacity-90">Total Points</p>
              <p className="text-4xl font-bold">{points.toLocaleString()}</p>
            </div>
          </div>
          {tier.nextTier && (
            <div className="mt-2 pt-2 border-t border-emerald-400">
              <p className="text-xs opacity-75">
                {tier.nextTierPoints - points} points to {tier.nextTier}
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${tier.bgGradient} rounded-xl shadow-lg p-6 text-white`}
        >
          <div className="flex items-center justify-between mb-4">
            <TierIcon className="text-3xl" />
            <div className="text-right">
              <p className="text-sm opacity-90">Current Tier</p>
              <p className="text-2xl font-bold">{tier.name}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all"
                style={{ 
                  width: tier.nextTierPoints 
                    ? `${Math.min(100, (points / tier.nextTierPoints) * 100)}%`
                    : '100%'
                }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <FaChartLine className="text-3xl text-emerald-600" />
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            From completed bookings
          </p>
        </motion.div>
      </div>

      {/* Ways to Earn */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FaArrowUp className="text-emerald-600" />
            Ways to Earn Points
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {waysToEarn.map((way, index) => {
              const Icon = way.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{way.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">+{way.points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FaGift className="text-emerald-600" />
            Available Rewards
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-5 rounded-lg border-2 transition-all
                  ${reward.available
                    ? 'border-emerald-600 bg-emerald-50 hover:shadow-md'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTicketAlt className={`${reward.available ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <p className="font-semibold text-gray-900">{reward.reward}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {reward.points.toLocaleString()} points required
                    </p>
                    {reward.available ? (
                      <button 
                        onClick={() => handleRedeemReward(reward)}
                        disabled={redeeming === reward.points}
                        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {redeeming === reward.points ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Redeeming...
                          </>
                        ) : (
                          <>
                            <FaGift />
                            Redeem Now
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center py-2 px-4 bg-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600">
                          {reward.points - points} more points needed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Points History</h2>
        </div>
        <div className="p-6">
          {pointsHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaCoins className="text-5xl mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No points history yet</p>
              <p className="text-sm mt-2">Start earning points by completing bookings and receiving reviews!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pointsHistory.map((transaction, index) => (
                <motion.div
                  key={transaction.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.points > 0 ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {transaction.points > 0 ? (
                        <FaArrowUp className="text-emerald-600" />
                      ) : (
                        <FaGift className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.reason || 'Points earned'}</p>
                      <p className="text-sm text-gray-500">
                        {(() => {
                          try {
                            if (transaction.createdAt?.toDate) {
                              return transaction.createdAt.toDate().toLocaleDateString('en-PH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            } else if (transaction.createdAt) {
                              return new Date(transaction.createdAt).toLocaleDateString('en-PH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            }
                            return 'Date unavailable';
                          } catch (e) {
                            return 'Date unavailable';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${transaction.points > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </p>
                    <p className="text-xs text-gray-500">Balance: {transaction.balance}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostRewards;

