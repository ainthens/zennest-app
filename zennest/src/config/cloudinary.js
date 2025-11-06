// src/config/cloudinary.js
// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'zennest_uploads';

// Validate file before upload
const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 10MB.' };
  }
  
  return { valid: true };
};

// Helper function to upload image to Cloudinary
export const uploadImageToCloudinary = async (file) => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Check if Cloudinary is configured
    if (!CLOUDINARY_CLOUD_NAME) {
      console.error('Cloudinary cloud name not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to your .env file');
      return {
        success: false,
        error: 'Image upload is not configured. Please contact support.'
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Optional: Add folder to organize uploads
    formData.append('folder', 'zennest/listings');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Upload failed' } }));
      console.error('Cloudinary upload error:', errorData);
      throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.secure_url) {
      console.log('Image uploaded successfully:', data.secure_url);
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes
      };
    } else {
      throw new Error('Upload succeeded but no URL returned');
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image. Please try again.'
    };
  }
};

// Helper function to upload multiple images with progress tracking
export const uploadMultipleImages = async (files, onProgress) => {
  const results = [];
  const total = files.length;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress({ loaded: i, total, current: file.name });
    }
    
    const result = await uploadImageToCloudinary(file);
    results.push(result);
    
    if (!result.success) {
      console.warn(`Failed to upload ${file.name}:`, result.error);
    }
  }
  
  if (onProgress) {
    onProgress({ loaded: total, total, completed: true });
  }
  
  return results;
};

// Helper to check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!CLOUDINARY_CLOUD_NAME;
};

