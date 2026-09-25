import {
  launchImageLibrary,
} from 'react-native-image-picker';

/*
|--------------------------------------------------------------------------
| PICK NURSERY IMAGES
|--------------------------------------------------------------------------
*/

export const pickNurseryImages =
  async ({
    selectionLimit = 5,
  } = {}) => {
    const result =
      await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit,
        quality: 0.85,
        includeBase64: false,
      });

    if (result.didCancel) {
      return [];
    }

    if (result.errorCode) {
      throw new Error(
        result.errorMessage ||
          'Unable to select images',
      );
    }

    return (
      result.assets || []
    );
  };