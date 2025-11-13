
export function formatCurrency(value?: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('vi-VN').format(Math.round(value));
}

export function formatPercentage(value?: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  return `${value.toFixed(2)}%`;
}
