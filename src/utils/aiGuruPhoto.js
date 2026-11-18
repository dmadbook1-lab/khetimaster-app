import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import i18n from 'i18next';

/*
|--------------------------------------------------------------------------
| CROP PHOTO FOR AI GURU
|--------------------------------------------------------------------------
|
| Picks one photo, resized so the upload stays small (the backend accepts
| up to ~3 MB) while leaves and spots stay clear enough to diagnose.
|
| Resolves { uri, base64, mimeType } or null when the farmer cancels.
|
*/

const OPTIONS = {
  mediaType: 'photo',
  selectionLimit: 1,
  includeBase64: true,
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.7,
  saveToPhotos: false,
};

export const pickAiGuruPhoto = async ({ camera = false } = {}) => {
  const result = camera
    ? await launchCamera({ ...OPTIONS, cameraType: 'back' })
    : await launchImageLibrary(OPTIONS);

  if (result.didCancel) {
    return null;
  }

  if (result.errorCode) {
    throw new Error(
      result.errorCode === 'camera_unavailable'
        ? i18n.t('aiGuruPhoto.cameraIsNotAvailableOn')
        : result.errorCode === 'permission'
        ? i18n.t('aiGuruPhoto.allowCameraPhotoAccessIn')
        : result.errorMessage || i18n.t('aiGuruPhoto.unableToGetThePhoto'),
    );
  }

  const asset = result.assets?.[0];

  if (!asset?.base64) {
    throw new Error(i18n.t('aiGuruPhoto.unableToReadThePhoto'));
  }

  return {
    uri: asset.uri,
    base64: asset.base64,
    mimeType: asset.type || 'image/jpeg',
  };
};
