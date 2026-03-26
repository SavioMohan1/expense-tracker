import { DetectedExpense } from '../types';

const SMS_PATTERNS = [
  /(?:debited|deducted|spent|paid)\s+(?:rs\.?|inr|usd|\$|£|€)\s*([\d,]+\.?\d*)/i,
  /a\/c\s+\w+\s+debited\s+(?:inr|rs\.?)\s*([\d,]+\.?\d*)/i,
  /paid\s+(?:rs\.?|inr)\s*([\d,]+\.?\d*)\s+to\s+([^\.]+)/i,
  /payment\s+of\s+(?:rs\.?|inr|\$)\s*([\d,]+\.?\d*)\s+(?:to|at|for)\s+([^\.]+)/i,
  /(?:rs\.?|inr|\$|usd)\s*([\d,]+\.?\d*)\s+(?:debited|deducted|withdrawn)/i,
  /transaction\s+of\s+(?:rs\.?|inr|\$)\s*([\d,]+\.?\d*)/i,
  /(?:purchase|txn)\s+of\s+(?:rs\.?|inr|\$)\s*([\d,]+\.?\d*)/i,
];

const MERCHANT_PATTERNS = [
  /(?:paid|payment)\s+(?:rs\.?|inr|\$)\s*[\d,]+\.?\d*\s+to\s+([^\.]+)/i,
  /at\s+([A-Z][A-Z\s]+?)(?:\s+on|\s+ref|\s+txn|\.|$)/i,
  /(?:to|for)\s+([A-Z][A-Z\s]+?)(?:\s+on|\s+ref|\s+txn|\.|$)/i,
];

export function parseAmount(text: string): number | null {
  for (const pattern of SMS_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(/,/g, '');
      const amount = parseFloat(cleaned);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return null;
}

export function parseMerchant(text: string): string | undefined {
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

export function parseExpenseFromText(text: string): DetectedExpense | null {
  const amount = parseAmount(text);
  if (!amount) return null;

  const merchant = parseMerchant(text);
  return {
    amount,
    merchant,
    rawText: text,
  };
}

export function isPaymentNotification(title: string, body: string): boolean {
  const combined = `${title} ${body}`.toLowerCase();
  const keywords = ['debited', 'deducted', 'payment', 'paid', 'transaction', 'purchase', 'spent', 'withdrawn'];
  return keywords.some((kw) => combined.includes(kw));
}
