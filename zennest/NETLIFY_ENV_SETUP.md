# Netlify Environment Variables Setup Guide

## 🎯 Quick Setup for Netlify

### Step 1: Add Environment Variables in Netlify Dashboard

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Click **"Add a variable"**
4. Add the following variables:

#### Required Variables:

```
VITE_PAYPAL_CLIENT_ID = AUh8H1MBh2qSPKxSU0ZApsB3WN8SFOZ6E4vWKtGMD347Htb-NFV2wsVOh-rRr1_XHwZUgIOEJ06caKoU
```

#### Optional (if you use them):

```
VITE_CLOUDINARY_CLOUD_NAME = dc9sr7snl
VITE_CLOUDINARY_UPLOAD_PRESET = zennest_uploads
VITE_EMAILJS_PUBLIC_KEY = UzKmW-bFf0VVts5x5
VITE_EMAILJS_SERVICE_ID = service_5t2qmca
```

### Step 2: Set Variable Scopes

For each variable, set the scope:
- ✅ **Production** - For live site
- ✅ **Deploy Previews** - For pull request previews
- ✅ **Branch deploys** - For branch-specific deployments

### Step 3: Redeploy

**Important:** Environment variables only apply to NEW deployments!

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Or push a new commit to trigger automatic deployment

---

## 📝 Netlify Configuration File

I've created `netlify.toml` with proper build settings. This ensures:
- ✅ Correct build command
- ✅ Correct publish directory
- ✅ Environment variables are loaded
- ✅ Proper redirects for SPA routing

---

## 🔍 Verify Environment Variables

### In Netlify Dashboard:
1. Go to: Site settings → Environment variables
2. Verify all `VITE_*` variables are listed
3. Check they're set for all scopes you need

### In Deployment Logs:
1. Go to: Deploys → Latest deploy → Build log
2. Look for: "Environment variables loaded"
3. Check for any warnings about missing variables

### In Browser Console (Production):
```javascript
// This won't work in production (security), but you can check:
console.log('PayPal configured:', !!import.meta.env.VITE_PAYPAL_CLIENT_ID);
```

---

## 🚨 Common Issues

### Issue: Variables not working after deployment
**Solution:**
- Variables only apply to NEW deployments
- Trigger a new deploy after adding variables
- Clear Netlify build cache if needed

### Issue: Variables work locally but not on Netlify
**Solution:**
- Check variable name starts with `VITE_`
- Verify variable is set for correct scope (Production)
- Check for typos in variable names
- Ensure you redeployed after adding variables

### Issue: Build fails
**Solution:**
- Check build command in `netlify.toml`
- Verify Node version is compatible
- Check build logs for specific errors

---

## 📋 Environment Variables Checklist

- [ ] `VITE_PAYPAL_CLIENT_ID` added to Netlify
- [ ] Variable set for Production scope
- [ ] Variable set for Deploy Previews (optional)
- [ ] Variable set for Branch deploys (optional)
- [ ] New deployment triggered
- [ ] PayPal buttons working on production site

---

## 🔐 Security Notes

- ✅ Environment variables in Netlify are encrypted
- ✅ `VITE_*` variables are exposed to client-side (this is normal for Vite)
- ✅ Never commit `.env` files to Git
- ✅ Use different Client IDs for Sandbox (dev) and Live (production)

---

## 🎯 Production vs Development

### Development (Local):
- Uses `.env` file
- Sandbox PayPal Client ID (for testing)

### Production (Netlify):
- Uses Netlify Environment Variables
- Live PayPal Client ID (for real payments)
- Set in Netlify Dashboard

---

**Need Help?** Check the deployment logs in Netlify dashboard for specific errors.

