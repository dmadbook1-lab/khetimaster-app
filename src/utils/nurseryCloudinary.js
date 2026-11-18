import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '@env';
import i18n from 'i18next';

export const uploadNurseryImage =
  async asset => {
    if (!asset?.uri) {
      throw new Error(
        i18n.t('nurseryCloudinary.invalidImage'),
      );
    }

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_UPLOAD_PRESET
    ) {
      throw new Error(
        i18n.t('nurseryCloudinary.cloudinaryConfigurationIsMissing'),
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
          i18n.t('nurseryCloudinary.imageUploadFailed'),
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