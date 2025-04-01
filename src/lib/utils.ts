import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (num: number, decimals = 0): string => {
  if (num === undefined || num === null) return '0';
  
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
  }).format(num);
};

export const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format a token value with specified decimal places.
 * Converts from wei scale to token scale if fromWei is true.
 * @param {number | string | bigint} value - The token value to format.
 * @param {number} decimalPlaces - Number of decimal places to display.
 * @param {boolean} fromWei - Whether to convert from wei scale.
 * @returns {string} Formatted token value.
 */
export const formatTokenValue = (value: number | string | bigint, decimalPlaces = 2, fromWei = true): string => {
  if (value === undefined || value === null) return '0';
  
  // Handle BigInt by converting to string first
  if (typeof value === 'bigint') {
    value = value.toString();
  }
  
  // Convert to number for calculations
  let numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if value is valid
  if (isNaN(numValue)) return '0';
  
  // Convert from wei scale if needed
  if (fromWei) {
    numValue = numValue / 1e18;
  }
  
  // Format with specified decimal places
  return numValue.toFixed(decimalPlaces);
};

/**
 * Format a value in Ether with specified decimal places.
 * Converts from wei to ETH if fromWei is true.
 * @param {number | string | bigint} value - The value to format (wei or ETH).
 * @param {number} decimalPlaces - Number of decimal places to display.
 * @param {boolean} fromWei - Whether to convert from wei to ETH.
 * @returns {string} Formatted ETH value.
 */
export const formatEthValue = (value: number | string | bigint, decimalPlaces = 4, fromWei = true): string => {
  if (value === undefined || value === null) return '0';
  
  // Handle BigInt by converting to string first
  if (typeof value === 'bigint') {
    value = value.toString();
  }
  
  // Convert to number for calculations
  let numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if value is valid
  if (isNaN(numValue)) return '0';
  
  // Convert from wei to ETH if needed
  if (fromWei) {
    numValue = numValue / 1e18;
  }
  
  // Format with specified decimal places
  return numValue.toFixed(decimalPlaces);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
