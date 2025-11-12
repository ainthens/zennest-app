// Icon Reference Guide - Use this to find correct icon names from react-icons/fa

/**
 * Common Icon Replacements
 * If you encounter an import error like "FaRefresh is not exported",
 * use the alternatives listed below
 */

export const ICON_REPLACEMENTS = {
  // Refresh/Reload Icons
  'FaRefresh': 'FaSyncAlt or FaRedo',
  
  // Chevron/Arrow Icons
  'FaChevronUp': 'FaChevronUp',
  'FaChevronDown': 'FaChevronDown',
  'FaChevronLeft': 'FaChevronLeft',
  'FaChevronRight': 'FaChevronRight',
  
  // Loading/Spinner Icons
  'FaSpinner': 'FaSpinner (use with animate-spin)',
  'FaSync': 'FaSyncAlt',
  'FaCircleNotch': 'FaCircleNotch (use with animate-spin)',
  
  // Common UI Icons
  'FaHome': 'FaHome',
  'FaUser': 'FaUser',
  'FaCog': 'FaCog',
  'FaSettings': 'FaCog',
  'FaBars': 'FaBars',
  'FaTimes': 'FaTimes (close/x icon)',
  'FaClose': 'FaTimes',
  'FaX': 'FaTimes',
  
  // Status Icons
  'FaCheckCircle': 'FaCheckCircle',
  'FaTimesCircle': 'FaTimesCircle',
  'FaExclamationCircle': 'FaExclamationCircle',
  'FaInfoCircle': 'FaInfoCircle',
  'FaQuestionCircle': 'FaQuestionCircle',
  
  // Action Icons
  'FaEdit': 'FaEdit (pencil)',
  'FaPencil': 'FaPen',
  'FaTrash': 'FaTrash',
  'FaDelete': 'FaTrash',
  'FaSave': 'FaSave',
  'FaDownload': 'FaDownload',
  'FaUpload': 'FaUpload',
  'FaPrint': 'FaPrint',
  
  // Navigation Icons
  'FaArrowLeft': 'FaArrowLeft',
  'FaArrowRight': 'FaArrowRight',
  'FaArrowUp': 'FaArrowUp',
  'FaArrowDown': 'FaArrowDown',
  'FaBack': 'FaArrowLeft',
  'FaForward': 'FaArrowRight',
  
  // Social Icons
  'FaFacebook': 'FaFacebook',
  'FaTwitter': 'FaTwitter',
  'FaInstagram': 'FaInstagram',
  'FaLinkedin': 'FaLinkedin',
  'FaGithub': 'FaGithub',
  'FaYoutube': 'FaYoutube',
  'FaPinterest': 'FaPinterest',
  
  // Other Common Icons
  'FaSearch': 'FaSearch',
  'FaBell': 'FaBell',
  'FaHeart': 'FaHeart',
  'FaStar': 'FaStar',
  'FaEye': 'FaEye',
  'FaEyeSlash': 'FaEyeSlash',
  'FaLock': 'FaLock',
  'FaUnlock': 'FaUnlock',
  'FaCalendar': 'FaCalendar',
  'FaClock': 'FaClock',
  'FaMap': 'FaMap',
  'FaPhone': 'FaPhone',
  'FaEnvelope': 'FaEnvelope',
  'FaSignOut': 'FaSignOutAlt',
  'FaLogout': 'FaSignOutAlt',
};

/**
 * How to use this reference:
 * 
 * 1. If you get an import error like:
 *    "export 'FaRefresh' was not found in 'react-icons/fa'"
 * 
 * 2. Look up 'FaRefresh' in ICON_REPLACEMENTS above
 * 
 * 3. Replace it with the correct icon:
 *    OLD: import { FaRefresh } from 'react-icons/fa';
 *    NEW: import { FaSyncAlt } from 'react-icons/fa';
 * 
 * 4. Update the component to use the new icon name
 */

/**
 * Available Icon Sets in react-icons:
 * - react-icons/fa    - Font Awesome v6 (solid)
 * - react-icons/far   - Font Awesome v6 (regular)
 * - react-icons/fab   - Font Awesome v6 (brands)
 * - react-icons/bi    - Bootstrap Icons
 * - react-icons/ai    - Ant Design Icons
 * - react-icons/bs    - Bootstrap Icons
 * - react-icons/cg    - Chakra UI Icons
 * - react-icons/di    - Devicon
 * - react-icons/fc    - Flat Color Icons
 * - react-icons/fi    - Feather
 * - react-icons/gi    - Game Icons
 * - react-icons/go    - Github Octicons
 * - react-icons/gr    - Grommet-Icons
 * - react-icons/hi    - Heroicons
 * - react-icons/hi2   - Heroicons 2
 * - react-icons/im    - IcoMoon Free
 * - react-icons/io    - Ionicons 4
 * - react-icons/io5   - Ionicons 5
 * - react-icons/md    - Material Design Icons
 * - react-icons/ri    - Remix Icon
 * - react-icons/si    - Simple Icons
 * - react-icons/tb    - Tabler Icons
 * - react-icons/tfi   - Typicons
 * - react-icons/vsc   - VS Code Icons
 * - react-icons/wi    - Weather Icons
 */

export default ICON_REPLACEMENTS;