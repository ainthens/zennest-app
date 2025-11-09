# EmailJS Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your Public Key
1. Go to: https://dashboard.emailjs.com/admin/account
2. Copy your **Public Key** (starts with `p_`)

### Step 2: Get Your Service ID
1. Go to: https://dashboard.emailjs.com/admin/integration
2. Create a service (Gmail, Outlook, etc.) if you haven't
3. Copy your **Service ID** (starts with `service_`)

### Step 3: Create Templates
1. Go to: https://dashboard.emailjs.com/admin/template
2. Create templates for:
   - User Registration
   - Host Registration
   - Booking Confirmation
   - Booking Cancellation
3. Copy each **Template ID** (starts with `template_`)

### Step 4: Configure Your App

**Option 1: Using .env file (Recommended)**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   VITE_EMAILJS_PUBLIC_KEY=p_your_actual_public_key
   VITE_EMAILJS_SERVICE_ID=service_your_actual_service_id
   VITE_EMAILJS_TEMPLATE_ID=template_your_actual_template_id
   VITE_EMAILJS_HOST_TEMPLATE_ID=template_your_actual_host_template_id
   VITE_EMAILJS_BOOKING_CONFIRMATION_TEMPLATE_ID=template_your_actual_booking_confirmation_id
   VITE_EMAILJS_BOOKING_CANCELLATION_TEMPLATE_ID=template_your_actual_booking_cancellation_id
   ```

3. Restart your dev server

**Option 2: Direct Configuration**

1. Open `src/config/emailjs.js`
2. Replace `YOUR_*_HERE` with your actual values
3. Save the file

### Step 5: Configure Email Service
1. Go to: https://dashboard.emailjs.com/admin/integration
2. Click on your service
3. Make sure **"To Email"** is mapped to `user_email`

### Step 6: Test
1. Try registering a user or completing a booking
2. Check browser console for EmailJS logs
3. Check EmailJS dashboard → Logs
4. Verify emails are received

## 📍 Where to Find Your Credentials

| Credential | Where to Find | Format |
|------------|---------------|--------|
| **Public Key** | Dashboard → Account → API Keys | `p_xxxxxxxxxx` |
| **Service ID** | Dashboard → Email Services → Your Service | `service_xxxxxxxxx` |
| **Template ID** | Dashboard → Email Templates → Your Template | `template_xxxxxxxxx` |

## ⚠️ Important Notes

- Never commit `.env` file to Git (already in .gitignore)
- Public keys are safe to use in frontend code
- Service ID and Template IDs are not sensitive
- Restart dev server after changing `.env` file

## 🔧 Troubleshooting

**Emails not sending?**
- Check console for errors
- Verify all IDs are correct
- Check EmailJS dashboard logs
- Verify service email mapping

**Can't find credentials?**
- Public Key: Dashboard → Account
- Service ID: Dashboard → Email Services
- Template ID: Dashboard → Email Templates

## 📚 More Details

See `EMAILJS_NEW_ACCOUNT_SETUP.md` for detailed setup instructions and template examples.

