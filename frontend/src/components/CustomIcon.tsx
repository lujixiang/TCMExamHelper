import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { IconProps } from 'react-native-paper/lib/typescript/components/MaterialCommunityIcon';

const CustomIcon: React.FC<IconProps> = ({ name, ...rest }) => {
  if (typeof name !== 'string') {
    return null;
  }

  if (name.startsWith('material-community-')) {
    const iconName = name.replace('material-community-', '');
    return <MaterialCommunityIcons name={iconName} {...rest} />;
  }

  return <MaterialIcons name={name} {...rest} />;
};

export default CustomIcon; 