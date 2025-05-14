import { useCallback } from 'react';
import { Platform } from 'react-native-web';

export function series(...funcs) {
  return function (...args) {
    funcs.forEach(fn => fn && fn(...args));
  };
}

export default function useLinking(ref, { enabled = true, config } = {}) {
  const getInitialState = useCallback(async () => {
    if (!enabled || Platform.OS !== 'web') {
      return undefined;
    }

    const path = window.location.pathname;
    return { path };
  }, [enabled]);

  return {
    getInitialState
  };
} 