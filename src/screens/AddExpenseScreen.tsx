import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import CategorySelector from '../components/expenses/CategorySelector';
import { useAppContext } from '../context/AppContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { PAYMENT_METHODS } from '../constants/categories';
import { PaymentMethod } from '../types';
import { RootStackParamList } from '../navigation/types';
import { sendBudgetAlert } from '../utils/notifications';
import { useBudgets } from '../hooks/useBudgets';

const schema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Enter a valid amount'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  payment_method: z.string(),
});

type FormData = z.infer<typeof schema>;

type RouteType = RouteProp<RootStackParamList, 'AddExpenseModal'>;

export default function AddExpenseScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteType>();
  const { categories, settings, addTransaction } = useAppContext();
  const { budgetsWithProgress } = useBudgets();

  const prefillAmount = route.params?.prefillAmount;
  const prefillMerchant = route.params?.prefillMerchant;

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? 'food');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: prefillAmount ? String(prefillAmount) : '',
      description: prefillMerchant ?? '',
      date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'cash',
    },
  });

  const onSubmit = useCallback(async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const tx = {
        id: uuidv4(),
        amount: parseFloat(data.amount),
        category_id: selectedCategory,
        description: data.description ?? '',
        date: data.date,
        payment_method: data.payment_method as PaymentMethod,
        is_auto_detected: !!prefillAmount,
        created_at: now,
      };

      await addTransaction(tx);

      const budget = budgetsWithProgress.find((b) => b.category_id === selectedCategory);
      if (budget && settings.notificationsEnabled) {
        const newSpent = budget.spentAmount + tx.amount;
        const newPct = (newSpent / budget.budgetAmount) * 100;
        const cat = categories.find((c) => c.id === selectedCategory);
        if (newPct >= settings.budgetAlertThreshold && budget.percentage < settings.budgetAlertThreshold) {
          await sendBudgetAlert(
            cat?.label ?? selectedCategory,
            newSpent,
            budget.budgetAmount,
            settings.currency
          );
        }
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCategory, addTransaction, navigation, budgetsWithProgress, settings, categories, prefillAmount]);

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.md }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Add Expense</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>
                  {getCurrencySymbol(settings.currency)}
                </Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textTertiary}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={COLORS.text}
                  autoFocus={!prefillAmount}
                />
              </View>
            )}
          />
          {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <CategorySelector
              categories={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </View>

          <View style={styles.section}>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  label="Description (optional)"
                  mode="outlined"
                  style={styles.input}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              )}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfSection}>
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    label="Date"
                    mode="outlined"
                    style={styles.input}
                    outlineColor={COLORS.border}
                    activeOutlineColor={COLORS.primary}
                    placeholder="YYYY-MM-DD"
                  />
                )}
              />
              {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}
            </View>

            <View style={styles.halfSection}>
              <Controller
                control={control}
                name="payment_method"
                render={({ field: { value, onChange } }) => (
                  <View>
                    <Text style={styles.fieldLabel}>Payment</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.paymentMethods}>
                        {PAYMENT_METHODS.map((pm) => (
                          <TouchableOpacity
                            key={pm.value}
                            style={[
                              styles.paymentChip,
                              value === pm.value && styles.selectedPaymentChip,
                            ]}
                            onPress={() => onChange(pm.value)}
                          >
                            <Text style={[
                              styles.paymentChipText,
                              value === pm.value && styles.selectedPaymentChipText,
                            ]}>
                              {pm.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    AUD: 'A$', CAD: 'C$', CHF: 'Fr', SGD: 'S$',
  };
  return symbols[code] ?? code;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  currencySymbol: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  amountInput: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    backgroundColor: 'transparent',
    minWidth: 120,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    fontSize: FONT_SIZE.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  halfSection: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  paymentChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  selectedPaymentChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedPaymentChipText: {
    color: COLORS.white,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginVertical: SPACING.md,
    ...SHADOWS.medium,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});
