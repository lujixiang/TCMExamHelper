declare const __DEV__: boolean;

// 为了解决可能的 React Native Web 类型问题
declare module 'react-native-web' {
  export * from 'react-native';
} 