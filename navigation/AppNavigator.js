import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Kana Screens
import HomeScreen from '../screens/HomeScreen';
import SessionSetupScreen from '../screens/SessionSetupScreen';
import FlashcardScreen from '../screens/FlashcardScreen';
import QuizSetupScreen from '../screens/QuizSetupScreen';
import QuizScreen from '../screens/QuizScreen';
import ProgressScreen from '../screens/ProgressScreen';

// Kotoba Screens
import KotobaListScreen from '../screens/Kotoba/KotobaListScreen';
import KotobaDetailScreen from '../screens/Kotoba/KotobaDetailScreen';
import KotobaFlashcardScreen from '../screens/Kotoba/KotobaFlashcardScreen';

// JLPT Screens
import JLPTHomeScreen from '../screens/JLPT/JLPTHomeScreen';
import JLPTPracticeScreen from '../screens/JLPT/JLPTPracticeScreen';
import JLPTMockTestScreen from '../screens/JLPT/JLPTMockTestScreen';
import JLPTResultScreen from '../screens/JLPT/JLPTResultScreen';
import JLPTProgressScreen from '../screens/JLPT/JLPTProgressScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function KanaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="SessionSetup" component={SessionSetupScreen} />
      <Stack.Screen name="Flashcard" component={FlashcardScreen} />
      <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
      <Stack.Screen name="QuizPlay" component={QuizScreen} />
      <Stack.Screen name="KotobaDetail" component={KotobaDetailScreen} />
    </Stack.Navigator>
  );
}

function KotobaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KotobaList" component={KotobaListScreen} />
      <Stack.Screen name="KotobaDetail" component={KotobaDetailScreen} />
      <Stack.Screen name="KotobaFlashcard" component={KotobaFlashcardScreen} />
    </Stack.Navigator>
  );
}

function JLPTStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JLPTHome" component={JLPTHomeScreen} />
      <Stack.Screen name="JLPTPractice" component={JLPTPracticeScreen} />
      <Stack.Screen name="JLPTMockTest" component={JLPTMockTestScreen} />
      <Stack.Screen name="JLPTResult" component={JLPTResultScreen} />
      <Stack.Screen name="JLPTProgress" component={JLPTProgressScreen} />
      <Stack.Screen name="KotobaDetail" component={KotobaDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ size }) => {
            const icons = {
              KanaTab: 'あ',
              KotobaTab: '📖',
              JLPTTab: '🏆',
              ProgressTab: '📊',
            };
            return <Text style={{ fontSize: size - 4, fontWeight: '700' }}>{icons[route.name] || '•'}</Text>;
          },
        })}
      >
        <Tab.Screen name="KanaTab" component={KanaStack} options={{ tabBarLabel: 'Kana' }} />
        <Tab.Screen name="KotobaTab" component={KotobaStack} options={{ tabBarLabel: 'Kotoba' }} />
        <Tab.Screen name="JLPTTab" component={JLPTStack} options={{ tabBarLabel: 'JLPT' }} />
        <Tab.Screen name="ProgressTab" component={ProgressScreen} options={{ tabBarLabel: 'Progress' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
