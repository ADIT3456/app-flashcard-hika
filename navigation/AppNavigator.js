import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import SessionSetupScreen from '../screens/SessionSetupScreen';
import FlashcardScreen from '../screens/FlashcardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PracticeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SessionSetup" component={SessionSetupScreen} />
      <Stack.Screen name="Flashcard" component={FlashcardScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1a73e8',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { borderTopWidth: 1, borderTopColor: '#eee' },
          tabBarLabel: route.name,
          tabBarIcon: ({ color, size }) => {
            const icons = { Home: '🏠', Practice: '📚' };
            return <Text style={{ fontSize: size - 4 }}>{icons[route.name]}</Text>;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Practice" component={PracticeStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
