import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, parseISO, startOfWeek, getISOWeek, getYear } from 'date-fns';

export function useAnalytics() {
  const { transactions } = useAppContext();

  const monthlyBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      try {
        const key = format(parseISO(tx.date), 'yyyy-MM');
        map[key] = (map[key] ?? 0) + tx.amount;
      } catch {
        // skip invalid dates
      }
    });
    return Object.entries(map)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [transactions]);

  const weeklyBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      try {
        const date = parseISO(tx.date);
        const year = getYear(date);
        const week = getISOWeek(date);
        const key = `${year}-W${String(week).padStart(2, '0')}`;
        map[key] = (map[key] ?? 0) + tx.amount;
      } catch {
        // skip
      }
    });
    return Object.entries(map)
      .map(([week, total]) => ({ week, total }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12);
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      map[tx.category_id] = (map[tx.category_id] ?? 0) + tx.amount;
    });
    return Object.entries(map).map(([category_id, total]) => ({ category_id, total }));
  }, [transactions]);

  const totalAllTime = useMemo(() => transactions.reduce((s, t) => s + t.amount, 0), [transactions]);

  return { monthlyBreakdown, weeklyBreakdown, categoryBreakdown, totalAllTime };
}
