import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaCalendarAlt,
  FaUsers,
  FaMapMarkerAlt,
  FaHome,
  FaShieldAlt,
  FaCreditCard,
  FaHeadset,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaHeart,
  FaBed,
  FaBath,
  FaWifi,
  FaParking,
  FaSwimmingPool,
  FaUmbrellaBeach,
  FaMountain,
  FaCity,
  FaQuoteLeft,
  FaUserShield,
  FaAward,
  FaRocket,
  FaHandshake,
  FaPaperPlane
} from 'react-icons/fa';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

const LandingPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [email, setEmail] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('status', '==', 'active'),
        limit(6)
      );
      const querySnapshot = await getDocs(q);
      const listings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeaturedListings(listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (location) searchParams.append('location', location);
    if (checkIn) searchParams.append('checkIn', checkIn);
    if (checkOut) searchParams.append('checkOut', checkOut);
    if (guests) searchParams.append('guests', guests);
    navigate(`/listings?${searchParams.toString()}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription logic
    setSubscribeSuccess(true);
    setEmail('');
    setTimeout(() => setSubscribeSuccess(false), 3000);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                <FaHome className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Zennest
              </span>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/listings')}
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                Explore
              </button>
              <button
                onClick={() => navigate('/experiences')}
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                Experiences
              </button>
              <button
                onClick={() => {
                  const section = document.getElementById('how-it-works');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <div className="w-6 h-0.5 bg-gray-700 mb-1.5"></div>
              <div className="w-6 h-0.5 bg-gray-700 mb-1.5"></div>
              <div className="w-6 h-0.5 bg-gray-700"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 bg-gradient-to-br from-emerald-50 via-white to-blue-50 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h1
              {...fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Discover Your Perfect
              <span className="block bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mt-2">
                Philippine Homestay
              </span>
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Experience authentic Filipino hospitality. Book unique homes, villas, and experiences
              across the beautiful islands of the Philippines.
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Location */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Location
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                    <input
                      type="text"
                      placeholder="Where to?"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Check In */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Check In
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Check Out */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Check Out
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Guests
                  </label>
                  <div className="relative">
                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
              >
                <FaSearch className="group-hover:scale-110 transition-transform" />
                Search Homestays
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: '10,000+', label: 'Homestays' },
              { number: '50,000+', label: 'Happy Guests' },
              { number: '7,107', label: 'Islands' },
              { number: '4.9★', label: 'Average Rating' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{stat.number}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              {...fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Featured Homestays
            </motion.h2>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Handpicked properties offering the best of Filipino hospitality
            </motion.p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredListings.map((listing, idx) => (
                <motion.div
                  key={listing.id}
                  variants={fadeInUp}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={listing.images?.[0] || 'https://via.placeholder.com/400x300'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {listing.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {listing.discount}% OFF
                      </div>
                    )}
                    <button className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <FaHeart className="text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg truncate flex-1">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="text-yellow-400 fill-current" />
                        <span className="font-semibold">{listing.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-emerald-600" />
                      {listing.location}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {listing.bedrooms && (
                        <span className="flex items-center gap-1">
                          <FaBed /> {listing.bedrooms}
                        </span>
                      )}
                      {listing.bathrooms && (
                        <span className="flex items-center gap-1">
                          <FaBath /> {listing.bathrooms}
                        </span>
                      )}
                      {listing.guests && (
                        <span className="flex items-center gap-1">
                          <FaUsers /> {listing.guests}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-gray-900">
                        ₱{listing.rate?.toLocaleString()}
                      </span>
                      <span className="text-gray-600">/ night</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/listings')}
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
            >
              View All Listings
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              {...fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              How Zennest Works
            </motion.h2>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Book your dream homestay in three simple steps
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: FaSearch,
                title: 'Search & Discover',
                description: 'Browse thousands of verified homestays across the Philippines. Filter by location, price, amenities, and more.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: FaCalendarAlt,
                title: 'Book Instantly',
                description: 'Select your dates, choose your perfect stay, and book instantly with secure payment. No waiting, no hassle.',
                color: 'from-emerald-500 to-emerald-600'
              },
              {
                icon: FaHome,
                title: 'Enjoy Your Stay',
                description: 'Check in, relax, and experience authentic Filipino hospitality. Our hosts are ready to welcome you home.',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <step.icon className="text-white text-3xl" />
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-2xl text-gray-400 border-4 border-white shadow-md">
                    {idx + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -translate-x-1/2"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Zennest */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              {...fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Why Choose Zennest?
            </motion.h2>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              We're committed to providing the best homestay experience in the Philippines
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaUserShield,
                title: 'Verified Hosts',
                description: 'All hosts are verified with background checks for your safety and peace of mind.'
              },
              {
                icon: FaCreditCard,
                title: 'Secure Payments',
                description: 'Your payment information is encrypted and protected with industry-leading security.'
              },
              {
                icon: FaHeadset,
                title: '24/7 Support',
                description: 'Our customer support team is always ready to help you anytime, anywhere.'
              },
              {
                icon: FaAward,
                title: 'Best Price Guarantee',
                description: 'Find the best deals on homestays with our price match guarantee.'
              }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 hover:shadow-xl transition-shadow border border-gray-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Host CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              {...fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Become a Zennest Host
              </h2>
              <p className="text-emerald-50 text-lg mb-8 leading-relaxed">
                Share your space, earn extra income, and connect with travelers from around the world. 
                Join thousands of hosts who are already earning with Zennest.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Earn up to ₱50,000+ per month',
                  'Full control over your pricing and availability',
                  'Free host protection insurance',
                  '24/7 host support and guidance'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white">
                    <FaCheckCircle className="text-emerald-300 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/become-host')}
                className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3 group"
              >
                <FaRocket />
                Start Hosting Today
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: FaHandshake, text: 'Easy Setup', color: 'from-blue-500 to-blue-600' },
                { icon: FaShieldAlt, text: 'Secure Platform', color: 'from-purple-500 to-purple-600' },
                { icon: FaAward, text: 'Top Ratings', color: 'from-pink-500 to-pink-600' },
                { icon: FaRocket, text: 'Fast Earnings', color: 'from-orange-500 to-orange-600' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-colors border border-white/20"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="text-white text-2xl" />
                  </div>
                  <p className="text-white font-semibold">{item.text}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              {...fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              What Our Guests Say
            </motion.h2>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Real experiences from real travelers
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Maria Santos',
                location: 'Manila',
                rating: 5,
                text: 'Amazing experience! The host was incredibly welcoming and the place was exactly as shown. Highly recommend Zennest for anyone looking for authentic Filipino hospitality.',
                avatar: 'MS'
              },
              {
                name: 'John Reyes',
                location: 'Cebu',
                rating: 5,
                text: 'Booked a beachfront villa for our family vacation. The booking process was smooth, and the property exceeded our expectations. Will definitely use Zennest again!',
                avatar: 'JR'
              },
              {
                name: 'Ana Cruz',
                location: 'Palawan',
                rating: 5,
                text: 'Best homestay platform in the Philippines! Found the perfect place for our honeymoon. The support team was also very helpful when we had questions.',
                avatar: 'AC'
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.2 }}
                className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-gray-200"
              >
                <FaQuoteLeft className="text-emerald-600 text-3xl mb-4 opacity-50" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <FaPaperPlane className="text-5xl text-emerald-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive deals, travel tips, and the latest homestay listings
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl"
                >
                  Subscribe
                </button>
              </div>
              {subscribeSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-emerald-600 font-semibold flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> Successfully subscribed!
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                  <FaHome className="text-white text-xl" />
                </div>
                <span className="text-2xl font-bold text-white">Zennest</span>
              </div>
              <p className="text-sm mb-4">
                Your trusted platform for discovering authentic Philippine homestays and experiences.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: FaFacebook, link: '#' },
                  { icon: FaTwitter, link: '#' },
                  { icon: FaInstagram, link: '#' },
                  { icon: FaYoutube, link: '#' }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.link}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                  >
                    <social.icon className="text-lg" />
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Safety Information</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Cancellation Options</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <FaPhoneAlt className="text-emerald-400" />
                  <span>+63 917 123 4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaEnvelope className="text-emerald-400" />
                  <span>support@zennest.ph</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaGlobe className="text-emerald-400" />
                  <span>www.zennest.ph</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">
                © 2024 Zennest. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;