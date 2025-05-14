import { useEffect } from 'react';
import { Platform } from 'react-native-web';

export default function useBackButton(handler) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const onPopState = () => {
        handler();
      };
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    }
    return undefined;
  }, [handler]);
} 