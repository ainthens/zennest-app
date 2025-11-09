# EmailJS Dual Account Setup Guide

## Overview

Your Zennest app now supports **TWO separate EmailJS accounts**:

1. **OLD Account** (Registration Account): Used for Guest and Host Registration emails
2. **NEW Account** (Booking Account): Used for Booking Confirmation and Cancellation emails

## Account Configuration

### Account 1: Registration Emails (OLD ACCOUNT)
- **Public Key**: `p_q8TaCGGwI6hjYNY`
- **Service ID**: `service_2pym6wm`
- **Templates**:
  - Guest Registration: `template_3fb5tc4`
  - Host Registration: `template_89gpyn2`

### Account 2: Booking Emails (NEW ACCOUNT)
- **Public Key**: `UzKmW-bFf0VVts5x5`
- **Service ID**: `service_5t2qmca`
- **Templates**:
  - Booking Confirmation: `template_0ayttfm`
  - Booking Cancellation: `template_o0l2xs8`

## How It Works

The system automatically uses the correct account based on the email type:

- **Guest Registration** → Uses OLD Account (registration account)
- **Host Registration** → Uses OLD Account (registration account)
- **Booking Confirmation** → Uses NEW Account (booking account)
- **Booking Cancellation** → Uses NEW Account (booking account)

## Configuration File

The configuration is in `src/config/emailjs.js`:

```javascript
export const emailjsConfig = {
  // Registration Account (OLD)
  registration: {
    publicKey: "p_q8TaCGGwI6hjYNY",
    serviceId: "service_2pym6wm",
    templateId: "template_3fb5tc4",
    hostTemplateId: "template_89gpyn2",
  },

  // Booking Account (NEW)
  booking: {
    publicKey: "UzKmW-bFf0VVts5x5",
    serviceId: "service_5t2qmca",
    bookingConfirmationTemplateId: "template_0ayttfm",
    bookingCancellationTemplateId: "template_o0l2xs8",
  },
};
```

## Email Flow

### Registration Emails (OLD Account)

1. **Guest Registration**:
   - Function: `sendVerificationEmail()`
   - Account: Registration Account (OLD)
   - Public Key: `p_q8TaCGGwI6hjYNY`
   - Service ID: `service_2pym6wm`
   - Template ID: `template_3fb5tc4`

2. **Host Registration**:
   - Function: `sendHostVerificationEmail()`
   - Account: Registration Account (OLD)
   - Public Key: `p_q8TaCGGwI6hjYNY`
   - Service ID: `service_2pym6wm`
   - Template ID: `template_89gpyn2`

### Booking Emails (NEW Account)

1. **Booking Confirmation**:
   - Function: `sendBookingConfirmationEmail()`
   - Account: Booking Account (NEW)
   - Public Key: `UzKmW-bFf0VVts5x5`
   - Service ID: `service_5t2qmca`
   - Template ID: `template_0ayttfm`

2. **Booking Cancellation**:
   - Function: `sendBookingCancellationEmail()`
   - Account: Booking Account (NEW)
   - Public Key: `UzKmW-bFf0VVts5x5`
   - Service ID: `service_5t2qmca`
   - Template ID: `template_o0l2xs8`

## Testing

### Test Guest Registration
1. Try registering a new guest user
2. Check browser console for: `🔧 EmailJS Configuration Check (Registration Account)`
3. Verify it uses: `service_2pym6wm` and `template_3fb5tc4`
4. Check EmailJS dashboard (OLD account) for send logs

### Test Host Registration
1. Try registering as a host
2. Check browser console for: `🔧 Sending Host Registration OTP Email (Registration Account)`
3. Verify it uses: `service_2pym6wm` and `template_89gpyn2`
4. Check EmailJS dashboard (OLD account) for send logs

### Test Booking Confirmation
1. Complete a booking with payment
2. Check browser console for booking confirmation emails
3. Verify it uses: `service_5t2qmca` and `template_0ayttfm`
4. Check EmailJS dashboard (NEW account) for send logs

### Test Booking Cancellation
1. Cancel a booking
2. Check browser console for cancellation emails
3. Verify it uses: `service_5t2qmca` and `template_o0l2xs8`
4. Check EmailJS dashboard (NEW account) for send logs

## Troubleshooting

### Registration Emails Not Working

1. **Check OLD Account**:
   - Verify public key: `p_q8TaCGGwI6hjYNY`
   - Verify service ID: `service_2pym6wm`
   - Verify template IDs: `template_3fb5tc4` and `template_89gpyn2`

2. **Check Browser Console**:
   - Look for: `Registration Account` in logs
   - Check for error messages

3. **Check EmailJS Dashboard (OLD Account)**:
   - Go to: https://dashboard.emailjs.com/admin (OLD account)
   - Check Logs for send attempts
   - Verify service is active

### Booking Emails Not Working

1. **Check NEW Account**:
   - Verify public key: `UzKmW-bFf0VVts5x5`
   - Verify service ID: `service_5t2qmca`
   - Verify template IDs: `template_0ayttfm` and `template_o0l2xs8`

2. **Check Browser Console**:
   - Look for booking email logs
   - Check for error messages

3. **Check EmailJS Dashboard (NEW Account)**:
   - Go to: https://dashboard.emailjs.com/admin (NEW account)
   - Check Logs for send attempts
   - Verify service is active

## Important Notes

1. **EmailJS Initialization**: EmailJS is initialized per-request with the correct account
2. **No Conflicts**: Each email type uses its designated account automatically
3. **Backwards Compatibility**: Legacy config still works for backwards compatibility
4. **Environment Variables**: You can override config using environment variables

## Environment Variables (Optional)

You can use environment variables to override the config:

```env
# Registration Account (OLD)
VITE_EMAILJS_REGISTRATION_PUBLIC_KEY=p_q8TaCGGwI6hjYNY
VITE_EMAILJS_REGISTRATION_SERVICE_ID=service_2pym6wm
VITE_EMAILJS_REGISTRATION_TEMPLATE_ID=template_3fb5tc4
VITE_EMAILJS_REGISTRATION_HOST_TEMPLATE_ID=template_89gpyn2

# Booking Account (NEW)
VITE_EMAILJS_BOOKING_PUBLIC_KEY=UzKmW-bFf0VVts5x5
VITE_EMAILJS_BOOKING_SERVICE_ID=service_5t2qmca
VITE_EMAILJS_BOOKING_CONFIRMATION_TEMPLATE_ID=template_0ayttfm
VITE_EMAILJS_BOOKING_CANCELLATION_TEMPLATE_ID=template_o0l2xs8
```

## Summary

✅ **Guest Registration** → OLD Account (`p_q8TaCGGwI6hjYNY`)
✅ **Host Registration** → OLD Account (`p_q8TaCGGwI6hjYNY`)
✅ **Booking Confirmation** → NEW Account (`UzKmW-bFf0VVts5x5`)
✅ **Booking Cancellation** → NEW Account (`UzKmW-bFf0VVts5x5`)

Both accounts work independently and automatically based on the email type!

