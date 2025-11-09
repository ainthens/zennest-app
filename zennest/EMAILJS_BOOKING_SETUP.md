# EmailJS Booking Email Setup Guide

This guide explains how to set up EmailJS templates for booking confirmation and cancellation emails in Zennest.

## Overview

The booking email system sends automated emails to both guests and hosts when:
1. **Booking Confirmation**: A booking is confirmed and payment is processed
2. **Booking Cancellation**: A guest cancels their booking

## Step 1: Create EmailJS Templates

### 1.1 Booking Confirmation Template

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Navigate to **Email Templates**
3. Click **Create New Template**
4. Name it: "Booking Confirmation"
5. Copy the template ID (e.g., `template_xxxxx`)

#### Template Variables

Your template should include these variables:

- `user_email` - Recipient email (automatically mapped to "To Email" field)
- `user_name` - Guest or Host name
- `booking_id` - Booking ID
- `listing_title` - Listing title
- `listing_location` - Listing location
- `check_in` - Check-in date (formatted)
- `check_out` - Check-out date (formatted)
- `guests` - Number of guests
- `nights` - Number of nights
- `total_amount` - Total amount (formatted with currency)
- `category` - Booking category (home/service/experience)
- `host_name` - Host name (for guest emails)
- `guest_name` - Guest name (for host emails)
- `app_name` - "Zennest"
- `website_link` - Website URL
- `booking_link` - Link to view booking
- `current_year` - Current year

#### Example Template HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation - Zennest</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #10b981;">Booking Confirmed! 🎉</h1>
    
    <p>Hello {{user_name}},</p>
    
    <p>Your booking has been confirmed!</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0;">Booking Details</h2>
      <p><strong>Booking ID:</strong> {{booking_id}}</p>
      <p><strong>Listing:</strong> {{listing_title}}</p>
      <p><strong>Location:</strong> {{listing_location}}</p>
      <p><strong>Check-in:</strong> {{check_in}}</p>
      <p><strong>Check-out:</strong> {{check_out}}</p>
      <p><strong>Guests:</strong> {{guests}}</p>
      <p><strong>Nights:</strong> {{nights}}</p>
      <p><strong>Total Amount:</strong> {{total_amount}}</p>
    </div>
    
    <p>
      <a href="{{booking_link}}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Booking Details
      </a>
    </p>
    
    <p>Thank you for using Zennest!</p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #6b7280; font-size: 12px;">
      © {{current_year}} {{app_name}}. All rights reserved.<br>
      <a href="{{website_link}}">{{website_link}}</a>
    </p>
  </div>
</body>
</html>
```

### 1.2 Booking Cancellation Template

1. Create another template named "Booking Cancellation"
2. Copy the template ID

#### Template Variables

Similar to confirmation template, plus:
- `cancelled_by` - Who cancelled the booking (Guest/Host)

#### Example Template HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Cancelled - Zennest</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #ef4444;">Booking Cancelled</h1>
    
    <p>Hello {{user_name}},</p>
    
    <p>This email is to confirm that the following booking has been cancelled:</p>
    
    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
      <h2 style="margin-top: 0;">Booking Details</h2>
      <p><strong>Booking ID:</strong> {{booking_id}}</p>
      <p><strong>Listing:</strong> {{listing_title}}</p>
      <p><strong>Location:</strong> {{listing_location}}</p>
      <p><strong>Check-in:</strong> {{check_in}}</p>
      <p><strong>Check-out:</strong> {{check_out}}</p>
      <p><strong>Total Amount:</strong> {{total_amount}}</p>
      <p><strong>Cancelled by:</strong> {{cancelled_by}}</p>
    </div>
    
    <p>If you have any questions, please contact our support team.</p>
    
    <p>Thank you for using Zennest!</p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #6b7280; font-size: 12px;">
      © {{current_year}} {{app_name}}. All rights reserved.<br>
      <a href="{{website_link}}">{{website_link}}</a>
    </p>
  </div>
</body>
</html>
```

## Step 2: Configure EmailJS Service

1. In EmailJS Dashboard, go to **Email Services**
2. Select your service (or create a new one)
3. Ensure the "To Email" field is mapped to `user_email`
4. Verify your service is active

## Step 3: Update Configuration

1. Open `zennest/src/config/emailjs.js`
2. Add your template IDs:

```javascript
export const emailjsConfig = {
  serviceId: "service_2pym6wm",
  templateId: "template_3fb5tc4",
  hostTemplateId: "template_89gpyn2",
  passwordRecoveryTemplateId: "",
  bookingConfirmationTemplateId: "template_xxxxx", // ADD YOUR TEMPLATE ID HERE
  bookingCancellationTemplateId: "template_yyyyy", // ADD YOUR TEMPLATE ID HERE
  publicKey: "p_q8TaCGGwI6hjYNY",
};
```

## Step 4: Test the Integration

### Test Booking Confirmation

1. Complete a booking with payment
2. Check console logs for email sending status
3. Verify emails are received by guest and host

### Test Booking Cancellation

1. Cancel a booking from UserBookings page
2. Check console logs for email sending status
3. Verify cancellation emails are sent

## Troubleshooting

### Emails Not Sending

1. **Check Template IDs**: Verify template IDs are correct in `emailjs.js`
2. **Check Service Mapping**: Ensure "To Email" is mapped to `user_email` in EmailJS service settings
3. **Check Console Logs**: Look for error messages in browser console
4. **Check EmailJS Dashboard**: Review EmailJS logs for send attempts and errors
5. **Verify Public Key**: Ensure public key is correct and active

### Common Issues

- **Template not found**: Verify template ID is correct
- **Recipient not found**: Check service email mapping
- **Missing variables**: Ensure all required variables are in your template
- **Quota exceeded**: Check your EmailJS plan limits

## Email Variables Reference

### Booking Confirmation

| Variable | Description | Example |
|----------|-------------|---------|
| `user_email` | Recipient email | `guest@example.com` |
| `user_name` | Recipient name | `John Doe` |
| `booking_id` | Booking ID | `abc123` |
| `listing_title` | Listing title | `Cozy Apartment` |
| `listing_location` | Listing location | `Manila, Philippines` |
| `check_in` | Check-in date | `Mon, Dec 25, 2023` |
| `check_out` | Check-out date | `Wed, Dec 27, 2023` |
| `guests` | Number of guests | `2` |
| `nights` | Number of nights | `2` |
| `total_amount` | Total amount | `₱5,000` |
| `category` | Booking category | `home` |
| `host_name` | Host name (guest emails) | `Jane Host` |
| `guest_name` | Guest name (host emails) | `John Doe` |
| `app_name` | App name | `Zennest` |
| `website_link` | Website URL | `https://zennest.com` |
| `booking_link` | Booking link | `https://zennest.com/booking/abc123` |

### Booking Cancellation

All confirmation variables plus:
| Variable | Description | Example |
|----------|-------------|---------|
| `cancelled_by` | Who cancelled | `Guest` or `Host` |

## Notes

- Emails are sent asynchronously and won't block the booking flow
- If email sending fails, the booking will still be processed
- Both guest and host receive emails for confirmation and cancellation
- Email templates can be customized in the EmailJS dashboard
- The system uses the same template for both guest and host, but with different variable values

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Review EmailJS dashboard logs
3. Verify all configuration settings
4. Test with a simple template first

