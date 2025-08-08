// src/lib/formatters.ts

/**
 * Formats a number into a USD currency string.
 * Example: 120 -> $120.00
 * @param price - The price as a number.
 * @returns A formatted currency string.
 */
export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) {
    return ""; // Return empty string or a default like "$0.00" if you prefer
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};