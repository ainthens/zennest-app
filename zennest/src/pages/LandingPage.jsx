// src/pages/LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import waveSvg from "../assets/wave (1).svg";
import heroVideo from "../assets/homestays_video.webm";
import { 
  FaUmbrellaBeach, 
  FaCity, 
  FaMountain, 
  FaUtensils,
  FaHome,
  FaCalendarCheck,
  FaShieldAlt,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaChartLine,
  FaUsers,
  FaHandHoldingUsd
} from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  // Section refs with enhanced animations
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [categoriesRef, categoriesInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [benefitsRef, benefitsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  // Video autoplay handling
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          const playOnInteraction = () => {
            video.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        }
      };

      video.addEventListener('loadedmetadata', playVideo);
      return () => video.removeEventListener('loadedmetadata', playVideo);
    }
  }, []);

  const features = [
    {
      icon: FaHome,
      title: "Verified Listings",
      description: "All properties verified for quality and safety",
      color: "text-emerald-500"
    },
    {
      icon: FaCalendarCheck,
      title: "Instant Booking",
      description: "Book your stay in just a few clicks",
      color: "text-blue-500"
    },
    {
      icon: FaShieldAlt,
      title: "Secure Payments",
      description: "Your transactions are safe with us",
      color: "text-purple-500"
    },
    {
      icon: FaStar,
      title: "Top Rated",
      description: "4.9 average rating from guests",
      color: "text-yellow-500"
    }
  ];

  const categories = [
    {
      icon: FaUmbrellaBeach,
      title: "Beach Escapes",
      description: "Sun, sand, and sea",
      image: "from-blue-500 to-cyan-500",
      route: "/homestays?category=beach"
    },
    {
      icon: FaCity,
      title: "City Stays",
      description: "Urban adventures await",
      image: "from-purple-500 to-pink-500",
      route: "/homestays?category=city"
    },
    {
      icon: FaMountain,
      title: "Mountain Retreats",
      description: "Peace in the highlands",
      image: "from-green-500 to-emerald-500",
      route: "/homestays?category=countryside"
    },
    {
      icon: FaUtensils,
      title: "Local Services",
      description: "Authentic experiences",
      image: "from-orange-500 to-red-500",
      route: "/services"
    }
  ];

  const stats = [
    { value: "200+", label: "Properties" },
    { value: "1000+", label: "Happy Guests" },
    { value: "4.9", label: "Avg Rating" },
    { value: "50+", label: "Locations" }
  ];

  const benefits = [
    "No booking fees for guests",
    "24/7 customer support",
    "Flexible cancellation",
    "Best price guarantee",
    "Verified host profiles",
    "Instant confirmation"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Video */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ scale }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <FaStar className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Trusted by Thousands</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-tight"
          >
            Your Perfect
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              Escape Awaits
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
          >
            Discover unique homestays, unforgettable experiences, and local services across the Philippines
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate('/homestays')}
              className="group px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Explore Stays
              <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/host/register')}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Become a Host
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.img
            src="/src/assets/zennest-loading-icon.svg"
            alt="Scroll"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
          />
        </motion.div>

        {/* Wave Divider */}
        <img
          src={waveSvg}
          alt="Wave divider"
          className="absolute left-0 w-full bottom-[-2px] pointer-events-none z-20"
        />
      </motion.section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                <FaStar className="w-4 h-4" />
                Premium Service
              </span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
              Why Choose Zennest
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Experience seamless booking with trusted hosts and verified properties
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={featuresInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ 
                    duration: 0.7, 
                    delay: 0.3 + idx * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    <motion.div 
                      className={`${feature.color} mb-5 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-emerald-50 group-hover:to-cyan-50 transition-all duration-300`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                    >
                      <Icon className="w-8 h-8" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section ref={categoriesRef} className="py-16 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={categoriesInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                <FaHome className="w-4 h-4" />
                Discover Your Escape
              </span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect stay for your next adventure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 60, scale: 0.8 }}
                  animate={categoriesInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ 
                    duration: 0.7, 
                    delay: 0.2 + idx * 0.15,
                    type: "spring",
                    stiffness: 80
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  onClick={() => navigate(category.route)}
                  className="group relative overflow-hidden rounded-3xl cursor-pointer h-72 shadow-xl hover:shadow-2xl transition-all duration-500"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.image} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                  
                  {/* Animated overlay pattern */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20"
                    initial={{ scale: 0, rotate: 0 }}
                    whileHover={{ scale: 1.5, rotate: 45 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
                  </motion.div>
                  
                  <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                      className="mb-5 bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                    >
                      <Icon className="w-12 h-12" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-sm text-white/90 mb-4">{category.description}</p>
                    <motion.div
                      className="flex items-center gap-2 font-semibold text-sm"
                      initial={{ x: -10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>Explore</span>
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="relative py-20 sm:py-24 bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-600 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
              Trusted Worldwide
            </h2>
            <p className="text-emerald-100 text-base sm:text-lg">
              Join thousands of happy guests and hosts
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: idx * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                className="text-center group"
              >
                <motion.div 
                  className="relative inline-block"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:bg-white/30 transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-8 py-6 group-hover:bg-white/20 transition-all duration-300">
                    <div className="text-5xl sm:text-6xl font-semibold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm sm:text-base text-white/90 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/30 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={benefitsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block mb-6"
              >
                <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                  <FaCheckCircle className="w-4 h-4" />
                  Guest Perks
                </span>
              </motion.div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6">
                Guest Benefits
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-10">
                Enjoy a hassle-free booking experience with exclusive perks
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={benefitsInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.4 + idx * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      x: 5,
                      transition: { duration: 0.2 }
                    }}
                    className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="flex-shrink-0"
                    >
                      <FaCheckCircle className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={benefitsInView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600 rounded-3xl p-10 text-white shadow-2xl overflow-hidden"
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-white to-transparent rounded-full"
                ></motion.div>
              </div>

              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={benefitsInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6"
                >
                  <FaStar className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl sm:text-3xl font-semibold mb-4">
                  Ready to Start?
                </h3>
                <p className="text-base mb-8 text-white/90 leading-relaxed">
                  Join thousands of satisfied guests who found their perfect stay with us
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/homestays')}
                  className="group w-full px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                >
                  Browse Homestays
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section ref={ctaRef} className="relative py-20 sm:py-24 lg:py-32 bg-white overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={ctaInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block mb-6"
              >
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 px-5 py-2 rounded-full text-sm font-semibold">
                  <FaHandHoldingUsd className="w-4 h-4" />
                  Start Earning Today
                </span>
              </motion.div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
                Earn with Your
                <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                  Property
                </span>
              </h2>
              
              <p className="text-base sm:text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Join our community of successful hosts and turn your property into a thriving business. 
                We'll support you every step of the way.
              </p>

              {/* Host Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  { icon: FaChartLine, text: "Maximize earnings" },
                  { icon: FaUsers, text: "Reach more guests" },
                  { icon: FaShieldAlt, text: "Host protection" },
                  { icon: FaStar, text: "24/7 support" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/host/register')}
                className="group px-10 py-5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl inline-flex items-center gap-3"
              >
                Start Hosting Today
                <FaArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>
            </motion.div>

            {/* Right Side - Visual Card */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={ctaInView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500 rounded-3xl p-10 lg:p-12 shadow-2xl overflow-hidden">
                {/* Animated Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.5, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute -top-1/2 -right-1/2 w-full h-full"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full"></div>
                  </motion.div>
                </div>

                <div className="relative">
                  {/* Stats Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/80 text-sm font-medium">Average Monthly Earnings</span>
                      <FaChartLine className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="text-4xl font-semibold text-white mb-1">$2,500+</div>
                    <div className="text-emerald-200 text-sm">Per property</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                      <div className="text-3xl font-semibold text-white mb-2">500+</div>
                      <div className="text-white/80 text-sm">Active Hosts</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                      <div className="text-3xl font-semibold text-white mb-2">4.8★</div>
                      <div className="text-white/80 text-sm">Host Rating</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="mt-8 text-center"
                  >
                    <p className="text-white/90 text-sm italic">
                      "Best platform to host my properties. Easy to use and great support!"
                    </p>
                    <p className="text-white/70 text-xs mt-2">- Maria S., Superhost</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

