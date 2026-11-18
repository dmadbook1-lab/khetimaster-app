import { useEffect, useState } from 'react';
import { Image } from 'react-native';

// height / width from the size saved with the upload, or null
const storedRatio = item =>
  item?.width && item?.height ? item.height / item.width : null;

const sourceOf = item =>
  item?.type === 'video' ? item?.thumbnailUrl : item?.url;

const measured = {};

/*
 * height / width of every media item. Older posts have no saved size, so
 * the image (or a video's thumbnail) is measured once and cached by URL.
 */
export function useMediaRatios(items, fallback = 1) {
  const [, setMeasuredCount] = useState(0);

  useEffect(() => {
    let alive = true;

    (items || []).forEach(item => {
      const source = sourceOf(item);

      if (storedRatio(item) || !source || measured[source]) return;

      Image.getSize(
        source,
        (w, h) => {
          if (!w || !h) return;
          measured[source] = h / w;
          if (alive) setMeasuredCount(count => count + 1);
        },
        () => {},
      );
    });

    return () => {
      alive = false;
    };
  }, [items]);

  return (items || []).map(
    item => storedRatio(item) || measured[sourceOf(item)] || fallback,
  );
}
