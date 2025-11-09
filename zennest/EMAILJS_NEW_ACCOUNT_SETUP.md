# EmailJS New Account Setup Guide

This guide will help you set up your new EmailJS account with Zennest.

## Step 1: Get Your EmailJS Public Key

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Click on **Account** in the left sidebar
3. Scroll down to **API Keys** section
4. Copy your **Public Key** (starts with `p_`)
5. It looks like: `p_xxxxxxxxxxxxxxxx`

## Step 2: Create Email Service

1. In EmailJS Dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email service provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. After setup, you'll see your **Service ID** (starts with `service_`)
6. Copy the Service ID (e.g., `service_xxxxxxxxx`)

## Step 3: Create Email Templates

You need to create templates for different email types. Here's what you need:

### 3.1 User Registration Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Name it: "User Registration" or "OTP Verification"
4. Set up your template HTML (see template examples below)
5. Copy the **Template ID** (starts with `template_`)
6. Save it as `templateId` in your config

### 3.2 Host Registration Template

1. Create another template named "Host Registration"
2. Copy the **Template ID**
3. Save it as `hostTemplateId` in your config

### 3.3 Booking Confirmation Template

1. Create template named "Booking Confirmation"
2. Copy the **Template ID**
3. Save it as `bookingConfirmationTemplateId` in your config

### 3.4 Booking Cancellation Template

1. Create template named "Booking Cancellation"
2. Copy the **Template ID**
3. Save it as `bookingCancellationTemplateId` in your config

### 3.5 Password Recovery Template (Optional)

1. Create template named "Password Recovery"
2. Copy the **Template ID**
3. Save it as `passwordRecoveryTemplateId` in your config

## Step 4: Configure Your Application

You have two options to configure EmailJS:

### Option A: Using Environment Variables (Recommended)

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your EmailJS credentials:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_HOST_TEMPLATE_ID=your_host_template_id_here
VITE_EMAILJS_BOOKING_CONFIRMATION_TEMPLATE_ID=your_booking_confirmation_template_id_here
VITE_EMAILJS_BOOKING_CANCELLATION_TEMPLATE_ID=your_booking_cancellation_template_id_here
VITE_EMAILJS_PASSWORD_RECOVERY_TEMPLATE_ID=your_password_recovery_template_id_here
```

3. Replace `your_*_here` with your actual IDs
4. Restart your development server

### Option B: Direct Configuration

1. Open `zennest/src/config/emailjs.js`
2. Replace the placeholder values with your actual IDs:

```javascript
export const emailjsConfig = {
  publicKey: "p_your_actual_public_key",
  serviceId: "service_your_actual_service_id",
  templateId: "template_your_actual_template_id",
  hostTemplateId: "template_your_actual_host_template_id",
  bookingConfirmationTemplateId: "template_your_actual_booking_confirmation_template_id",
  bookingCancellationTemplateId: "template_your_actual_booking_cancellation_template_id",
  passwordRecoveryTemplateId: "template_your_actual_password_recovery_template_id",
};
```

## Step 5: Configure Email Service Mapping

1. Go to **Email Services** in EmailJS Dashboard
2. Click on your service
3. Go to **Settings** or **Integration**
4. Make sure the **"To Email"** field is mapped to `user_email`
5. This is important for emails to be sent correctly

## Step 6: Test Your Configuration

1. Start your development server
2. Try to register a new user or complete a booking
3. Check the browser console for EmailJS logs
4. Check your EmailJS Dashboard → **Logs** for send attempts
5. Verify emails are being received

## Template Variables Reference

### User Registration Template Variables

- `user_email` - User's email address
- `user_name` - User's name
- `otp_code` - 6-digit OTP code
- `expiry_time` - OTP expiration time
- `app_name` - "Zennest"
- `app_link` - Link to verification page
- `website_link` - Website URL
- `current_year` - Current year

### Booking Confirmation Template Variables

- `user_email` - Recipient email
- `user_name` - Recipient name
- `booking_id` - Booking ID
- `listing_title` - Listing title
- `listing_location` - Listing location
- `check_in` - Check-in date
- `check_out` - Check-out date
- `guests` - Number of guests
- `nights` - Number of nights
- `total_amount` - Total amount
- `category` - Booking category
- `host_name` - Host name (for guest emails)
- `guest_name` - Guest name (for host emails)
- `app_name` - "Zennest"
- `website_link` - Website URL
- `booking_link` - Link to view booking
- `current_year` - Current year

### Booking Cancellation Template Variables

Same as booking confirmation, plus:
- `cancelled_by` - Who cancelled (Guest/Host)

## Quick Setup Checklist

- [ ] Get Public Key from EmailJS Account
- [ ] Create Email Service and get Service ID
- [ ] Create User Registration Template
- [ ] Create Host Registration Template
- [ ] Create Booking Confirmation Template
- [ ] Create Booking Cancellation Template
- [ ] (Optional) Create Password Recovery Template
- [ ] Configure email service mapping (To Email → `user_email`)
- [ ] Update `.env` file or `emailjs.js` with your credentials
- [ ] Test email sending
- [ ] Verify emails are received

## Troubleshooting

### Emails Not Sending

1. **Check Public Key**: Verify your public key is correct
2. **Check Service ID**: Verify your service ID is correct
3. **Check Template IDs**: Verify all template IDs are correct
4. **Check Service Mapping**: Ensure "To Email" is mapped to `user_email`
5. **Check Console Logs**: Look for error messages in browser console
6. **Check EmailJS Logs**: Review logs in EmailJS dashboard
7. **Check Quota**: Verify you haven't exceeded your email quota

### Common Errors

- **"Service not found"**: Check your Service ID
- **"Template not found"**: Check your Template ID
- **"Recipient not found"**: Check service email mapping
- **"Public key invalid"**: Check your Public Key
- **"Quota exceeded"**: Upgrade your EmailJS plan

## Security Notes

- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- Use environment variables for sensitive data
- Keep your public key secure (though it's safe to use in frontend)

## Next Steps

After setting up EmailJS:

1. Test user registration emails
2. Test host registration emails
3. Test booking confirmation emails
4. Test booking cancellation emails
5. Customize email templates to match your brand
6. Monitor email delivery in EmailJS dashboard

## Support

If you need help:
1. Check EmailJS documentation: https://www.emailjs.com/docs/
2. Review EmailJS dashboard logs
3. Check browser console for errors
4. Verify all configuration values are correct

## Example .env File

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=p_your_public_key_here
VITE_EMAILJS_SERVICE_ID=service_your_service_id_here

# Template IDs
VITE_EMAILJS_TEMPLATE_ID=template_user_registration
VITE_EMAILJS_HOST_TEMPLATE_ID=template_host_registration
VITE_EMAILJS_BOOKING_CONFIRMATION_TEMPLATE_ID=template_booking_confirmation
VITE_EMAILJS_BOOKING_CANCELLATION_TEMPLATE_ID=template_booking_cancellation
VITE_EMAILJS_PASSWORD_RECOVERY_TEMPLATE_ID=template_password_recovery
```

Remember to replace all placeholder values with your actual EmailJS credentials!

