import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Budget, Category, CustomCategory, AppSettings, DetectedExpense } from '../types';
import { BUILT_IN_CATEGORIES } from '../constants/categories';
import {
  getAllTransactions,
  getAllBudgets,
  getAllCustomCategories,
  getAllSettings,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  upsertBudget,
  deleteBudget,
  insertCustomCategory,
  deleteCustomCategory,
  setSetting,
  clearAllData,
} from '../db/queries';
import { useDatabaseReady } from './DatabaseContext';

interface AppContextValue {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  settings: AppSettings;
  detectedExpense: DetectedExpense | null;
  isLoading: boolean;
  addTransaction: (tx: Transaction) => Promise<void>;
  editTransaction: (tx: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  addCustomCategory: (cat: CustomCategory) => Promise<void>;
  removeCustomCategory: (id: string) => Promise<void>;
  updateSettings: (key: keyof AppSettings, value: string) => Promise<void>;
  setDetectedExpense: (expense: DetectedExpense | null) => void;
  refreshData: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isDbReady = useDatabaseReady();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'USD',
    notificationsEnabled: true,
    budgetAlertThreshold: 80,
  });
  const [detectedExpense, setDetectedExpense] = useState<DetectedExpense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories: Category[] = [
    ...BUILT_IN_CATEGORIES,
    ...customCategories.map((c) => ({
      id: c.id,
      label: c.name,
      icon: c.icon,
      color: c.color,
      isCustom: true,
    })),
  ];

  const refreshData = useCallback(async () => {
    if (!isDbReady) return;
    try {
      const [txs, bts, cats, stgs] = await Promise.all([
        getAllTransactions(),
        getAllBudgets(),
        getAllCustomCategories(),
        getAllSettings(),
      ]);
      setTransactions(txs);
      setBudgets(bts);
      setCustomCategories(cats);
      setSettings(stgs);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDbReady]);

  useEffect(() => {
    if (isDbReady) {
      refreshData();
    }
  }, [isDbReady, refreshData]);

  const addTransaction = useCallback(async (tx: Transaction) => {
    await insertTransaction(tx);
    setTransactions((prev) => [tx, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const editTransaction = useCallback(async (tx: Transaction) => {
    await updateTransaction(tx);
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addBudget = useCallback(async (budget: Budget) => {
    await upsertBudget(budget);
    setBudgets((prev) => {
      const filtered = prev.filter((b) => b.category_id !== budget.category_id);
      return [...filtered, budget];
    });
  }, []);

  const removeBudget = useCallback(async (id: string) => {
    await deleteBudget(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addCustomCategory = useCallback(async (cat: CustomCategory) => {
    await insertCustomCategory(cat);
    setCustomCategories((prev) => [...prev, cat]);
  }, []);

  const removeCustomCategory = useCallback(async (id: string) => {
    await deleteCustomCategory(id);
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateSettings = useCallback(async (key: keyof AppSettings, value: string) => {
    await setSetting(key, value);
    setSettings((prev) => ({
      ...prev,
      [key]: key === 'notificationsEnabled' ? value !== 'false' :
             key === 'budgetAlertThreshold' ? parseInt(value, 10) : value,
    }));
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllData();
    setTransactions([]);
    setBudgets([]);
    setCustomCategories([]);
  }, []);

  return (
    <AppContext.Provider value={{
      transactions,
      budgets,
      categories,
      settings,
      detectedExpense,
      isLoading,
      addTransaction,
      editTransaction,
      removeTransaction,
      addBudget,
      removeBudget,
      addCustomCategory,
      removeCustomCategory,
      updateSettings,
      setDetectedExpense,
      refreshData,
      clearAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
