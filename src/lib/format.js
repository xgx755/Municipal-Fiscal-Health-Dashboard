export function formatDollars(value) {
  if (value == null) return "N/A";
  return "$" + Math.round(value).toLocaleString("en-US");
}

export function formatPct(value, decimals = 1) {
  if (value == null) return "N/A";
  return (value * 100).toFixed(decimals) + "%";
}

export function formatPctValue(value, decimals = 1) {
  if (value == null) return "N/A";
  return value.toFixed(decimals) + "%";
}

export function formatRate(value) {
  if (value == null) return "N/A";
  return "$" + value.toFixed(4);
}

export function formatPopulation(value) {
  if (value == null) return "N/A";
  return value.toLocaleString("en-US");
}

export function formatCompact(value) {
  if (value == null) return "N/A";
  if (Math.abs(value) >= 1e9) return "$" + (value / 1e9).toFixed(1) + "B";
  if (Math.abs(value) >= 1e6) return "$" + (value / 1e6).toFixed(1) + "M";
  if (Math.abs(value) >= 1e3) return "$" + (value / 1e3).toFixed(0) + "K";
  return "$" + value.toLocaleString("en-US");
}
