import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DataProvider } from './src/context/DataContext';
import { Colors } from './src/theme';

// Auth
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Core Assessment Flow
import WordPresentationScreen from './src/screens/WordPresentationScreen';
import TestHubScreen from './src/screens/TestHubScreen';
import ReactionTestScreen from './src/screens/ReactionTestScreen';
import PatternTestScreen from './src/screens/PatternTestScreen';
import ClockTestScreen from './src/screens/ClockTestScreen';
import DelayedRecallScreen from './src/screens/DelayedRecallScreen';
import ResultsScreen from './src/screens/ResultsScreen';

// Dashboard Tabs
import Dashboard from './src/screens/Dashboard';
import GamesScreen from './src/screens/GamesScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Advanced Adaptive Games
import MemoryHeistGame from './src/screens/MemoryHeistGame';
import ReflexTapGame from './src/screens/ReflexTapGame';
import CalibrationGame from './src/screens/CalibrationGame';
import FlashRecallGame from './src/screens/FlashRecallGame';
import RapidStoryGame from './src/screens/RapidStoryGame';

// Navigation UI
import { LayoutDashboard, BrainCircuit, Activity, UserCircle2 } from 'lucide-react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.dark.surface,
          borderTopColor: Colors.dark.border,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.dark.primary,
        tabBarInactiveTintColor: Colors.dark.textDisabled,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
      }}
    >
      <Tab.Screen name="HomeTab" component={Dashboard}
        options={{ tabBarLabel: 'DASHBOARD', tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} /> }} />
      <Tab.Screen name="GamesTab" component={GamesScreen}
        options={{ tabBarLabel: 'NEURO-LAB', tabBarIcon: ({ color }) => <BrainCircuit size={20} color={color} /> }} />
      <Tab.Screen name="InsightsTab" component={InsightsScreen}
        options={{ tabBarLabel: 'INSIGHTS', tabBarIcon: ({ color }) => <Activity size={20} color={color} /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen}
        options={{ tabBarLabel: 'PROFILE', tabBarIcon: ({ color }) => <UserCircle2 size={20} color={color} /> }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{ 
            headerShown: false, 
            cardStyle: { backgroundColor: Colors.dark.background },
            animationEnabled: true,
          }}
        >
          {/* Auth System */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* Assessment Protocol */}
          <Stack.Screen name="WordPresentation" component={WordPresentationScreen} />
          <Stack.Screen name="TestHub" component={TestHubScreen} />
          <Stack.Screen name="ReactionTest" component={ReactionTestScreen} />
          <Stack.Screen name="PatternTest" component={PatternTestScreen} />
          <Stack.Screen name="ClockTest" component={ClockTestScreen} />
          <Stack.Screen name="DelayedRecall" component={DelayedRecallScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />

          {/* Main Interface */}
          <Stack.Screen name="Main" component={MainTabs} />

          {/* Adaptive Neuro-Games */}
          <Stack.Screen name="MemoryHeist" component={MemoryHeistGame} />
          <Stack.Screen name="ReflexTap" component={ReflexTapGame} />
          <Stack.Screen name="Calibration" component={CalibrationGame} />
          <Stack.Screen name="FlashRecall" component={FlashRecallGame} />
          <Stack.Screen name="RapidStory" component={RapidStoryGame} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
