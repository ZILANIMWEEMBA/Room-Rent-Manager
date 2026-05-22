import { Booking } from './types';

/**
 * Calculates precisely the number of days left until a room becomes free.
 * Handles overdue contracts with detailed past-due descriptors.
 */
export function getDaysRemainingToFree(booking: Booking | undefined, todayStr: string): {
  days: number;
  label: string;
  status: 'expired' | 'due-today' | 'soon' | 'distant' | 'none';
} {
  if (!booking || booking.status !== 'Active') {
    return { days: 0, label: 'No active booking', status: 'none' };
  }
  
  const today = new Date(todayStr + 'T00:00:00');
  const end = new Date(booking.endDate + 'T00:00:00');
  
  // Difference in milliseconds
  const diffTime = end.getTime() - today.getTime();
  // Convert to whole days
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      days: diffDays,
      label: `Overdue by ${absDays} day${absDays > 1 ? 's' : ''}`,
      status: 'expired'
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      label: 'Due to free today',
      status: 'due-today'
    };
  } else if (diffDays <= 7) {
    return {
      days: diffDays,
      label: `${diffDays} day${diffDays > 1 ? 's' : ''} left`,
      status: 'soon'
    };
  } else {
    return {
      days: diffDays,
      label: `${diffDays} day${diffDays > 1 ? 's' : ''} left`,
      status: 'distant'
    };
  }
}

/**
 * Formats a currency number in USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats YYYY-MM-DD to Month DD, YYYY
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Safe local storage getter/setter helpers
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing localStorage key "${key}":`, e);
    }
  }
};
