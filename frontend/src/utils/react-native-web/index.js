import * as ReactNativeWeb from 'react-native-web';

// Re-export everything from react-native-web
export * from 'react-native-web';

// Custom Platform implementation
export const Platform = {
  OS: 'web',
  select: (obj) => obj.web || obj.default || {},
  isTesting: false,
};

// Custom I18nManager implementation
export const I18nManager = {
  isRTL: false,
  allowRTL: () => {},
  forceRTL: () => {},
  swapLeftAndRightInRTL: () => {},
};

// Export core components
export const View = ReactNativeWeb.View;
export const Text = ReactNativeWeb.Text;
export const StyleSheet = ReactNativeWeb.StyleSheet;
export const TouchableOpacity = ReactNativeWeb.TouchableOpacity;
export const TouchableHighlight = ReactNativeWeb.TouchableHighlight;
export const ScrollView = ReactNativeWeb.ScrollView;
export const SafeAreaView = ReactNativeWeb.SafeAreaView;
export const FlatList = ReactNativeWeb.FlatList;
export const Image = ReactNativeWeb.Image;

// Export utilities
export const processColor = ReactNativeWeb.processColor;
export const PixelRatio = ReactNativeWeb.PixelRatio;
export const Dimensions = ReactNativeWeb.Dimensions;
export const Animated = ReactNativeWeb.Animated;

// Export native modules and utilities
export const NativeEventEmitter = ReactNativeWeb.NativeEventEmitter;
export const NativeModules = ReactNativeWeb.NativeModules;
export const findNodeHandle = ReactNativeWeb.findNodeHandle; 