export function formatPriceCents(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-CA", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} $`;
}
