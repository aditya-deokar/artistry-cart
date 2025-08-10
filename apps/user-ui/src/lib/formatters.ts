/**
 * Formats a number into an Indian Rupee (INR) currency string.
 * It uses the 'en-IN' locale, which correctly handles the Indian numbering
 * system (e.g., using lakhs and crores separators).
 * Example: 12500 -> ₹12,500.00
 * Example: 150000 -> ₹1,50,000.00
 * 
 * @param price - The price as a number.
 * @returns A formatted currency string for INR.
 */
export const formatPrice = (price: number | null | undefined): string => {
  // Return a default value for clarity if price is not provided
  if (price == null) {
    return "₹0.00";
  }

  // Use the 'en-IN' locale for Indian English and 'INR' for the currency.
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    // Optional: To remove the decimal part for whole numbers, you can use these options
    // minimumFractionDigits: 0,
    // maximumFractionDigits: 2,
  }).format(price);
};