import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { format } from 'date-fns';

interface Props {
  totalSpent: number;
  transactionCount: number;
  currency: string;
  formattedAmount: string;
}

export default function SpendingSummaryCard({ totalSpent, transactionCount, currency, formattedAmount }: Props) {
  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <View style={[styles.container, SHADOWS.medium]}>
      <View style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.label}>Total Spending</Text>
          <Text style={styles.month}>{currentMonth}</Text>
        </View>
        <Text style={styles.amount}>{formattedAmount}</Text>
        <View style={styles.footer}>
          <MaterialCommunityIcons name="receipt" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.footerText}>{transactionCount} transactions</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  month: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  amount: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.8)',
  },
});
