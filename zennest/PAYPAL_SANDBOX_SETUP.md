# PayPal Sandbox Setup Guide

This guide will walk you through setting up PayPal Sandbox for testing payments in your Zennest Host application.

## Step 1: Create a PayPal Developer Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Click **"Log in to Dashboard"** (top right)
3. Log in with your PayPal account, or create a new PayPal account if you don't have one
4. Accept the Developer Agreement if prompted

## Step 2: Navigate to Sandbox Apps

1. Once logged in, you'll see the Dashboard
2. In the left sidebar, click on **"My Apps & Credentials"**
3. You'll see options for **Live** and **Sandbox** tabs at the top
4. Make sure you're on the **"Sandbox"** tab (not Live)

## Step 3: Create a Sandbox App

1. Under the Sandbox tab, look for **"REST API apps"** section
2. Click **"Create App"** button
3. Fill in the app details:
   - **App Name**: `Zennest Host Subscription` (or any name you prefer)
   - **Merchant**: Select your sandbox business account (if you don't have one, see Step 4)
   - **Features**: 
     - ✅ Accept Payments
     - ✅ Future Payments (for subscriptions)
   - **App Type**: `Merchant` (for receiving payments)
4. Click **"Create App"**

## Step 4: Create Sandbox Test Accounts (If Needed)

If you don't have sandbox accounts yet:

1. In the PayPal Developer Dashboard, go to **"Accounts"** in the left sidebar
2. Click **"Create account"**
3. You'll need at least:
   - **Business Account** (for your platform to receive payments)
   - **Personal Account** (for testing as a host making payments)
4. For Business Account:
   - Type: Business
   - Email: Use a test email (e.g., `zennest-business@example.com`)
   - Password: Create a test password
   - Click **"Create"**
5. For Personal Account:
   - Type: Personal
   - Email: Use a test email (e.g., `test-host@example.com`)
   - Password: Create a test password
   - Click **"Create"**

## Step 5: Get Your Client ID

1. Go back to **"My Apps & Credentials"** → **"Sandbox"** tab
2. Find the app you just created
3. You'll see two important values:
   - **Client ID** (starts with something like `AbCdEf...`)
   - **Secret** (you might need this for server-side operations later)
4. **Copy the Client ID** - you'll need this for your `.env` file

## Step 6: Configure Your Application

1. In your `zennest` folder, create a `.env` file (if it doesn't exist)
2. Add your PayPal Client ID:

```env
VITE_PAYPAL_CLIENT_ID=your-client-id-here
```

Replace `your-client-id-here` with the actual Client ID you copied.

**Example:**
```env
VITE_PAYPAL_CLIENT_ID=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

3. **Important**: 
   - The `.env` file should be in the `zennest` folder (same level as `package.json`)
   - Never commit `.env` to git (it should be in `.gitignore`)
   - Restart your development server after adding environment variables

## Step 7: Test the Integration

### Using Sandbox Test Accounts:

1. **Restart your dev server** (if it was running):
   ```bash
   npm run dev
   ```

2. Navigate to `/host/register` in your application

3. Fill out the registration form

4. When you reach the PayPal payment step, you'll see the PayPal payment button

5. Click the PayPal button and log in using one of your sandbox test accounts:
   - Use the email and password from your sandbox Personal Account
   - PayPal sandbox login is separate from real PayPal

### Test Payment Scenarios:

**✅ Successful Payment:**
- Use any sandbox account
- Complete the payment flow
- Your subscription should activate

**❌ Test Failed Payment:**
- PayPal sandbox doesn't have built-in failure simulation
- You can test error handling by canceling the payment flow

## Step 8: Test with Credit Card (Alternative)

You can also test with a credit card in sandbox mode:

1. On the PayPal payment screen, look for **"Pay with Debit or Credit Card"**
2. Use these test card numbers:
   - **Card Number**: `4111111111111111` (Visa test card)
   - **Expiry Date**: Any future date (e.g., `12/25`)
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Name**: Any name
   - **ZIP Code**: Any 5 digits

## Important Notes

⚠️ **Sandbox vs Live:**
- Sandbox is for testing only - no real money is processed
- To go live, you'll need to create a Live app and get a Live Client ID
- Never use sandbox credentials in production

⚠️ **Environment Variables:**
- Changes to `.env` require restarting the dev server
- Make sure `VITE_` prefix is used for Vite environment variables

⚠️ **Security:**
- Never expose your Secret key in frontend code
- Client ID is safe to expose in frontend (that's its purpose)
- For production, use server-side payment processing for sensitive operations

## Troubleshooting

### Issue: PayPal button not showing
- **Solution**: Check that `VITE_PAYPAL_CLIENT_ID` is set correctly in `.env`
- Restart your dev server
- Check browser console for errors

### Issue: Payment fails immediately
- **Solution**: Verify you're using a sandbox test account, not a real PayPal account
- Check that the app has the correct permissions enabled

### Issue: "Invalid Client ID" error
- **Solution**: 
  - Verify you copied the Client ID correctly (no extra spaces)
  - Make sure you're using Sandbox Client ID, not Live
  - Ensure the `.env` file is in the correct location

### Issue: Environment variable not loading
- **Solution**:
  - Make sure the variable name starts with `VITE_`
  - Restart the dev server completely
  - Check that `.env` is in the `zennest` folder (project root)

## Next Steps

Once sandbox is working:
1. Test the full registration flow
2. Test subscription payment processing
3. Verify subscription status updates in your database
4. Test different subscription plans (Monthly vs Annual)

## Production Setup (For Later)

When ready to go live:
1. Switch to **"Live"** tab in PayPal Developer Dashboard
2. Create a Live app (similar process)
3. Get Live Client ID
4. Update `.env` with Live Client ID
5. Test with small amounts first
6. Complete PayPal business verification if required

---

**Need Help?**
- PayPal Developer Docs: https://developer.paypal.com/docs/
- PayPal Sandbox Testing Guide: https://developer.paypal.com/docs/api-basics/sandbox/
- PayPal Support: https://www.paypal.com/support

