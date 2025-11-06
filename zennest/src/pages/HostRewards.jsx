// src/pages/HostRewards.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHostProfile } from '../services/firestoreService';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import {
  FaGift,
  FaStar,
  FaTrophy,
  FaCoins,
  FaChartLine,
  FaCheckCircle,
  FaArrowUp
} from 'react-icons/fa';

const HostRewards = () => {
  const { user } = useAuth();
  const [hostProfile, setHostProfile] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRewardsData();
    }
  }, [user]);

  const fetchRewardsData = async () => {
    try {
      const profileResult = await getHostProfile(user.uid);
      if (profileResult.success && profileResult.data) {
        setHostProfile(profileResult.data);
      }

      // Fetch points transactions
      const pointsRef = collection(db, 'pointsTransactions');
      const q = query(
        pointsRef,
        where('hostId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      setPointsHistory(history);
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const points = hostProfile?.points || 0;

  // Calculate tier based on points
  const getTier = () => {
    if (points >= 10000) return { name: 'Platinum', color: 'purple', icon: FaTrophy };
    if (points >= 5000) return { name: 'Gold', color: 'yellow', icon: FaStar };
    if (points >= 2000) return { name: 'Silver', color: 'gray', icon: FaStar };
    return { name: 'Bronze', color: 'orange', icon: FaStar };
  };

  const tier = getTier();
  const TierIcon = tier.icon;

  const rewards = [
    { points: 500, reward: '₱500 Discount Voucher', available: points >= 500 },
    { points: 1000, reward: '₱1,000 Discount Voucher', available: points >= 1000 },
    { points: 2500, reward: '₱2,500 Discount Voucher', available: points >= 2500 },
    { points: 5000, reward: '₱5,000 Discount Voucher', available: points >= 5000 },
    { points: 10000, reward: 'Premium Host Badge', available: points >= 10000 }
  ];

  const waysToEarn = [
    { action: 'Complete first booking', points: 100, icon: FaCheckCircle },
    { action: 'Publish a listing', points: 50, icon: FaCheckCircle },
    { action: 'Receive 5-star review', points: 25, icon: FaStar },
    { action: 'Monthly active host', points: 100, icon: FaChartLine },
    { action: 'Refer a host', points: 200, icon: FaArrowUp }
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br from-${tier.color}-500 to-${tier.color}-700 rounded-xl shadow-lg p-6 text-white`}
        >
          <div className="flex items-center justify-between mb-4">
            <TierIcon className="text-3xl" />
            <div className="text-right">
              <p className="text-sm opacity-90">Current Tier</p>
              <p className="text-2xl font-bold">{tier.name}</p>
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
                ${(hostProfile?.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
          </div>
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
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
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
          <div className="space-y-4">
            {rewards.map((reward, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${reward.available
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{reward.reward}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Requires {reward.points.toLocaleString()} points
                    </p>
                  </div>
                  <div className="text-right">
                    {reward.available ? (
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                        Redeem
                      </button>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {points < reward.points && (
                          <span>{reward.points - points} more points needed</span>
                        )}
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
              <p>No points history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pointsHistory.map((transaction, index) => (
                <motion.div
                  key={transaction.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{transaction.reason || 'Points earned'}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.createdAt?.toDate
                        ? transaction.createdAt.toDate().toLocaleString()
                        : new Date(transaction.createdAt).toLocaleString()
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.points > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
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

