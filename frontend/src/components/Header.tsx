import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from '@rneui/themed';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export const Header = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.white,
      borderBottomColor: theme.colors.grey2 
    }]}>
      <Text h2 style={styles.title}>中医考试助手</Text>
      <Text style={[styles.subtitle, { color: theme.colors.grey5 }]}>
        专注于中医执业医师资格考试备考
      </Text>
    </View>
  );
}; 