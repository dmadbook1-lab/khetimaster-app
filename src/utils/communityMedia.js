import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

export const MAX_POST_MEDIA = 10;

export const MAX_REEL_SECONDS = 90;

// Cloudinary's unsigned upload limit for videos on the free plan
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/*
|--------------------------------------------------------------------------
| PICK / CAPTURE
|--------------------------------------------------------------------------
|
| Both return a list of normalised assets:
| {uri, kind: 'image' | 'video', mimeType, fileName, width, height, duration, fileSize}
|
*/

const normalizeAsset = asset => {
  const isVideo =
    asset.type?.startsWith('video') || Number(asset.duration) > 0;

  return {
    uri: asset.uri,
    kind: isVideo ? 'video' : 'image',
    mimeType: asset.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
    fileName:
      asset.fileName ||
      `community-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`,
    width: asset.width || null,
    height: asset.height || null,
    duration: asset.duration || null,
    fileSize: asset.fileSize || null,
  };
};

const handlePickerResult = result => {
  if (result.didCancel) {
    return [];
  }

  if (result.errorCode) {
    throw new Error(
      result.errorCode === 'camera_unavailable'
        ? 'Camera is not available on this device'
        : result.errorMessage || 'Unable to open media',
    );
  }

  return (result.assets || []).filter(asset => asset?.uri).map(normalizeAsset);
};

/*
 * type 'reel' -> one video, 'post' -> up to `selectionLimit` photos / videos.
 */
export const pickCommunityMedia = async ({
  type = 'post',
  selectionLimit = MAX_POST_MEDIA,
} = {}) => {
  const result = await launchImageLibrary({
    mediaType: type === 'reel' ? 'video' : 'mixed',
    selectionLimit: type === 'reel' ? 1 : selectionLimit,
    quality: 0.85,
    maxWidth: 1600,
    maxHeight: 1600,
    videoQuality: 'high',
    // iOS: convert .mov to .mp4 so Android players can stream it too
    formatAsMp4: true,
    includeBase64: false,
  });

  return handlePickerResult(result);
};

// kind: 'photo' | 'video'
export const captureCommunityMedia = async ({ kind = 'video' } = {}) => {
  const result = await launchCamera({
    mediaType: kind,
    quality: 0.85,
    maxWidth: 1600,
    maxHeight: 1600,
    videoQuality: 'high',
    durationLimit: MAX_REEL_SECONDS,
    formatAsMp4: true,
    saveToPhotos: false,
    includeBase64: false,
  });

  return handlePickerResult(result);
};

/*
 * Returns an error message, or null when the asset can be shared.
 */
export const validateCommunityAsset = (asset, type) => {
  if (type === 'reel' && asset.kind !== 'video') {
    return 'Reels need a video. Pick a video from your gallery or record one.';
  }

  if (asset.kind === 'video' && asset.fileSize > MAX_VIDEO_BYTES) {
    return 'This video is larger than 100 MB. Please pick a shorter video.';
  }

  if (type === 'reel' && asset.duration > MAX_REEL_SECONDS + 1) {
    return `Reels can be up to ${MAX_REEL_SECONDS} seconds long.`;
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| CLOUDINARY URL HELPERS
|--------------------------------------------------------------------------
*/

/*
 * Cloudinary renders a poster frame from a video when the extension is
 * swapped for .jpg (so_0 = first frame).
 */
export const videoThumbnailUrl = videoUrl => {
  if (!videoUrl || !videoUrl.includes('/video/upload/')) {
    return '';
  }

  return videoUrl
    .replace('/video/upload/', '/video/upload/so_0/')
    .replace(/\.[a-z0-9]+(\?.*)?$/i, '.jpg');
};

/*
|--------------------------------------------------------------------------
| UPLOAD
|--------------------------------------------------------------------------
|
| XMLHttpRequest instead of fetch so upload progress can be shown.
|
*/

export const uploadCommunityAsset = (asset, onProgress) =>
  new Promise((resolve, reject) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      reject(new Error('Cloudinary configuration is missing'));
      return;
    }

    const resource = asset.kind === 'video' ? 'video' : 'image';

    const formData = new FormData();

    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType,
      name: asset.fileName,
    });

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'khetimaster/community');

    const xhr = new XMLHttpRequest();

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resource}/upload`,
    );

    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      let data = null;

      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }

      if (xhr.status < 200 || xhr.status >= 300 || !data?.secure_url) {
        reject(new Error(data?.error?.message || 'Upload failed'));
        return;
      }

      resolve({
        url: data.secure_url,
        type: resource,
        thumbnailUrl:
          resource === 'video' ? videoThumbnailUrl(data.secure_url) : '',
        width: data.width || asset.width,
        height: data.height || asset.height,
        duration: data.duration || asset.duration,
      });
    };

    xhr.onerror = () =>
      reject(new Error('Upload failed. Check your internet connection.'));

    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    xhr.send(formData);
  });

/*
 * Uploads one at a time and reports overall progress (0-1).
 */
export const uploadCommunityAssets = async (assets, onProgress) => {
  const uploaded = [];

  for (let index = 0; index < assets.length; index += 1) {
    const media = await uploadCommunityAsset(assets[index], fraction =>
      onProgress?.((index + fraction) / assets.length),
    );

    uploaded.push(media);
  }

  onProgress?.(1);

  return uploaded;
};
