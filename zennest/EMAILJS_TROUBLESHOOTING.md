# EmailJS Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Duplicate Keys in Config (FIXED ✅)
**Problem**: You had duplicate keys in the config file
**Solution**: Fixed - removed duplicates, now using your new credentials

### Issue 2: Using Old Template IDs ❌
**Problem**: You're using template IDs from your OLD EmailJS account
**Current**: `template_3fb5tc4`, `template_89gpyn2` (from old account)
**Solution**: You need to create NEW templates in your NEW account

**Steps to Fix**:
1. Go to: https://dashboard.emailjs.com/admin/template
2. Create a NEW template for "User Registration"
3. Copy the NEW template ID
4. Create a NEW template for "Host Registration"  
5. Copy the NEW template ID
6. Update `src/config/emailjs.js` with the new template IDs

### Issue 3: Email Service Not Configured ❌
**Problem**: Your email service needs to be configured to map the recipient email

**Steps to Fix**:
1. Go to: https://dashboard.emailjs.com/admin/integration
2. Click on your service: `service_5t2qmca`
3. Go to **Settings** or **Integration** tab
4. Find the **"To Email"** field mapping
5. Set it to map to: `user_email` (or `to_email` - check what your template uses)
6. Save the configuration

### Issue 4: Templates Don't Exist in New Account ❌
**Problem**: Your new account doesn't have the templates yet

**Solution**: Create the templates:
1. Go to: https://dashboard.emailjs.com/admin/template
2. Click **Create New Template**
3. For each template, you need:
   - User Registration Template
   - Host Registration Template
   - Booking Confirmation Template (you have this: `template_0ayttfm` ✅)
   - Booking Cancellation Template (you have this: `template_o0l2xs8` ✅)

## Quick Diagnostic Steps

### Step 1: Check Your Configuration
Open `src/config/emailjs.js` and verify:
- ✅ `publicKey`: `UzKmW-bFf0VVts5x5` (your new key)
- ✅ `serviceId`: `service_5t2qmca` (your new service)
- ❌ `templateId`: `template_3fb5tc4` (OLD - needs to be NEW)
- ❌ `hostTemplateId`: `template_89gpyn2` (OLD - needs to be NEW)
- ✅ `bookingConfirmationTemplateId`: `template_0ayttfm` (NEW - good!)
- ✅ `bookingCancellationTemplateId`: `template_o0l2xs8` (NEW - good!)

### Step 2: Check Browser Console
1. Open your app in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Try to register a user or send an email
5. Look for EmailJS errors:
   - `❌ Failed to send email`
   - `Template not found`
   - `Service not found`
   - `Invalid public key`
   - `Recipients address is empty`

### Step 3: Check EmailJS Dashboard Logs
1. Go to: https://dashboard.emailjs.com/admin
2. Click on **Logs** in the sidebar
3. Check for failed email attempts
4. Look at the error messages

### Step 4: Verify Service Configuration
1. Go to: https://dashboard.emailjs.com/admin/integration
2. Click on `service_5t2qmca`
3. Verify:
   - Service is **Active**
   - **"To Email"** is mapped correctly
   - Service is connected to your email provider

## Common Error Messages and Solutions

### Error: "Template not found" or "Template ID invalid"
**Cause**: Using template ID from old account
**Solution**: 
1. Create new template in new account
2. Copy new template ID
3. Update config file

### Error: "Service not found" or "Service ID invalid"
**Cause**: Service ID doesn't exist or is from old account
**Solution**: 
1. Verify service ID: `service_5t2qmca`
2. Make sure service is active
3. Check service exists in your new account

### Error: "Recipients address is empty"
**Cause**: Email service not configured to map recipient email
**Solution**:
1. Go to service settings
2. Map "To Email" to `user_email` (or `to_email`)
3. Save configuration

### Error: "Invalid public key"
**Cause**: Public key is wrong or from old account
**Solution**:
1. Get public key from: https://dashboard.emailjs.com/admin/account
2. Verify it matches: `UzKmW-bFf0VVts5x5`
3. Update config if different

### Error: "Quota exceeded"
**Cause**: Reached email sending limit
**Solution**:
1. Check your EmailJS plan limits
2. Upgrade plan if needed
3. Wait for quota reset

## Action Items for You

### ✅ Already Done:
- [x] Fixed duplicate keys in config
- [x] Updated public key: `UzKmW-bFf0VVts5x5`
- [x] Updated service ID: `service_5t2qmca`
- [x] Booking confirmation template: `template_0ayttfm`
- [x] Booking cancellation template: `template_o0l2xs8`

### ❌ Need to Do:
- [ ] Create NEW User Registration template in new account
- [ ] Get NEW template ID for User Registration
- [ ] Create NEW Host Registration template in new account
- [ ] Get NEW template ID for Host Registration
- [ ] Update `templateId` in config with NEW template ID
- [ ] Update `hostTemplateId` in config with NEW template ID
- [ ] Verify service email mapping (To Email → `user_email`)
- [ ] Test email sending

## Testing After Fix

1. **Test User Registration Email**:
   - Try registering a new user
   - Check console for errors
   - Check EmailJS logs
   - Verify email received

2. **Test Host Registration Email**:
   - Try registering as host
   - Check console for errors
   - Check EmailJS logs
   - Verify email received

3. **Test Booking Confirmation**:
   - Complete a booking
   - Check console for errors
   - Check EmailJS logs
   - Verify emails received (guest and host)

4. **Test Booking Cancellation**:
   - Cancel a booking
   - Check console for errors
   - Check EmailJS logs
   - Verify emails received (guest and host)

## Quick Fix Checklist

- [ ] Config file has no duplicate keys ✅ (Fixed)
- [ ] Public key is from new account ✅ (`UzKmW-bFf0VVts5x5`)
- [ ] Service ID is from new account ✅ (`service_5t2qmca`)
- [ ] User Registration template ID is from NEW account ❌ (Need to create)
- [ ] Host Registration template ID is from NEW account ❌ (Need to create)
- [ ] Booking templates are from new account ✅
- [ ] Email service mapping is configured ❌ (Need to verify)
- [ ] All templates exist in new account ❌ (Need to create User/Host templates)

## Still Not Working?

1. **Check Browser Console**: Look for specific error messages
2. **Check EmailJS Logs**: Dashboard → Logs → See detailed errors
3. **Verify All IDs**: Make sure all IDs are from your NEW account
4. **Test with Simple Template**: Create a simple test template to verify service works
5. **Check Service Status**: Make sure service is active and connected

## Next Steps

1. Create User Registration template in your NEW EmailJS account
2. Create Host Registration template in your NEW EmailJS account
3. Update the config file with the new template IDs
4. Verify service email mapping
5. Test email sending
6. Check console and logs for any remaining errors

