import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from './src/context/DatabaseContext';
import { AppProvider } from './src/context/AppContext';
import { paperTheme } from './src/constants/theme';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <DatabaseProvider>
      <AppProvider>
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar style="auto" />
              <RootNavigator />
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </PaperProvider>
      </AppProvider>
    </DatabaseProvider>
  );
}
