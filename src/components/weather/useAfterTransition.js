import { useEffect, useState } from 'react';

/*
 * false while the screen is sliding in, then true. Heavy sections wait
 * for it so the screen opens instantly. Falls back to a short timer in
 * case the transition event doesn't arrive.
 */
export default function useAfterTransition(navigation, fallbackMs = 380) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };

    const unsubscribe = navigation?.addListener?.('transitionEnd', finish);
    const timer = setTimeout(finish, fallbackMs);

    return () => {
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, [navigation, fallbackMs]);

  return ready;
}
