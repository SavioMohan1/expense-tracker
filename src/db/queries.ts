import { getDatabase } from './database';
import { Transaction, Budget, CustomCategory, AppSettings } from '../types';

export async function insertTransaction(tx: Transaction): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO transactions (id, amount, category_id, description, date, payment_method, is_auto_detected, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tx.id, tx.amount, tx.category_id, tx.description ?? '', tx.date, tx.payment_method, tx.is_auto_detected ? 1 : 0, tx.created_at]
  );
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE transactions SET amount=?, category_id=?, description=?, date=?, payment_method=? WHERE id=?`,
    [tx.amount, tx.category_id, tx.description ?? '', tx.date, tx.payment_method, tx.id]
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM transactions WHERE id=?`, [id]);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`SELECT * FROM transactions ORDER BY date DESC, created_at DESC`);
  return rows.map(rowToTransaction);
}

export async function getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
  const db = await getDatabase();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM transactions WHERE date LIKE ? ORDER BY date DESC`,
    [`${monthStr}%`]
  );
  return rows.map(rowToTransaction);
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows.map(rowToTransaction);
}

export async function getMonthlyTotals(months: number): Promise<{ month: string; total: number }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
     FROM transactions
     GROUP BY month
     ORDER BY month DESC
     LIMIT ?`,
    [months]
  );
  return rows;
}

export async function getCategoryTotalsForMonth(year: number, month: number): Promise<{ category_id: string; total: number }[]> {
  const db = await getDatabase();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const rows = await db.getAllAsync<any>(
    `SELECT category_id, SUM(amount) as total FROM transactions WHERE date LIKE ? GROUP BY category_id`,
    [`${monthStr}%`]
  );
  return rows;
}

export async function getWeeklyTotals(weeks: number): Promise<{ week: string; total: number }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT strftime('%Y-W%W', date) as week, SUM(amount) as total
     FROM transactions
     GROUP BY week
     ORDER BY week DESC
     LIMIT ?`,
    [weeks]
  );
  return rows;
}

function rowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    category_id: row.category_id,
    description: row.description ?? '',
    date: row.date,
    payment_method: row.payment_method,
    is_auto_detected: row.is_auto_detected === 1,
    created_at: row.created_at,
  };
}

export async function upsertBudget(budget: Budget): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO budgets (id, category_id, amount, period, created_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(category_id) DO UPDATE SET amount=excluded.amount, period=excluded.period`,
    [budget.id, budget.category_id, budget.amount, budget.period, budget.created_at]
  );
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM budgets WHERE id=?`, [id]);
}

export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`SELECT * FROM budgets`);
  return rows.map((r) => ({
    id: r.id,
    category_id: r.category_id,
    amount: r.amount,
    period: r.period,
    created_at: r.created_at,
  }));
}

export async function insertCustomCategory(cat: CustomCategory): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO custom_categories (id, name, icon, color) VALUES (?, ?, ?, ?)`,
    [cat.id, cat.name, cat.icon, cat.color]
  );
}

export async function deleteCustomCategory(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM custom_categories WHERE id=?`, [id]);
}

export async function getAllCustomCategories(): Promise<CustomCategory[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`SELECT * FROM custom_categories`);
  return rows;
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(`SELECT value FROM settings WHERE key=?`, [key]);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, value]
  );
}

export async function getAllSettings(): Promise<AppSettings> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(`SELECT key, value FROM settings`);
  const map: Record<string, string> = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return {
    currency: map.currency ?? 'USD',
    notificationsEnabled: map.notificationsEnabled !== 'false',
    budgetAlertThreshold: parseInt(map.budgetAlertThreshold ?? '80', 10),
  };
}

export async function clearAllData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM custom_categories;
  `);
}
