import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AccueilScreen from './screens/AccueilScreen';
import ScanScreen from './screens/ScanScreen';

const Pile = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Pile.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1565C0' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Pile.Screen
          name="Accueil"
          component={AccueilScreen}
          options={{ title: 'MonTour' }}
        />
        <Pile.Screen
          name="Scan"
          component={ScanScreen}
          options={{ title: 'Scanner un ticket', presentation: 'modal' }}
        />
      </Pile.Navigator>
    </NavigationContainer>
  );
}
