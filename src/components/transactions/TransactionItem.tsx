import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Transaction, Category } from '../../types';
import CategoryIcon from '../common/CategoryIcon';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';

interface Props {
  transaction: Transaction;
  category?: Category;
  currency: string;
  onDelete: (id: string) => void;
}

const SWIPE_THRESHOLD = -80;

export default function TransactionItem({ transaction, category, currency, onDelete }: Props) {
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const confirmDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => { translateX.value = withTiming(0); } },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(transaction.id),
        },
      ]
    );
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -100);
        deleteOpacity.value = Math.min(-e.translationX / 80, 1);
      } else {
        translateX.value = 0;
        deleteOpacity.value = 0;
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        runOnJS(confirmDelete)();
      } else {
        translateX.value = withTiming(0);
        deleteOpacity.value = withTiming(0);
      }
    });

  const itemStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
  }));

  const fallbackCategory: Category = category ?? {
    id: transaction.category_id,
    label: transaction.category_id,
    icon: 'dots-horizontal',
    color: COLORS.textTertiary,
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.deleteAction, deleteStyle]}>
        <MaterialCommunityIcons name="trash-can" size={24} color={COLORS.white} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, itemStyle]}>
          <CategoryIcon category={fallbackCategory} size={44} />
          <View style={styles.details}>
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description || fallbackCategory.label}
            </Text>
            <Text style={styles.meta}>
              {formatTimeAgo(transaction.date)} · {transaction.payment_method}
            </Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              -{formatCurrency(transaction.amount, currency)}
            </Text>
            {transaction.is_auto_detected && (
              <View style={styles.autoBadge}>
                <Text style={styles.autoText}>Auto</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginHorizontal: SPACING.md,
    marginVertical: 4,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  details: {
    flex: 1,
    gap: 3,
  },
  description: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  meta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.danger,
  },
  autoBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  autoText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
