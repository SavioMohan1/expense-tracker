import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-gifted-charts';
import { Category } from '../../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  categoryTotals: Record<string, number>;
  categories: Category[];
  currency: string;
  total: number;
}

export default function CategoryPieChart({ categoryTotals, categories, currency, total }: Props) {
  const data = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([id, value]) => {
      const cat = categories.find((c) => c.id === id);
      return {
        value,
        color: cat?.color ?? COLORS.textTertiary,
        text: cat?.label ?? id,
        id,
      };
    })
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>No spending data yet</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, SHADOWS.small]}>
      <Text style={styles.title}>Spending by Category</Text>
      <View style={styles.chartRow}>
        <PieChart
          data={data}
          donut
          innerRadius={55}
          radius={75}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerTotal}>{formatCurrency(total, currency)}</Text>
              <Text style={styles.centerSub}>Total</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          {data.slice(0, 6).map((item) => (
            <View key={item.id} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <View style={styles.legendText}>
                <Text style={styles.legendLabel} numberOfLines={1}>{item.text}</Text>
                <Text style={styles.legendValue}>{formatCurrency(item.value, currency)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZE.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerTotal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  centerSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  legend: {
    flex: 1,
    gap: SPACING.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
  },
  legendLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});
