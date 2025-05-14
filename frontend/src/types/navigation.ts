import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Study: undefined;
  Question: undefined;
  Result: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 