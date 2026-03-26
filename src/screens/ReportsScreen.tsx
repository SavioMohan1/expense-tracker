import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAppContext } from '../context/AppContext';
import CategoryIcon from '../components/common/CategoryIcon';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency, formatMonth } from '../utils/formatters';
import { format, parseISO } from 'date-fns';

type ViewMode = 'monthly' | 'weekly' | 'categories';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { categories, settings } = useAppContext();
  const { monthlyBreakdown, weeklyBreakdown, categoryBreakdown, totalAllTime } = useAnalytics();
  const [mode, setMode] = useState<ViewMode>('monthly');

  const barData = mode === 'monthly'
    ? monthlyBreakdown.map((item) => ({
        value: item.total,
        label: item.month.slice(5),
        frontColor: COLORS.primary,
        topLabelComponent: () => null,
      }))
    : mode === 'weekly'
    ? weeklyBreakdown.map((item) => ({
        value: item.total,
        label: item.week.slice(-3),
        frontColor: COLORS.primaryLight,
        topLabelComponent: () => null,
      }))
    : [];

  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.total - a.total);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.totalCard, SHADOWS.medium]}>
          <Text style={styles.totalLabel}>All-Time Spending</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAllTime, settings.currency)}</Text>
          <Text style={styles.totalSub}>Across {monthlyBreakdown.length} months</Text>
        </View>

        <View style={[styles.card, SHADOWS.small]}>
          <View style={styles.tabRow}>
            {(['monthly', 'weekly', 'categories'] as ViewMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, mode === m && styles.activeTab]}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.tabText, mode === m && styles.activeTabText]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode !== 'categories' ? (
            barData.length > 0 ? (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>
                  {mode === 'monthly' ? 'Monthly Spending' : 'Weekly Spending'}
                </Text>
                <BarChart
                  data={barData}
                  barWidth={barData.length > 8 ? 20 : 32}
                  spacing={barData.length > 8 ? 8 : 16}
                  roundedTop
                  hideRules
                  xAxisThickness={1}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: COLORS.textTertiary, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: COLORS.textTertiary, fontSize: 10 }}
                  noOfSections={4}
                  maxValue={Math.max(...barData.map((d) => d.value)) * 1.2}
                  isAnimated
                />
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <MaterialCommunityIcons name="chart-bar-stacked" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyChartText}>No data yet</Text>
              </View>
            )
          ) : (
            <View style={styles.categoriesList}>
              {sortedCategories.length === 0 ? (
                <View style={styles.emptyChart}>
                  <MaterialCommunityIcons name="chart-pie-outline" size={48} color={COLORS.textTertiary} />
                  <Text style={styles.emptyChartText}>No spending data</Text>
                </View>
              ) : (
                sortedCategories.map((item, index) => {
                  const cat = categories.find((c) => c.id === item.category_id);
                  if (!cat) return null;
                  const totalForPct = sortedCategories.reduce((s, i) => s + i.total, 0);
                  const pct = totalForPct > 0 ? (item.total / totalForPct) * 100 : 0;

                  return (
                    <View key={item.category_id} style={styles.categoryRow}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                      <CategoryIcon category={cat} size={36} />
                      <View style={styles.categoryInfo}>
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryLabel}>{cat.label}</Text>
                          <Text style={styles.categoryPct}>{pct.toFixed(1)}%</Text>
                        </View>
                        <View style={styles.categoryBarBg}>
                          <View style={[styles.categoryBarFill, { width: `${pct}%` as any, backgroundColor: cat.color }]} />
                        </View>
                        <Text style={styles.categoryTotal}>{formatCurrency(item.total, settings.currency)}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>

        {mode === 'monthly' && monthlyBreakdown.length > 0 && (
          <View style={[styles.card, SHADOWS.small]}>
            <Text style={styles.chartTitle}>Spending Trend</Text>
            <LineChart
              data={monthlyBreakdown.map((item) => ({ value: item.total }))}
              color={COLORS.primary}
              thickness={2.5}
              startFillColor={COLORS.primary}
              endFillColor={COLORS.primary + '10'}
              areaChart
              curved
              hideDataPoints={monthlyBreakdown.length > 6}
              dataPointsColor={COLORS.primary}
              yAxisThickness={0}
              xAxisThickness={1}
              yAxisTextStyle={{ color: COLORS.textTertiary, fontSize: 10 }}
              noOfSections={4}
              isAnimated
            />
          </View>
        )}
      </ScrollView>
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
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
    color: COLORS.white,
    marginVertical: SPACING.xs,
  },
  totalSub: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chartContainer: {
    gap: SPACING.sm,
  },
  chartTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyChartText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textTertiary,
  },
  categoriesList: {
    gap: SPACING.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rankText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textTertiary,
    width: 24,
  },
  categoryInfo: {
    flex: 1,
    gap: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryPct: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryTotal: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});
