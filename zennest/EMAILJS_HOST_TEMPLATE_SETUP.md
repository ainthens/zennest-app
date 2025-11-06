# EmailJS Host Registration Template Setup

This guide explains how to create a new EmailJS template specifically for host registration OTP verification.

## Step 1: Create New EmailJS Template

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Navigate to **Email Templates**
3. Click **"Create New Template"** or **"Add New Template"**
4. Choose a base template or start from scratch

## Step 2: Configure Template

### Template Name
- Name: `Host Registration OTP` (or any name you prefer)

### Template Variables
Your template should use these variables:
- `{{user_name}}` - Host's name (e.g., "John Doe")
- `{{user_email}}` - Host's email address
- `{{otp_code}}` - 6-digit OTP code
- `{{expiry_time}}` - OTP expiration time
- `{{app_name}}` - Application name ("Zennest")
- `{{app_link}}` - Link to verification page
- `{{website_link}}` - Main website link
- `{{current_year}}` - Current year

### Example Template HTML

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            color: #10b981;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .otp-box {
            background-color: #f0fdf4;
            border: 2px dashed #10b981;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
            border-radius: 8px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #10b981;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{app_name}} Host Registration</h1>
        </div>
        
        <p>Hello {{user_name}},</p>
        
        <p>Thank you for registering as a host on {{app_name}}! To complete your registration, please verify your email address using the OTP code below:</p>
        
        <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #6b7280;">Your verification code:</p>
            <div class="otp-code">{{otp_code}}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
                Expires at: {{expiry_time}}
            </p>
        </div>
        
        <p><strong>This code will expire in 15 minutes.</strong></p>
        
        <p>Enter this code on the verification page to activate your host account and proceed with subscription payment.</p>
        
        <div style="text-align: center;">
            <a href="{{app_link}}" class="button">Verify Email</a>
        </div>
        
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If you didn't request this verification, please ignore this email.
        </p>
        
        <div class="footer">
            <p>&copy; {{current_year}} {{app_name}}. All rights reserved.</p>
            <p><a href="{{website_link}}" style="color: #10b981;">Visit Website</a></p>
        </div>
    </div>
</body>
</html>
```

### Template Subject
- Subject: `Verify Your Email - Zennest Host Registration`

## Step 3: Get Template ID

1. After creating the template, you'll see it in your templates list
2. Click on the template to view details
3. Copy the **Template ID** (it will look like `template_xxxxxxxx`)

## Step 4: Update Configuration

Update `src/config/emailjs.js`:

```javascript
export const emailjsConfig = {
  serviceId: "service_2pym6wm",
  templateId: "template_3fb5tc4", // Regular user registration template
  hostTemplateId: "template_YOUR_NEW_TEMPLATE_ID", // Replace with your new template ID
  publicKey: "p_q8TaCGGwI6hjYNY",
};
```

## Step 5: Test the Template

1. Save your configuration file
2. Try registering as a host
3. Check the email for the OTP
4. Verify the OTP code is displayed correctly

## Template Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `user_name` | Full name of the host | "John Doe" |
| `user_email` | Email address | "john@example.com" |
| `otp_code` | 6-digit verification code | "123456" |
| `expiry_time` | Formatted expiration time | "Mon, Jan 15, 2024, 02:30 PM PST" |
| `app_name` | Application name | "Zennest" |
| `app_link` | Verification page link | "https://yourapp.com/host/verify-email" |
| `website_link` | Main website URL | "https://yourapp.com" |
| `current_year` | Current year | "2024" |

## Tips

- Make sure your template is visually distinct from regular user registration template
- Use green/emerald colors to match Zennest branding
- Include clear instructions for hosts
- The OTP should be prominently displayed and easy to read
- Test with different email providers (Gmail, Outlook, etc.)

## Troubleshooting

If emails aren't sending:
1. Check that the template ID is correct in `emailjs.js`
2. Verify the template variables match exactly (case-sensitive)
3. Check EmailJS dashboard for send logs/errors
4. Ensure your EmailJS service is active and has available quota

