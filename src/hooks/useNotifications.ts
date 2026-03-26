import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { parseExpenseFromText, isPaymentNotification } from '../utils/smsPatterns';
import { requestNotificationPermissions } from '../utils/notifications';

export function useNotifications() {
  const { setDetectedExpense, settings } = useAppContext();
  const [hasPermission, setHasPermission] = useState(false);
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    listenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title ?? '';
      const body = notification.request.content.body ?? '';

      if (isPaymentNotification(title, body)) {
        const detected = parseExpenseFromText(`${title} ${body}`);
        if (detected) {
          setDetectedExpense(detected);
        }
      }
    });

    return () => {
      listenerRef.current?.remove();
    };
  }, [settings.notificationsEnabled, setDetectedExpense]);

  const requestPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    return granted;
  };

  return { hasPermission, requestPermissions };
}
