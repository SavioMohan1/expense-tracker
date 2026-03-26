import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SpendingSummaryCard from '../components/dashboard/SpendingSummaryCard';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import BudgetProgressCard from '../components/dashboard/BudgetProgressCard';
import TransactionItem from '../components/transactions/TransactionItem';
import AutoDetectBanner from '../components/common/AutoDetectBanner';
import EmptyState from '../components/common/EmptyState';
import { useAppContext } from '../context/AppContext';
import { useCurrentMonthTransactions, useCurrentMonthTotal, useCategoryTotals, useRecentTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { useNotifications } from '../hooks/useNotifications';
import { formatCurrency } from '../utils/formatters';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { categories, settings, isLoading, refreshData } = useAppContext();
  const monthTransactions = useCurrentMonthTransactions();
  const monthTotal = useCurrentMonthTotal();
  const categoryTotals = useCategoryTotals(monthTransactions);
  const recentTransactions = useRecentTransactions(5);
  const { budgetsWithProgress, removeBudget } = useBudgets();
  const { removeTransaction } = useAppContext();
  useNotifications();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AutoDetectBanner />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()}</Text>
          <Text style={styles.headerTitle}>ExpenseTracker</Text>
        </View>
        <TouchableOpacity
          style={styles.budgetBtn}
          onPress={() => navigation.navigate('BudgetsModal')}
        >
          <MaterialCommunityIcons name="wallet" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
      >
        <SpendingSummaryCard
          totalSpent={monthTotal}
          transactionCount={monthTransactions.length}
          currency={settings.currency}
          formattedAmount={formatCurrency(monthTotal, settings.currency)}
        />

        <CategoryPieChart
          categoryTotals={categoryTotals}
          categories={categories}
          currency={settings.currency}
          total={monthTotal}
        />

        <BudgetProgressCard
          budgets={budgetsWithProgress}
          categories={categories}
          currency={settings.currency}
          onManageBudgets={() => navigation.navigate('BudgetsModal')}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={[styles.emptyCard, SHADOWS.small]}>
              <EmptyState
                icon="receipt-outline"
                title="No transactions yet"
                subtitle="Tap the + button to add your first expense"
              />
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={categories.find((c) => c.id === tx.category_id)}
                currency={settings.currency}
                onDelete={(id) => removeTransaction(id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning ☀️';
  if (h < 17) return 'afternoon 🌤️';
  return 'evening 🌙';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  budgetBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  section: {
    marginTop: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
  },
});
