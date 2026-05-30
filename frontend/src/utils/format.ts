export function formatCurrency(
  value: number | string | undefined | null,
  opts?: { minFraction?: number; maxFraction?: number },
) {
  const num = Number(value ?? 0) || 0;
  const min = typeof opts?.minFraction === "number" ? opts!.minFraction : 0;
  const max = typeof opts?.maxFraction === "number" ? opts!.maxFraction : min;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
    useGrouping: true,
  }).format(num);
}

export default formatCurrency;
