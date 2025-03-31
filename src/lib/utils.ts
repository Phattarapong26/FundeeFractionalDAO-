
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

export const formatTokenValue = (value: number | string): string => {
  if (!value) return '0';
  
  // Convert to a number and divide by 10^18 (wei to ether)
  const valueInEther = Number(value) / 1e18;
  
  // Format with up to 6 decimal places
  return valueInEther.toLocaleString('en-US', {
    maximumFractionDigits: 6,
    minimumFractionDigits: valueInEther < 0.000001 ? 6 : 2,
  });
};

export const formatEthValue = (value: number | string, decimals = 4): string => {
  if (!value) return '0 ETH';
  
  // Convert to a number if it's a string
  const numValue = typeof value === 'string' ? Number(value) : value;
  
  // If the value is in wei (10^18), convert to ETH
  const valueInEth = numValue >= 1e12 ? numValue / 1e18 : numValue;
  
  return `${valueInEth.toLocaleString('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: valueInEth < 0.0001 ? 6 : decimals,
  })} ETH`;
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
