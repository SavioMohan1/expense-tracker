import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('expense_tracker.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category_id TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      is_auto_detected INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      period TEXT DEFAULT 'monthly',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS custom_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'USD');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('notificationsEnabled', 'true');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('budgetAlertThreshold', '80');
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
