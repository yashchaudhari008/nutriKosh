export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateFull(dateString) {
  // Input: "2026-09-22", Output: "22 September 2026"
  const date = new Date(dateString + "T00:00:00");
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
