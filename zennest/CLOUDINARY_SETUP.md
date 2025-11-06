# Cloudinary Image Upload Setup Guide

This guide will help you set up Cloudinary for image uploads in your Zennest application.

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Click "Sign Up" (it's free)
3. Complete the registration process

## Step 2: Get Your Cloud Name

1. After logging in, you'll see your **Dashboard**
2. At the top of the dashboard, you'll find your **Cloud Name** (e.g., `dxyabc123`)
3. Copy this cloud name - you'll need it for the `.env` file

## Step 3: Create an Upload Preset

1. In the Cloudinary dashboard, go to **Settings** (gear icon in the top right)
2. Click on **Upload** in the left sidebar
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `zennest_uploads`
   - **Signing Mode**: Choose **Unsigned** (this allows uploads from your frontend)
   - **Folder**: `zennest/listings` (optional, helps organize your uploads)
   - **Format**: Leave as default or set to "auto" for automatic format optimization
   - **Transformation**: You can add image transformations here if needed
6. Click **Save**

## Step 4: Configure Environment Variables

1. In your project root (`zennest` folder), create a `.env` file (if it doesn't exist)
2. Add the following variables:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
VITE_CLOUDINARY_UPLOAD_PRESET=zennest_uploads
```

Replace `your-cloud-name-here` with your actual Cloud Name from Step 2.

Example:
```env
VITE_CLOUDINARY_CLOUD_NAME=dxyabc123
VITE_CLOUDINARY_UPLOAD_PRESET=zennest_uploads
```

## Step 5: Restart Your Development Server

After adding the environment variables:

1. Stop your development server (Ctrl+C)
2. Start it again with `npm run dev`
3. Environment variables are only loaded when the server starts

## Step 6: Test the Upload

1. Go to your host dashboard
2. Navigate to "Create New Listing"
3. Try uploading an image
4. Check the browser console for any errors
5. If successful, you should see the image appear in the preview grid

## Troubleshooting

### "Image upload is not configured" error
- Make sure your `.env` file is in the `zennest` folder (not in `src`)
- Verify the variable names start with `VITE_`
- Restart your dev server after adding environment variables

### "Upload preset not found" error
- Verify the preset name matches exactly (case-sensitive)
- Make sure the preset is set to "Unsigned"
- Check that you saved the preset in Cloudinary dashboard

### Images not uploading
- Check browser console for detailed error messages
- Verify your Cloud Name is correct
- Make sure you have internet connection
- Check Cloudinary dashboard for any account limits or issues

### File size errors
- Maximum file size is 10MB per image
- Supported formats: JPEG, JPG, PNG, GIF, WebP

## Features Included

✅ **File Validation**: Checks file type and size before upload
✅ **Multiple Image Upload**: Upload several images at once
✅ **Progress Feedback**: Visual feedback during upload
✅ **Error Handling**: Clear error messages for failed uploads
✅ **Image Preview**: See uploaded images before saving listing
✅ **Image Removal**: Remove images before saving

## Security Notes

- Using **unsigned upload presets** means anyone can upload to your Cloudinary account
- Consider setting up resource limits in Cloudinary (Settings > Security)
- You can add authentication later if needed
- Monitor your Cloudinary usage in the dashboard

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [Cloudinary Console](https://console.cloudinary.com/)

