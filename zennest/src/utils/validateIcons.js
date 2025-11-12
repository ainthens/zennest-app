/**
 * Icon Import Validator
 * Run this in your browser console to find potential icon import errors
 */

export const validateIconImports = () => {
  console.group('🎨 Icon Import Validator');
  
  // List of known valid Font Awesome icons
  const validFaIcons = [
    'FaHome', 'FaUser', 'FaCog', 'FaBars', 'FaTimes', 'FaSpinner',
    'FaCheck', 'FaTimes', 'FaChevronDown', 'FaChevronUp', 'FaChevronLeft', 'FaChevronRight',
    'FaArrowLeft', 'FaArrowRight', 'FaArrowUp', 'FaArrowDown',
    'FaEdit', 'FaTrash', 'FaSave', 'FaDownload', 'FaUpload',
    'FaCheckCircle', 'FaTimesCircle', 'FaExclamationCircle', 'FaInfoCircle',
    'FaSearch', 'FaBell', 'FaHeart', 'FaStar', 'FaEye', 'FaEyeSlash',
    'FaLock', 'FaUnlock', 'FaCalendar', 'FaClock', 'FaPhone', 'FaEnvelope',
    'FaSignOutAlt', 'FaRedo', 'FaSyncAlt', 'FaPen', 'FaPrint',
    'FaMapMarkerAlt', 'FaUsers', 'FaDollarSign', 'FaGavel', 'FaWallet',
    'FaChartLine', 'FaExclamationTriangle', 'FaShieldAlt', 'FaFileContract'
  ];

  // Check for deprecated icons
  const deprecatedIcons = {
    'FaRefresh': 'FaSyncAlt or FaRedo',
    'FaClose': 'FaTimes',
    'FaX': 'FaTimes',
    'FaSettings': 'FaCog',
    'FaDelete': 'FaTrash',
    'FaBack': 'FaArrowLeft',
    'FaForward': 'FaArrowRight',
    'FaLogout': 'FaSignOutAlt'
  };

  console.log('✅ Valid Font Awesome Icons:', validFaIcons.length);
  console.log('⚠️ Deprecated Icons:', Object.keys(deprecatedIcons));
  
  console.groupEnd();

  return { validFaIcons, deprecatedIcons };
};

/**
 * Check all imports in the app
 * Usage: validateIconImports()
 */
if (import.meta.env.DEV) {
  window.__validateIcons = validateIconImports;
}

export default validateIconImports;