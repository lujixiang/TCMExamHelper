import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ButtonProps, useTheme } from '@rneui/themed';

interface MainButtonProps extends ButtonProps {
  width?: number | string;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export const MainButton = ({ 
  width = '100%',
  buttonStyle,
  titleStyle,
  ...props 
}: MainButtonProps) => {
  const { theme } = useTheme();

  return (
    <Button
      {...props}
      buttonStyle={[
        styles.button,
        { backgroundColor: theme.colors.primary, width },
        buttonStyle,
      ]}
      titleStyle={[styles.title, titleStyle]}
      raised
    />
  );
}; 