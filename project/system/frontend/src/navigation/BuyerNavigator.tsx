import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import HomeFeedScreen from '../screens/buyer/HomeFeedScreen';
import MapViewScreen from '../screens/buyer/MapViewScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Placeholder screens for tabs not yet built
const PlaceholderScreen = () => null;

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeFeed" component={HomeFeedScreen} options={{ title: 'Browse' }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
    <Stack.Screen name="FarmerProfile" component={PlaceholderScreen} options={{ title: 'Farmer' }} />
  </Stack.Navigator>
);

const MapStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Map" component={MapViewScreen} options={{ title: 'Nearby' }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
  </Stack.Navigator>
);

export const BuyerNavigator = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2E7D32' }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStack}
      options={{ tabBarLabel: 'Browse', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏪</Text> }}
    />
    <Tab.Screen
      name="MapTab"
      component={MapStack}
      options={{ tabBarLabel: 'Nearby', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📍</Text> }}
    />
    <Tab.Screen
      name="CartTab"
      component={PlaceholderScreen}
      options={{ tabBarLabel: 'Cart', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛒</Text> }}
    />
    <Tab.Screen
      name="OrdersTab"
      component={PlaceholderScreen}
      options={{ tabBarLabel: 'Orders', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📦</Text> }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={PlaceholderScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
    />
  </Tab.Navigator>
);
