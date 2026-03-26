import { useEffect } from 'react';
import { Platform, AppState } from 'react-native';
import { useAppContext } from '../context/AppContext';

export function useSmsParser() {
  const { setDetectedExpense } = useAppContext();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // SMS reading requires a native module (expo-sms or a custom module).
    // In a bare workflow this would use react-native-get-sms-android.
    // In managed workflow we rely on notification interception instead.
    // This hook is a placeholder for future native SMS integration.
  }, [setDetectedExpense]);
}
