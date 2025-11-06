# Host Dashboard Setup Guide

This document outlines the setup requirements for the Zennest Host Dashboard system.

## Features Implemented

✅ **Host Registration** - Email/SMS registration with PayPal subscription payment
✅ **Listing Management** - Create/edit listings with categories (Home, Experience, Service)
✅ **Save as Draft** - Listings can be saved as drafts before publishing
✅ **Listing Details** - Rate, Discount, Promos, Images, Location, Description
✅ **Messages** - Host-guest communication system
✅ **Calendar** - Availability and booking calendar management
✅ **Dashboard** - Today's check-ins and upcoming bookings overview
✅ **Payment Methods** - Configure how hosts receive payments (Bank, PayPal, Stripe)
✅ **Account Settings** - Profile, Bookings, Coupon management
✅ **Points & Rewards** - Loyalty system with tiered rewards

## Environment Variables Setup

Create a `.env` file in the `zennest` directory with the following variables:

```env
# PayPal Configuration (Sandbox)
# Get your client ID from: https://developer.paypal.com/dashboard/applications/sandbox
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id

# Cloudinary Configuration
# Get these from: https://console.cloudinary.com/
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=zennest_uploads
```

## Firebase Setup

Firebase is already configured in `src/config/firebase.js`. Make sure your Firestore database has the following collections:

### Collections Structure:

1. **hosts** - Host profiles
   - `firstName`, `lastName`, `email`, `phone`
   - `subscriptionStatus`, `subscriptionPaymentId`, `subscriptionStartDate`
   - `points`, `totalEarnings`
   - `paymentMethods` (array)
   - `createdAt`, `updatedAt`

2. **listings** - Property/experience/service listings
   - `hostId`, `title`, `category` (home/experience/service)
   - `description`, `location`
   - `rate`, `discount`, `promo`
   - `images` (array of URLs)
   - `status` (draft/published)
   - `views`, `bookings`, `rating`
   - `createdAt`, `updatedAt`

3. **bookings** - Guest bookings
   - `hostId`, `guestId`, `guestName`, `listingId`, `listingTitle`
   - `checkIn`, `checkOut`
   - `totalAmount`, `status`
   - `createdAt`, `updatedAt`

4. **messages** - Host-guest messages
   - `hostId`, `guestId`, `listingId`
   - `senderId`, `senderName`, `message`, `type`
   - `read`, `createdAt`

5. **coupons** - Discount coupons
   - `hostId`, `code`
   - `discount`, `discountType` (percentage/fixed)
   - `validFrom`, `validUntil`
   - `maxUses`, `usageCount`
   - `minPurchase`, `active`
   - `createdAt`

6. **pointsTransactions** - Points history
   - `hostId`, `points`, `reason`, `balance`
   - `createdAt`

## PayPal Sandbox Setup

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a new app or use an existing one
3. Copy the Sandbox Client ID
4. Add it to your `.env` file as `VITE_PAYPAL_CLIENT_ID`

### Testing PayPal Payments:
- Use sandbox test accounts from PayPal Dashboard
- Test with credit card: `4111111111111111`
- Expiry: Any future date
- CVV: Any 3 digits

## Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name from the dashboard
3. Create an Upload Preset:
   - Go to Settings > Upload
   - Create a new unsigned upload preset named `zennest_uploads`
   - Set it to allow unsigned uploads
4. Add to `.env`:
   - `VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name`
   - `VITE_CLOUDINARY_UPLOAD_PRESET=zennest_uploads`

## Routes

### Host Registration & Onboarding
- `/host/register` - Host registration with PayPal payment
- `/host/onboarding` - Host onboarding steps

### Host Dashboard (Protected)
- `/host/dashboard` - Dashboard overview (Today & Upcomings)
- `/host/listings` - List all listings
- `/host/listings/new` - Create new listing
- `/host/listings/:id/edit` - Edit existing listing
- `/host/calendar` - Calendar view of bookings
- `/host/messages` - Messages with guests
- `/host/payments` - Payment methods configuration
- `/host/rewards` - Points & Rewards system
- `/host/settings` - Account settings (Profile, Bookings, Coupons)

## Key Features Breakdown

### 1. Host Registration Flow
- User fills registration form
- Creates Firebase account
- Creates host profile in Firestore
- Proceeds to PayPal payment
- Activates subscription upon successful payment

### 2. Listing Management
- **Categories**: Home, Experience, Service
- **Fields**: Title, Description, Location, Rate, Discount, Promo Code
- **Images**: Multiple image upload via Cloudinary
- **Status**: Draft or Published
- **Features**: Save as draft, edit, delete

### 3. Dashboard Overview
- **Statistics**: Published/Draft listings, Today's check-ins, Earnings, Rating, Views
- **Today's Bookings**: List of check-ins for today
- **Upcoming Bookings**: Next 5 upcoming bookings

### 4. Calendar
- **Month View**: Calendar grid showing bookings
- **List View**: Chronological list of all bookings
- Filter by listing

### 5. Messages
- Grouped by conversation (guest + listing)
- Real-time message display
- Reply functionality

### 6. Payment Methods
- Add/edit/delete payment methods
- Support for: Bank Account, PayPal, Stripe
- Set default payment method

### 7. Settings
- **Profile**: Edit personal information
- **Bookings**: View booking history
- **Coupons**: Create and manage discount coupons

### 8. Points & Rewards
- Earn points for various actions
- Tier system (Bronze, Silver, Gold, Platinum)
- Redeemable rewards
- Points transaction history

## Usage

1. **Register as Host**: Navigate to `/host/register`
2. **Complete Payment**: Use PayPal sandbox to complete subscription
3. **Create Listings**: Go to Listings > Create New Listing
4. **Manage Bookings**: View in Dashboard, Calendar, or Settings > Bookings
5. **Configure Payments**: Set up how you receive payments in Payments section
6. **Track Rewards**: Monitor points and redeem rewards

## Important Notes

- All host routes are protected and require authentication
- PayPal uses sandbox mode for testing
- Cloudinary handles all image uploads
- Firestore stores all data (listings, bookings, messages, etc.)
- Hosts must have an active subscription to access dashboard

## Troubleshooting

1. **PayPal not loading**: Check `VITE_PAYPAL_CLIENT_ID` in `.env`
2. **Images not uploading**: Verify Cloudinary credentials and upload preset
3. **Data not loading**: Check Firebase configuration and Firestore permissions
4. **Routes not working**: Ensure all imports in `App.jsx` are correct

## Future Enhancements (Suggestions)

- Real-time notifications for new bookings/messages
- Advanced analytics dashboard
- Bulk listing management
- Integration with more payment providers
- SMS verification for phone numbers
- Export bookings to CSV/PDF
- Integration with external calendar systems (Google Calendar, iCal)

