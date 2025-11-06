# EmailJS Password Recovery Setup Guide

This guide will help you set up a custom password recovery email template in EmailJS for Zennest.

## Step 1: Log in to EmailJS

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Log in to your account (or create one if you don't have it)

## Step 2: Create a New Email Template

1. In your EmailJS dashboard, navigate to **Email Templates**
2. Click **"Create New Template"** button
3. Give your template a name: **"Zennest Password Recovery"**

## Step 3: Design Your Email Template

Use the following template structure for your password recovery email:

### Template Design

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Zennest Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #047857 0%, #059669 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                🔐 Reset Your Password
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hello {{user_name}},
                            </p>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We received a request to reset the password for your Zennest account associated with <strong>{{user_email}}</strong>.
                            </p>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We've sent you a password reset link. Please check your inbox for an email from Firebase with the actual reset link (it may be in your spam folder).
                            </p>
                            
                            <!-- Info Box -->
                            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.6;">
                                    <strong>ℹ️ Important:</strong><br>
                                    Look for an email from Firebase Authentication with the subject "Reset your password". Click the link in that email to reset your password. The link expires in 1 hour.
                                </p>
                            </div>
                            
                            <!-- Visit Site Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{{site_url}}/login" style="display: inline-block; padding: 14px 32px; background-color: #047857; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(4, 120, 87, 0.3);">
                                            Go to Login Page
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                                    <strong>⚠️ Security Notice:</strong><br>
                                    If you didn't request a password reset, please ignore this email. Your password will remain unchanged. For your security, this link expires in 1 hour.
                                </p>
                            </div>
                            
                            <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                Need help? Contact us at <a href="mailto:{{support_email}}" style="color: #047857; text-decoration: none;">{{support_email}}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                                © {{current_year}} Zennest. All rights reserved.
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                <a href="{{site_url}}" style="color: #047857; text-decoration: none;">Visit Zennest</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Step 4: Configure Template Variables

Make sure your template includes these variables (they will be replaced automatically):

- `{{user_name}}` - User's name or email username
- `{{user_email}}` - User's email address
- `{{reset_link}}` - Password reset link (Firebase handles this)
- `{{from_name}}` - "Zennest" (sender name)
- `{{support_email}}` - Support email address
- `{{site_url}}` - Website URL
- `{{current_year}}` - Current year

**Important:** These variable names must match exactly (case-sensitive) in your EmailJS template.

## Step 5: Save Your Template

1. Click **"Save"** to save your template
2. Copy the **Template ID** (you'll see it in the URL or template settings)
   - It will look like: `template_xxxxxxxxx`

## Step 6: Update Your Configuration

1. Open `zennest/src/config/emailjs.js`
2. Find the line with `passwordRecoveryTemplateId`
3. Paste your template ID:

```javascript
export const emailjsConfig = {
  serviceId: "service_2pym6wm",
  templateId: "template_3fb5tc4",
  hostTemplateId: "template_89gpyn2",
  passwordRecoveryTemplateId: "template_YOUR_TEMPLATE_ID_HERE", // ← Add your template ID
  publicKey: "p_q8TaCGGwI6hjYNY",
};
```

## Step 7: Test Your Setup

1. Restart your development server
2. Go to the login page
3. Click "Forgot?" next to the password field
4. Enter a test email address
5. Check if the email is received correctly

## How It Works

The password recovery system uses a **dual-email approach** for maximum reliability:

### 1. **Firebase Reset Email** (Primary - Always Sent)
- Firebase automatically generates a secure, time-limited reset link
- This email contains the **actual working reset link**
- Link expires after 1 hour for security
- Users must use this link to reset their password
- This email uses Firebase's default template

### 2. **EmailJS Custom Email** (If template is configured)
- Sends a beautifully branded password recovery notification
- Uses your custom template design with Zennest branding
- **Informational email** - tells users to check their inbox for the Firebase reset link
- Enhances user experience with branded communication

### Important Notes

⚠️ **The reset link in EmailJS template is informational only**

- Firebase generates its own secure reset link automatically
- The actual working reset link is in the Firebase email
- Users should check **both emails** but use the Firebase reset link
- The EmailJS template's `{{reset_link}}` variable is for display purposes

### Why Dual Emails?

1. **Reliability**: Firebase email always contains the working reset link
2. **Branding**: EmailJS provides a custom branded experience
3. **User Experience**: Users get clear instructions via EmailJS
4. **Security**: Firebase handles all security aspects of reset links

**Users receive both emails and should use the reset link from the Firebase email.**

## Troubleshooting

### Email Not Received?
1. Check your spam/junk folder
2. Verify the EmailJS template ID is correct
3. Check EmailJS dashboard for error logs
4. Verify your EmailJS service is active

### Template Variables Not Working?
- Ensure variable names match exactly: `{{user_name}}`, `{{user_email}}`, etc.
- Variable names are case-sensitive
- Check EmailJS template preview to see how variables render

### Firebase Reset Link Not Working?
- Firebase generates its own reset link automatically
- The `reset_link` variable in EmailJS is for informational purposes
- Users should use the Firebase-generated link from either email

## Security Best Practices

1. **Reset Link Expiry**: Firebase automatically expires reset links after 1 hour
2. **One-time Use**: Each reset link can only be used once
3. **Rate Limiting**: Firebase limits password reset requests to prevent abuse
4. **Email Verification**: Only registered email addresses can request resets

## Need Help?

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- Firebase Auth Reset Password: [https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email](https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email)

---

**Note**: The password recovery feature will work even without configuring EmailJS. Firebase will handle the reset emails with its default template. Configure EmailJS for a more branded and customized experience.

