import { format, parseISO, startOfMonth, endOfMonth, isValid } from 'date-fns';

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, 'MMM d');
  } catch {
    return dateStr;
  }
}

export function formatMonth(dateStr: string): string {
  try {
    const date = parseISO(dateStr + '-01');
    if (!isValid(date)) return dateStr;
    return format(date, 'MMMM yyyy');
  } catch {
    return dateStr;
  }
}

export function getCurrentMonthKey(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getCurrentMonthBounds(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

export function formatTimeAgo(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
