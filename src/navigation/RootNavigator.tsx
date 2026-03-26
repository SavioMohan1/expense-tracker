import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import { RootStackParamList } from './types';
import { COLORS } from '../constants/theme';
import { useDatabaseReady } from '../context/DatabaseContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isReady = useDatabaseReady();

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="AddExpenseModal"
          component={AddExpenseScreen}
          options={{
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="BudgetsModal"
          component={BudgetsScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
