import * as Sharing from 'expo-sharing';
import { Transaction, Category } from '../types';
import { formatDate } from './formatters';

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  currency: string
): Promise<void> {
  const categoryMap: Record<string, string> = {};
  categories.forEach((c) => { categoryMap[c.id] = c.label; });

  const headers = ['Date', 'Amount', 'Currency', 'Category', 'Description', 'Payment Method', 'Auto Detected'];
  const rows = transactions.map((tx) => [
    escapeCsv(formatDate(tx.date)),
    escapeCsv(tx.amount),
    escapeCsv(currency),
    escapeCsv(categoryMap[tx.category_id] ?? tx.category_id),
    escapeCsv(tx.description ?? ''),
    escapeCsv(tx.payment_method),
    escapeCsv(tx.is_auto_detected ? 'Yes' : 'No'),
  ]);

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  try {
    const FileSystem = await import('expo-file-system');
    const fileName = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    const dirPath: string = (FileSystem as any).documentDirectory
      ?? (FileSystem as any).cacheDirectory
      ?? '';
    const filePath = `${dirPath}${fileName}`;
    await (FileSystem as any).writeAsStringAsync(filePath, csvContent, { encoding: 'utf8' });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Expenses',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch {
    throw new Error('CSV export failed');
  }
}
