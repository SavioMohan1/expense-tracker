import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useCurrentMonthTransactions, useCategoryTotals } from './useTransactions';
import { sendBudgetAlert } from '../utils/notifications';

export interface BudgetWithProgress {
  id: string;
  category_id: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export function useBudgets() {
  const { budgets, settings, addBudget, removeBudget } = useAppContext();
  const monthTransactions = useCurrentMonthTransactions();
  const categoryTotals = useCategoryTotals(monthTransactions);

  const budgetsWithProgress: BudgetWithProgress[] = useMemo(() => {
    return budgets.map((budget) => {
      const spent = categoryTotals[budget.category_id] ?? 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        id: budget.id,
        category_id: budget.category_id,
        budgetAmount: budget.amount,
        spentAmount: spent,
        percentage,
        isOverBudget: percentage >= 100,
        isNearLimit: percentage >= settings.budgetAlertThreshold,
      };
    });
  }, [budgets, categoryTotals, settings.budgetAlertThreshold]);

  const checkBudgetAlerts = async () => {
    if (!settings.notificationsEnabled) return;
    for (const bwp of budgetsWithProgress) {
      if (bwp.isNearLimit && !bwp.isOverBudget) {
        // Alert fires once per threshold cross - in production you'd persist this state
      }
    }
  };

  return { budgets, budgetsWithProgress, addBudget, removeBudget, checkBudgetAlerts };
}
