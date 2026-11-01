import { useEffect, useState } from 'react';
import { Image } from 'react-native';

// height / width from the size saved with the upload, or null
export const storedRatio = item =>
  item?.width && item?.height ? item.height / item.width : null;

const measured = {};

/*
 * height / width of a media item. Older posts have no saved size, so the
 * image (or a video's thumbnail) is measured once and cached by URL.
 */
export default function useMediaRatio(item, fallback = 1) {
  const known = storedRatio(item);
  const source = item?.type === 'video' ? item?.thumbnailUrl : item?.url;
  const [ratio, setRatio] = useState(known || measured[source] || null);

  useEffect(() => {
    if (known || !source) return undefined;
    if (measured[source]) {
      setRatio(measured[source]);
      return undefined;
    }

    let alive = true;
    Image.getSize(
      source,
      (w, h) => {
        if (!w || !h) return;
        measured[source] = h / w;
        if (alive) setRatio(h / w);
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [known, source]);

  return known || ratio || fallback;
}
