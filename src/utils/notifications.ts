import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: { title, body, data: data ?? {} },
    trigger: null,
  });
}

export async function sendBudgetAlert(
  categoryName: string,
  spent: number,
  budget: number,
  currency: string
): Promise<void> {
  const percentage = Math.round((spent / budget) * 100);
  await scheduleLocalNotification(
    '⚠️ Budget Alert',
    `You've used ${percentage}% of your ${categoryName} budget. Spent: ${currency} ${spent.toFixed(2)} / ${currency} ${budget.toFixed(2)}`
  );
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
