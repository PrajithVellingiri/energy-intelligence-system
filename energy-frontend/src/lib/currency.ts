// Currency formatting utilities

const USD_TO_INR = 83; // Conversion rate

export function formatINR(usdValue: number, compact: boolean = false): string {
  const inrValue = usdValue * USD_TO_INR;
  
  if (compact && inrValue >= 100000) {
    return `₹${(inrValue / 100000).toFixed(1)}L`;
  } else if (compact && inrValue >= 1000) {
    return `₹${(inrValue / 1000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inrValue);
}

export function formatINRCompact(usdValue: number): string {
  return formatINR(usdValue, true);
}
