export function prettyPercent(percent: number) {
  if (isNaN(percent)) {
    return "?%";
  }
  return percent.toFixed(2) + "%";
}

export function prettyHex(value: String) {
  const num = Number(value);
  if (isNaN(num)) {
    return "";
  }
  return "0x" + num.toString(16);
}
