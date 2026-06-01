import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { BuyerNavigator } from './BuyerNavigator';

const Stack = createNativeStackNavigator();

const FarmerPlaceholder = () => {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 16, color: '#555', marginBottom: 24 }}>Farmer dashboard coming soon</Text>
      <TouchableOpacity
        onPress={logout}
        style={{ backgroundColor: '#c62828', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const FarmerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FarmerHome" component={FarmerPlaceholder} options={{ title: 'Dashboard' }} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AdminHome" component={PlaceholderScreen} options={{ title: 'Admin' }} />
  </Stack.Navigator>
);

export const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const AppStack = () => {
    if (!user) return <AuthStack />;
    if (user.role === 'farmer') return <FarmerStack />;
    if (user.role === 'admin') return <AdminStack />;
    return <BuyerNavigator />;
  };

  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
};
