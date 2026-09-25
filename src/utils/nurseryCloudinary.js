import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '@env';

export const uploadNurseryImage =
  async asset => {
    if (!asset?.uri) {
      throw new Error(
        'Invalid image',
      );
    }

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_UPLOAD_PRESET
    ) {
      throw new Error(
        'Cloudinary configuration is missing',
      );
    }

    const formData =
      new FormData();

    formData.append('file', {
      uri: asset.uri,
      type:
        asset.type ||
        'image/jpeg',
      name:
        asset.fileName ||
        `plant-${Date.now()}.jpg`,
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
          'Image upload failed',
      );
    }

    return data.secure_url;
  };

/*
|--------------------------------------------------------------------------
| UPLOAD MULTIPLE IMAGES
|--------------------------------------------------------------------------
*/

export const uploadNurseryImages =
  async assets => {
    if (!assets?.length) {
      return [];
    }

    const uploadedUrls =
      await Promise.all(
        assets.map(asset =>
          uploadNurseryImage(asset),
        ),
      );

    return uploadedUrls;
  };