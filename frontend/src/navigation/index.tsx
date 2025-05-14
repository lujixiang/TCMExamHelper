import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import QuestionScreen from '../screens/QuestionScreen';
import ResultScreen from '../screens/ResultScreen';
import WrongQuestionsScreen from '../screens/WrongQuestionsScreen';

export type RootStackParamList = {
  Home: undefined;
  Question: { categoryId?: string };
  Result: { score: number; total: number };
  WrongQuestions: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: '中医考试助手' }}
        />
        <Stack.Screen 
          name="Question" 
          component={QuestionScreen} 
          options={{ title: '答题' }}
        />
        <Stack.Screen 
          name="Result" 
          component={ResultScreen} 
          options={{ title: '答题结果' }}
        />
        <Stack.Screen 
          name="WrongQuestions" 
          component={WrongQuestionsScreen} 
          options={{ title: '错题本' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 