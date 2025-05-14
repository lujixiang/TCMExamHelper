import { useEffect } from 'react';
import { Platform } from 'react-native-web';

export default function useDocumentTitle(title) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = title;
    }
  }, [title]);
} 