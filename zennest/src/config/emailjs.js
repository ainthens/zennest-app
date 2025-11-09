// src/config/emailjs.js
// EmailJS Configuration - Dual Account Setup
// Account 1 (OLD): Used for Guest and Host Registration
// Account 2 (NEW): Used for Booking Confirmation and Cancellation

export const emailjsConfig = {
  // ============================================
  // ACCOUNT 1: Registration Emails (OLD ACCOUNT)
  // ============================================
  registration: {
    publicKey: import.meta.env.VITE_EMAILJS_REGISTRATION_PUBLIC_KEY || "p_q8TaCGGwI6hjYNY",
    serviceId: import.meta.env.VITE_EMAILJS_REGISTRATION_SERVICE_ID || "service_2pym6wm",
    templateId: import.meta.env.VITE_EMAILJS_REGISTRATION_TEMPLATE_ID || "template_3fb5tc4", // Guest registration
    hostTemplateId: import.meta.env.VITE_EMAILJS_REGISTRATION_HOST_TEMPLATE_ID || "template_89gpyn2", // Host registration
    passwordRecoveryTemplateId: import.meta.env.VITE_EMAILJS_REGISTRATION_PASSWORD_RECOVERY_TEMPLATE_ID || "", // Password recovery
  },

  // ============================================
  // ACCOUNT 2: Booking Emails (NEW ACCOUNT)
  // ============================================
  booking: {
    publicKey: import.meta.env.VITE_EMAILJS_BOOKING_PUBLIC_KEY || "UzKmW-bFf0VVts5x5",
    serviceId: import.meta.env.VITE_EMAILJS_BOOKING_SERVICE_ID || "service_5t2qmca",
    bookingConfirmationTemplateId: import.meta.env.VITE_EMAILJS_BOOKING_CONFIRMATION_TEMPLATE_ID || "template_0ayttfm",
    bookingCancellationTemplateId: import.meta.env.VITE_EMAILJS_BOOKING_CANCELLATION_TEMPLATE_ID || "template_o0l2xs8",
  },

  // ============================================
  // Legacy Support (for backwards compatibility)
  // ============================================
  // These will use the registration account by default
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "p_q8TaCGGwI6hjYNY",
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_2pym6wm",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_3fb5tc4",
  hostTemplateId: import.meta.env.VITE_EMAILJS_HOST_TEMPLATE_ID || "template_89gpyn2",
  passwordRecoveryTemplateId: import.meta.env.VITE_EMAILJS_PASSWORD_RECOVERY_TEMPLATE_ID || "",
  bookingConfirmationTemplateId: import.meta.env.VITE_EMAILJS_BOOKING_CONFIRMATION_TEMPLATE_ID || "template_0ayttfm",
  bookingCancellationTemplateId: import.meta.env.VITE_EMAILJS_BOOKING_CANCELLATION_TEMPLATE_ID || "template_o0l2xs8",
};
