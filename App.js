import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, setDoc } from 'firebase/firestore';

// Firebase and Screens
import { auth, firestore } from './firebase';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgetScreen from './src/screens/ForgetScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateAdScreen from './src/screens/CreateAdScreen';
import AccountScreen from './src/screens/AccountScreen';
import EditAdScreen from './src/screens/EditAdScreen';

// Theme Configuration
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'deepskyblue',
    background: '#F6F6F6',
  },
};

// Navigator Instances
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tabs Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: 'home-outline',
            'Create Ad': 'add-circle-outline',
            Account: 'person-circle-outline',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create Ad" component={CreateAdScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="EditAd" component={EditAdScreen} />
    </Stack.Navigator>
  );
}

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="ForgetScreen" component={ForgetScreen} />
    </Stack.Navigator>
  );
}

// Push Notification Setup
async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission not granted for push notifications!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    Alert.alert('An error occurred while fetching push token.');
    return null;
  }
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigationRef = useRef();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await setDoc(doc(firestore, 'users', user.uid), { pushToken: token }, { merge: true });
            console.log('Push token saved to Firestore');
          } else {
            console.warn('Push token not generated');
          }
        } catch (error) {
          console.error('Error handling token:', error);
        }
      }
      setUser(user);
      setLoading(false);
    });
  
    const unsubscribeNotifications =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { screen, params } = response.notification.request.content.data;
        if (screen && navigationRef.current) {
          navigationRef.current.navigate(screen, params);
        }
      });
  
    return () => {
      unsubscribeAuth();
      unsubscribeNotifications.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="MainStack" component={MainStack} />
          ) : (
            <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
