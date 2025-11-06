# Fixing "Recipients address is empty" Error

## Problem
When registering as a host, you get the error: "Failed to send verification email: The recipients address is empty"

## Solution

This error occurs because EmailJS can't find the recipient email address. You need to configure your EmailJS service to map the recipient email field.

## Step-by-Step Fix

### 1. Go to EmailJS Dashboard
- Visit: https://dashboard.emailjs.com/admin
- Navigate to **Email Services**

### 2. Select Your Service
- Click on your service (service ID: `service_2pym6wm`)
- Or find the service you're using for host emails

### 3. Configure "To Email" Mapping
1. In the service settings, find the **"To Email"** field
2. Click on the field mapping dropdown
3. Select which template variable contains the email:
   - **Recommended**: Select `{{to_email}}` 
   - **OR** Select `{{user_email}}` (if that's what your template uses)
   - **OR** Select `{{email}}`

### 4. Verify Your Template Uses the Same Field
1. Go to **Email Templates**
2. Open your host template (`template_89gpyn2`)
3. In the template, make sure you reference the email field you selected:
   - If you mapped `to_email` in service, use `{{to_email}}` in template
   - If you mapped `user_email` in service, use `{{user_email}}` in template

### 5. Test
1. Save all changes
2. Try registering as a host again
3. Check the browser console for detailed logs

## Alternative: Update Template to Match Working Template

If the regular user registration works, check what field it uses:

1. Go to the working template (`template_3fb5tc4`)
2. Check which email field it uses (probably `{{user_email}}`)
3. Configure your host template to use the same field name
4. Update the service mapping to match

## Quick Fix in Code (If Needed)

If you can't change the EmailJS service configuration, you can update the code to match your existing service mapping. Check your regular user registration template to see what field name it uses for the recipient, then use the same field name in `sendHostVerificationEmail`.

## Common Field Names

EmailJS services commonly use:
- `to_email` - Most common for recipient
- `user_email` - Used in templates
- `email` - Simple field name
- `reply_to` - Sometimes used for recipient

## Verification Checklist

- [ ] Service "To Email" field is mapped to a template variable
- [ ] Template variable name matches the code (`to_email`, `user_email`, or `email`)
- [ ] Template ID is correct in `src/config/emailjs.js`
- [ ] Email address is valid (contains @ symbol)
- [ ] Service is active and has quota available

## Debug Steps

1. Open browser console (F12)
2. Look for the log: `📧 Sending host verification email with parameters:`
3. Verify that `to_email` has a valid email address
4. Check EmailJS dashboard → Logs for send attempts and errors

