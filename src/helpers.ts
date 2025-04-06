export function prettyPercent(percent: number) {
  if (isNaN(percent)) {
    return "?%";
  }
  return percent.toFixed(2) + "%";
}
