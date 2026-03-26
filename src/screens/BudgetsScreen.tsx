import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useBudgets } from '../hooks/useBudgets';
import { useAppContext } from '../context/AppContext';
import CategoryIcon from '../components/common/CategoryIcon';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/formatters';
import { requestNotificationPermissions } from '../utils/notifications';

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { categories, settings } = useAppContext();
  const { budgetsWithProgress, budgets, addBudget, removeBudget } = useBudgets();

  const [showModal, setShowModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? '');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const existingBudgetIds = new Set(budgets.map((b) => b.category_id));

  const handleAddBudget = async () => {
    if (!budgetAmount || isNaN(parseFloat(budgetAmount)) || parseFloat(budgetAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
      return;
    }
    setIsSaving(true);
    try {
      const hasPermission = await requestNotificationPermissions();
      await addBudget({
        id: uuidv4(),
        category_id: selectedCategoryId,
        amount: parseFloat(budgetAmount),
        period: 'monthly',
        created_at: new Date().toISOString(),
      });
      setBudgetAmount('');
      setShowModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save budget.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, categoryName: string) => {
    Alert.alert(
      'Remove Budget',
      `Remove the budget for ${categoryName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeBudget(id) },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Monthly Budgets</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <MaterialCommunityIcons name="plus" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgetsWithProgress}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="wallet-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No budgets set</Text>
            <Text style={styles.emptySubtitle}>Set spending limits to stay on track</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyAddText}>Set a budget</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const category = categories.find((c) => c.id === item.category_id);
          if (!category) return null;

          const progressColor = item.isOverBudget
            ? COLORS.danger
            : item.isNearLimit
            ? COLORS.warning
            : COLORS.success;

          const remaining = item.budgetAmount - item.spentAmount;

          return (
            <View style={[styles.budgetCard, SHADOWS.small]}>
              <View style={styles.budgetCardHeader}>
                <CategoryIcon category={category} size={44} />
                <View style={styles.budgetInfo}>
                  <Text style={styles.categoryName}>{category.label}</Text>
                  <Text style={styles.budgetPeriod}>Monthly budget</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, category.label)}
                  style={styles.deleteBtn}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>

              <ProgressBar
                progress={Math.min(item.percentage / 100, 1)}
                color={progressColor}
                style={styles.progressBar}
              />

              <View style={styles.budgetAmounts}>
                <View>
                  <Text style={styles.amountLabel}>Spent</Text>
                  <Text style={[styles.amountValue, { color: progressColor }]}>
                    {formatCurrency(item.spentAmount, settings.currency)}
                  </Text>
                </View>
                <View style={styles.percentageBadge}>
                  <Text style={[styles.percentageText, { color: progressColor }]}>
                    {Math.round(item.percentage)}%
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.amountLabel}>
                    {item.isOverBudget ? 'Over by' : 'Remaining'}
                  </Text>
                  <Text style={[styles.amountValue, { color: item.isOverBudget ? COLORS.danger : COLORS.success }]}>
                    {formatCurrency(Math.abs(remaining), settings.currency)}
                  </Text>
                </View>
              </View>

              <View style={styles.totalBudget}>
                <Text style={styles.totalBudgetText}>
                  Budget: {formatCurrency(item.budgetAmount, settings.currency)} / month
                </Text>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + SPACING.md }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Set Budget</Text>

            <Text style={styles.modalLabel}>Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategoryId === item.id && { backgroundColor: item.color + '25', borderColor: item.color },
                  ]}
                  onPress={() => setSelectedCategoryId(item.id)}
                >
                  <CategoryIcon category={item} size={28} />
                  <Text style={[styles.categoryChipText, selectedCategoryId === item.id && { color: item.color }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TextInput
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              label="Monthly Budget Amount"
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.modalInput}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              left={<TextInput.Affix text={getCurrencySymbol(settings.currency)} />}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleAddBudget}
                disabled={isSaving}
              >
                <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save Budget'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  emptyAddBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyAddText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZE.md,
  },
  budgetCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  budgetInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  budgetPeriod: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceVariant,
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  percentageBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.full,
  },
  percentageText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  totalBudget: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
  },
  totalBudgetText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    gap: SPACING.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryList: {
    gap: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  categoryChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  modalInput: {
    backgroundColor: COLORS.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    fontWeight: '700',
  },
});
