import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { BudgetWithProgress } from '../../hooks/useBudgets';
import { Category } from '../../types';
import CategoryIcon from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  budgets: BudgetWithProgress[];
  categories: Category[];
  currency: string;
  onManageBudgets: () => void;
}

export default function BudgetProgressCard({ budgets, categories, currency, onManageBudgets }: Props) {
  if (budgets.length === 0) {
    return (
      <View style={[styles.container, SHADOWS.small]}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget Overview</Text>
        </View>
        <TouchableOpacity style={styles.emptyState} onPress={onManageBudgets}>
          <MaterialCommunityIcons name="plus-circle-outline" size={36} color={COLORS.primary} />
          <Text style={styles.emptyText}>Set monthly budgets</Text>
          <Text style={styles.emptySubtext}>Track spending by category</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, SHADOWS.small]}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
        <TouchableOpacity onPress={onManageBudgets}>
          <Text style={styles.manageText}>Manage</Text>
        </TouchableOpacity>
      </View>
      {budgets.slice(0, 4).map((budget) => {
        const category = categories.find((c) => c.id === budget.category_id);
        if (!category) return null;
        const progressColor = budget.isOverBudget
          ? COLORS.danger
          : budget.isNearLimit
          ? COLORS.warning
          : COLORS.success;

        return (
          <View key={budget.id} style={styles.budgetRow}>
            <CategoryIcon category={category} size={36} />
            <View style={styles.budgetInfo}>
              <View style={styles.budgetHeader}>
                <Text style={styles.categoryName}>{category.label}</Text>
                <Text style={[styles.percentage, { color: progressColor }]}>
                  {Math.round(budget.percentage)}%
                </Text>
              </View>
              <ProgressBar
                progress={Math.min(budget.percentage / 100, 1)}
                color={progressColor}
                style={styles.progressBar}
              />
              <View style={styles.amounts}>
                <Text style={styles.spent}>{formatCurrency(budget.spentAmount, currency)}</Text>
                <Text style={styles.budgetAmount}>of {formatCurrency(budget.budgetAmount, currency)}</Text>
              </View>
            </View>
          </View>
        );
      })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  manageText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  budgetInfo: {
    flex: 1,
    gap: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  percentage: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceVariant,
  },
  amounts: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  spent: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  budgetAmount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});
