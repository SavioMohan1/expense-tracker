import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function useTransactions() {
  const { transactions, addTransaction, editTransaction, removeTransaction } = useAppContext();
  return { transactions, addTransaction, editTransaction, removeTransaction };
}

export function useCurrentMonthTransactions() {
  const { transactions } = useAppContext();

  return useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    return transactions.filter((tx) => {
      try {
        const date = parseISO(tx.date);
        return isWithinInterval(date, { start, end });
      } catch {
        return false;
      }
    });
  }, [transactions]);
}

export function useCurrentMonthTotal() {
  const monthTransactions = useCurrentMonthTransactions();
  return useMemo(() => monthTransactions.reduce((sum, tx) => sum + tx.amount, 0), [monthTransactions]);
}

export function useCategoryTotals(txList?: Transaction[]) {
  const { transactions } = useAppContext();
  const source = txList ?? transactions;

  return useMemo(() => {
    const map: Record<string, number> = {};
    source.forEach((tx) => {
      map[tx.category_id] = (map[tx.category_id] ?? 0) + tx.amount;
    });
    return map;
  }, [source]);
}

export function useRecentTransactions(limit = 5) {
  const { transactions } = useAppContext();
  return useMemo(() => transactions.slice(0, limit), [transactions, limit]);
}

export function useFilteredTransactions(
  searchQuery: string,
  categoryFilter: string | null,
  startDate: string | null,
  endDate: string | null
) {
  const { transactions } = useAppContext();

  return useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !searchQuery ||
        tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(tx.amount).includes(searchQuery);

      const matchesCategory = !categoryFilter || tx.category_id === categoryFilter;

      const matchesDateRange =
        (!startDate || tx.date >= startDate) &&
        (!endDate || tx.date <= endDate);

      return matchesSearch && matchesCategory && matchesDateRange;
    });
  }, [transactions, searchQuery, categoryFilter, startDate, endDate]);
}

export function useMonthlyBreakdown(months = 6) {
  const { transactions } = useAppContext();

  return useMemo(() => {
    const monthMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      try {
        const monthKey = format(parseISO(tx.date), 'yyyy-MM');
        monthMap[monthKey] = (monthMap[monthKey] ?? 0) + tx.amount;
      } catch {
        // skip
      }
    });

    const result = Object.entries(monthMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, months)
      .map(([month, total]) => ({ month, total }));

    return result.reverse();
  }, [transactions, months]);
}
