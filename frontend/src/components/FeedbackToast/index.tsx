import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface FeedbackToastProps {
  visible: boolean;
  type: 'success' | 'error';
  message: string;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({
  visible,
  type,
  message,
}) => {
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, transform: [{ translateY }] },
      ]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderRadius: 4,
    margin: 16,
    elevation: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
}); 