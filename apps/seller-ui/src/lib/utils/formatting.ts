import { format as formatDateFns, isValid, parseISO } from 'date-fns';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

interface NumberFormatConfig {
  locale?: string;
  currency?: string;
  fallback?: string;
  options?: Intl.NumberFormatOptions;
}

interface DateFormatConfig {
  fallback?: string;
}

const ensureNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const numericValue = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(numericValue) ? numericValue : null;
};

const ensureDate = (value: Date | string | number | null | undefined): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = parseISO(value);
    if (isValid(parsed)) {
      return parsed;
    }
  }

  const fromNumber = new Date(value);
  return isValid(fromNumber) ? fromNumber : null;
};

export const formatCurrency = (
  value: number | string | null | undefined,
  config: NumberFormatConfig = {},
): string => {
  const numericValue = ensureNumber(value);
  if (numericValue === null) {
    return config.fallback ?? '--';
  }

  const { locale = DEFAULT_LOCALE, currency = DEFAULT_CURRENCY, options } = config;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(numericValue);
  } catch (error) {
    console.warn('formatCurrency fallback triggered', error);
    return config.fallback ?? numericValue.toString();
  }
};

export const formatNumber = (
  value: number | string | null | undefined,
  config: NumberFormatConfig = {},
): string => {
  const numericValue = ensureNumber(value);
  if (numericValue === null) {
    return config.fallback ?? '--';
  }

  const { locale = DEFAULT_LOCALE, options } = config;

  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1,
      notation: 'compact',
      ...options,
    }).format(numericValue);
  } catch (error) {
    console.warn('formatNumber fallback triggered', error);
    return config.fallback ?? numericValue.toString();
  }
};

export const formatDate = (
  value: Date | string | number | null | undefined,
  pattern = 'PPP',
  config: DateFormatConfig = {},
): string => {
  const dateValue = ensureDate(value);
  if (!dateValue) {
    return config.fallback ?? '--';
  }

  try {
    return formatDateFns(dateValue, pattern);
  } catch (error) {
    console.warn('formatDate fallback triggered', error);
    return config.fallback ?? dateValue.toDateString();
  }
};
