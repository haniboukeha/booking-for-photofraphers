export function formatMoney(amount: number, currency = "DZD"): string {
  return `${amount.toLocaleString("en-US")} ${currency}`;
}
