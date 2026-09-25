import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '@env';

/*
|--------------------------------------------------------------------------
| UPLOAD IMAGE TO CLOUDINARY
|--------------------------------------------------------------------------
*/

export const uploadImageToCloudinary =
  async imageUri => {
    if (!imageUri) {
      throw new Error(
        'Image URI is required',
      );
    }

    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error(
        'Cloudinary cloud name is missing',
      );
    }

    if (!CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        'Cloudinary upload preset is missing',
      );
    }

    const formData =
      new FormData();

    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `nursery-${Date.now()}.jpg`,
    });

    formData.append(
      'upload_preset',
      CLOUDINARY_UPLOAD_PRESET,
    );

    const response =
      await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          'Cloudinary upload failed',
      );
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    };
  };