import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { CURRENCIES } from '../constants/currencies';
import { exportTransactionsToCSV } from '../utils/csvExport';
import { requestNotificationPermissions } from '../utils/notifications';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, transactions, categories, clearAll } = useAppContext();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCurrencySelect = async (code: string) => {
    await updateSettings('currency', code);
    setShowCurrencyModal(false);
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
        return;
      }
    }
    await updateSettings('notificationsEnabled', String(value));
  };

  const handleExport = async () => {
    if (transactions.length === 0) {
      Alert.alert('No Data', 'There are no transactions to export.');
      return;
    }
    setIsExporting(true);
    try {
      await exportTransactionsToCSV(transactions, categories, settings.currency);
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions and budgets. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === settings.currency);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={[styles.card, SHADOWS.small]}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowCurrencyModal(true)}
            >
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons name="currency-usd" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Currency</Text>
                <Text style={styles.rowValue}>{currentCurrency?.symbol} {currentCurrency?.name}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: COLORS.warning + '20' }]}>
                <MaterialCommunityIcons name="bell" size={22} color={COLORS.warning} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Budget Notifications</Text>
                <Text style={styles.rowSubtitle}>Alert when near budget limit</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleNotificationToggle}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: COLORS.success + '20' }]}>
                <MaterialCommunityIcons name="percent" size={22} color={COLORS.success} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Alert Threshold</Text>
                <Text style={styles.rowSubtitle}>Notify at {settings.budgetAlertThreshold}% of budget</Text>
              </View>
              <View style={styles.thresholdButtons}>
                {[70, 80, 90].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.thresholdBtn,
                      settings.budgetAlertThreshold === val && styles.thresholdBtnActive,
                    ]}
                    onPress={() => updateSettings('budgetAlertThreshold', String(val))}
                  >
                    <Text style={[
                      styles.thresholdBtnText,
                      settings.budgetAlertThreshold === val && styles.thresholdBtnTextActive,
                    ]}>{val}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={[styles.card, SHADOWS.small]}>
            <TouchableOpacity
              style={styles.row}
              onPress={handleExport}
              disabled={isExporting}
            >
              <View style={[styles.rowIcon, { backgroundColor: COLORS.success + '20' }]}>
                <MaterialCommunityIcons name="file-export" size={22} color={COLORS.success} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Export to CSV</Text>
                <Text style={styles.rowSubtitle}>{transactions.length} transactions</Text>
              </View>
              {isExporting
                ? <MaterialCommunityIcons name="loading" size={22} color={COLORS.textTertiary} />
                : <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textTertiary} />
              }
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.row} onPress={handleClearData}>
              <View style={[styles.rowIcon, { backgroundColor: COLORS.danger + '20' }]}>
                <MaterialCommunityIcons name="trash-can" size={22} color={COLORS.danger} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: COLORS.danger }]}>Clear All Data</Text>
                <Text style={styles.rowSubtitle}>Delete all transactions & budgets</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <MaterialCommunityIcons name="information" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>ExpenseTracker</Text>
                <Text style={styles.rowSubtitle}>Version 1.0.0 · 100% offline</Text>
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <MaterialCommunityIcons name="lock" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Privacy</Text>
                <Text style={styles.rowSubtitle}>All data stays on your device</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Currency</Text>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyRow,
                    item.code === settings.currency && styles.selectedCurrencyRow,
                  ]}
                  onPress={() => handleCurrencySelect(item.code)}
                >
                  <Text style={styles.currencySymbol}>{item.symbol}</Text>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyCode}>{item.code}</Text>
                    <Text style={styles.currencyName}>{item.name}</Text>
                  </View>
                  {item.code === settings.currency && (
                    <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  section: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: SPACING.xs,
    marginBottom: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  thresholdButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  thresholdBtn: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thresholdBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  thresholdBtnText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  thresholdBtnTextActive: {
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  selectedCurrencyRow: {
    backgroundColor: COLORS.primary + '10',
  },
  currencySymbol: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    width: 36,
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  currencyName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
